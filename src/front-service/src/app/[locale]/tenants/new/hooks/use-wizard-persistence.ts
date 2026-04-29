'use client';

import { useEffect, useRef, useState } from 'react';
import type { WizardState } from '../interfaces';

const STORAGE_KEY = 'tenantWizard:draft';
// v2: WizardStepKey collapsed phoneStrategy + phonePicker into phoneAcquisition;
// drafts from v1 carry stale step values that no longer exist on the machine,
// so we discard them rather than half-restore.
const STORAGE_VERSION = 2;
const MAX_AGE_DAYS = 7;
const SAVE_DEBOUNCE_MS = 500;

interface StoredDraft {
  version: number;
  userId: string;
  savedAt: string;
  state: WizardState;
}

interface UseWizardPersistenceResult {
  /** True when a non-expired draft for the current user exists in localStorage. */
  hasDraft: boolean;
  /** ISO timestamp from the saved draft, used in the resume banner copy. */
  draftSavedAt: string | null;
  /**
   * Reads the stored state. Returns null when there's nothing to load —
   * the caller hydrates its useState slots from the returned object.
   */
  loadDraft: () => WizardState | null;
  /**
   * Drops the saved draft and resets the hasDraft flag so the resume
   * banner disappears. Call after a successful submit or when the user
   * picks "Start over".
   */
  clearDraft: () => void;
}

/**
 * localStorage-backed persistence for the in-flight tenant wizard.
 * Survives page reloads / accidental tab closes — including, critically,
 * a phone purchase that's been made but not yet attached to a tenant
 * (the pendingPurchaseId would otherwise be lost and the operator would
 * keep billing us until the cleanup cron releases the orphan).
 *
 * Behavior:
 *   - Saves are debounced 500ms so rapid keystrokes don't thrash storage.
 *   - Drafts are scoped per `userId`; switching accounts doesn't surface
 *     the previous user's draft.
 *   - Drafts older than 7 days are ignored on read (treated as missing).
 *   - On version mismatch the stored draft is dropped — wizard schema
 *     changes don't try to migrate old drafts, they just start over.
 *
 * Caller wires it like this:
 *   const persistence = useWizardPersistence(currentState, userId);
 *   // banner: persistence.hasDraft → "Resume / Start over"
 *   // resume: const draft = persistence.loadDraft(); hydrate useStates
 *   // start over: persistence.clearDraft()
 *   // submit success: persistence.clearDraft()
 */
export const useWizardPersistence = (currentState: WizardState, userId: string | null): UseWizardPersistenceResult => {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const lastSavedJsonRef = useRef<string | null>(null);

  // On mount / userId change: check whether a usable draft exists.
  useEffect(() => {
    if (!userId) {
      setHasDraft(false);
      setDraftSavedAt(null);
      return;
    }
    const draft = readDraft(userId);
    if (draft) {
      setHasDraft(true);
      setDraftSavedAt(draft.savedAt);
    } else {
      setHasDraft(false);
      setDraftSavedAt(null);
    }
  }, [userId]);

  // Debounced save on every state change. Skips re-saves of identical
  // serialized payloads so we don't bump savedAt without real changes.
  useEffect(() => {
    if (!userId) return;
    const handle = window.setTimeout(() => {
      const draft: StoredDraft = {
        version: STORAGE_VERSION,
        userId,
        savedAt: new Date().toISOString(),
        state: currentState,
      };
      const serialized = JSON.stringify(draft);
      if (lastSavedJsonRef.current === serialized) return;
      try {
        window.localStorage.setItem(STORAGE_KEY, serialized);
        lastSavedJsonRef.current = serialized;
      } catch {
        // Quota / disabled storage — silently skip; the cleanup cron
        // and a new wizard run cover the worst case.
      }
    }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [currentState, userId]);

  return {
    hasDraft,
    draftSavedAt,
    loadDraft: () => {
      if (!userId) return null;
      return readDraft(userId)?.state ?? null;
    },
    clearDraft: () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      lastSavedJsonRef.current = null;
      setHasDraft(false);
      setDraftSavedAt(null);
    },
  };
};

function readDraft(userId: string): StoredDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    if (parsed.version !== STORAGE_VERSION) return null;
    if (parsed.userId !== userId) return null;
    if (!parsed.savedAt || !parsed.state) return null;
    if (Date.now() - new Date(parsed.savedAt).getTime() > MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return null;
    return parsed as StoredDraft;
  } catch {
    return null;
  }
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface VerificationPayload {
  code: string;
  source: string;
}

interface Result {
  code: string | null;
  source: string | null;
}

const VERIFICATION_CODE_EVENT = 'verification-code';

/**
 * Subscribes to the BFF socket.io `getaway` namespace and waits for a
 * verification code emitted into room `verify:<phoneE164>`.
 *
 * The managed wizard flow has no inbox the operator can read — the SMS
 * lands on the Twilio number we own, notify-service detects the code,
 * pushes it through gRPC to the BFF and the BFF emits it here.
 *
 * `enabled` gates the connection so we don't open a socket on steps
 * that don't care about the code.
 */
export const useVerificationCodeSocket = (phoneE164: string | null, enabled: boolean): Result => {
  const [payload, setPayload] = useState<VerificationPayload | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || !phoneE164) return;

    const socket = io(`${process.env.NEXT_PUBLIC_API_HOST_URL}/getaway`, {
      query: { challenge: `verify:${phoneE164}` },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on(VERIFICATION_CODE_EVENT, (data: VerificationPayload) => {
      setPayload(data);
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [phoneE164, enabled]);

  return { code: payload?.code ?? null, source: payload?.source ?? null };
};

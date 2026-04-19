# front-service — style guide

Next.js 15 App Router + Apollo Client + react-hook-form + zod + next-intl.

## Struktura feature-local

Każdy tab/feature w `app/[locale]/<section>/tabs/<feature>/`:

```
tabs/<feature>/
  <Feature>Tab.tsx            # thin view, renderuje modale + tabelę
  components/
    <Feature>FormModal.tsx    # JEDEN modal z prop `mode: 'add' | 'edit'`
    <Feature>Table.tsx
    <inne sub-komponenty>.tsx
  hooks/
    queries.ts                # gql() z fragmentami
    use-<feature>-list.ts     # useQuery
    use-<feature>-upsert.ts   # useMutation (create + update w jednym)
    use-<feature>-delete.ts
  schemas/
    <feature>.schema.ts       # createXSchema(t) → z.object
  constants.ts                # enumy, label-keys, opcje selectów
  helpers.ts                  # parseJson, toKeysJson, formatters
  interfaces.ts               # typy TS (Summary, Input, FormMode)
```

## Formy i modale

- **Jeden `FormModal` na feature**, rozróżnianie create/update przez `mode` prop. Nigdy dwa osobne komponenty `AddX` / `EditX`.
- `react-hook-form` + `zodResolver(createXSchema(t))` — **nie** `useState` per pole.
- `useEffect` z `reset()` przy zmianie `selectedItem` / `mode`.
- `defaultValues` jako stała na górze pliku (`defaultAddValues`).
- W trybie edit pola identyfikujące (np. nazwa komendy) są read-only `<p>`, nie input.
- Submit przez `<Button form={FORM_ID} type="submit">` w footerze modala.

## Hooki

- **Jeden hook per kwerenda/mutacja** — `use-x-list`, `use-x-upsert`, `use-x-delete`. Nie łącz listy z mutacjami w jednym hooku.
- Hooki wracają znormalizowane API: `{ items, loading }`, `{ upsertX, isSaving }`, `{ deleteX, isDeleting }`.
- `refetchQueries` po mutacji wskazuje na `document` z `queries.ts`, nie na string.
- Apollo z `@apollo/client/react`.

## i18n

- Wszystkie stringi user-facing przez `useTranslations('<section>')`. Zero hardcoded tekstu.
- Klucze grupowane per sekcja (`commands.*`, `prompts.*`, `users.*`).
- Enumy (np. `PromptUserType`) mapowane przez `USER_TYPE_LABEL_KEYS: Record<EnumType, string>` w `constants.ts`, używane jako `t(USER_TYPE_LABEL_KEYS[value] as Parameters<typeof t>[0])`.
- Schema-level komunikaty błędów przez factory: `createXSchema(t)` wstrzykuje `t` do `z.string().min(1, t('required'))`.
- **Kolejność ról w selectach**: `Owner`, `SuperUser`, `User`, `Member` (Member zawsze na dole). **Bez `Admin`** w selectach użytkownika.

## Zod

- Zod v4: `z.enum(SomeEnum)` (nie `z.nativeEnum`), `z.email()` zamiast `.string().email()`.
- Schema zawsze eksportuje też `type XFormValues = z.infer<typeof schema>`.

## Server vs client

- Default: server component (RSC). `'use client'` tylko gdy potrzebny state/effect/event handler.
- GraphQL queries po stronie serwera kiedy tylko możliwe; mutacje i subskrypcje na kliencie.
- Strona (`page.tsx`) serwerowa, `<FeatureTab>` kliencki jeśli interaktywny.

## Stałe, helpery, typy

- `constants.ts` — enumy, badge styles, label keys, opcje selectów, defaulty.
- `helpers.ts` — `parseJson<T>(raw, fallback)`, `toKeysJson(keys)`, formatery. Czyste funkcje, bez React.
- `interfaces.ts` — `XSummary` (z serwera), `XUpsertInput` (do mutacji), `XFormMode = 'add' | 'edit'`.

## Języki w `DescriptionEditor`

- Domyślny język nowego wpisu = `useLocale()` jeśli dostępny, inaczej pierwszy z `LANG_OPTIONS`.
- `useEffect` pilnuje, żeby `newLang` był zawsze z dostępnej listy.

## Komponenty UI

- Z `@/components/ui`: `Button`, `Input`, `Modal`, `MultiSelect`, `TagInput`, `Toggle`, `SelectOption`.
- Nie twórz lokalnych replik — rozbuduj design system.
- Przyciski w modalach: Cancel (zielony, po lewej) + Submit (niebieski/zielony, po prawej).

## Commit style

`<type>(<scope>): <co i po co>` — np. `refactor(commands-tab): co-locate hooks/components, one form modal`.
Zawsze Co-Authored-By Claude w stopce.

## Antipatterny do unikania

- Duplikowane pary `addX` / `editX` state (nazwa, opis, role…) — zamiast tego RHF + jeden modal.
- Wielkie shared helpery typu `sharedFormFields(arg1..arg12)`.
- Hooki które robią wszystko (list + upsert + delete razem).
- `useState` dla pól formularza zamiast RHF.
- Hardcoded stringi zamiast `t()`.
- Tworzenie osobnych komponentów `AddXModal` i `EditXModal`.
- Trzymanie hooków w globalnym `src/hooks/` gdy używa ich tylko jeden feature — co-locate.

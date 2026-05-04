// PL-only invite copy for MVP. Anti-phishing structure: lead with the
// inviting tenant name, explain in one line WHY they got this, give a
// single concrete next step ("Reply"), and a token fallback for users
// whose Signal client doesn't surface the reply gesture clearly.
//
// Keep this short — long messages from unknown senders trip Signal's
// "message request" friction harder.
export function buildBindingInviteText(opts: { tenantName: string; token: string }): string {
  const tenantName = opts.tenantName.trim() || 'Open Gate';
  return [
    `Cześć! ${tenantName} dodał Cię w aplikacji Open Gate.`,
    '',
    'Aby potwierdzić swój numer — kliknij "Odpowiedz" na tę',
    'wiadomość i wyślij cokolwiek (np. 👍).',
    '',
    `Albo odeślij kod: ${opts.token}`,
    '',
    'Jeśli nie znasz tej firmy, zignoruj wiadomość.',
  ].join('\n');
}

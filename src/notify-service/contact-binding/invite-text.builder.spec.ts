import { buildBindingInviteText } from './invite-text.builder';

describe('buildBindingInviteText', () => {
  it('embeds tenant name and token', () => {
    const out = buildBindingInviteText({ tenantName: 'Acme', token: 'og-abcd23' });
    expect(out).toContain('Acme');
    expect(out).toContain('og-abcd23');
    expect(out).toContain('Open Gate');
  });

  it('falls back to "Open Gate" when tenant name is empty or whitespace', () => {
    expect(buildBindingInviteText({ tenantName: '', token: 'og-1' })).toContain('Open Gate dodał');
    expect(buildBindingInviteText({ tenantName: '   ', token: 'og-1' })).toContain('Open Gate dodał');
  });

  it('trims tenant name (defends against accidental padding)', () => {
    const out = buildBindingInviteText({ tenantName: '  Coolio  ', token: 'og-x' });
    expect(out).toContain('Coolio dodał');
    expect(out).not.toContain('  Coolio  ');
  });

  it('keeps the message short (Signal message-request friction)', () => {
    const out = buildBindingInviteText({ tenantName: 'Acme', token: 'og-abcd23' });
    // Sanity ceiling — invite copy has to fit comfortably on a phone screen.
    expect(out.length).toBeLessThan(400);
  });

  it('includes the "Odpowiedz" cue and a fallback token line (anti-phishing structure)', () => {
    const out = buildBindingInviteText({ tenantName: 'Acme', token: 'og-zzz999' });
    expect(out).toMatch(/Odpowiedz/);
    expect(out).toMatch(/Albo odeślij kod: og-zzz999/);
    expect(out).toMatch(/Jeśli nie znasz tej firmy/);
  });
});

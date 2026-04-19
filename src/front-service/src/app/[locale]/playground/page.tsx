'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Toggle, Textarea, Table, Modal, Select, Tabs, TabPanels } from '@/components/ui';
import type { TableColumn, SelectOption, TabDef } from '@/components/ui';
import { UserStatus, UserRole } from '@/app/gql/graphql';

// ── helpers ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{title}</h2>
      {children}
    </section>
  );
}

function Card({ children, span2 }: { children: React.ReactNode; span2?: boolean }) {
  return (
    <div
      className={[
        'rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 flex flex-col gap-5',
        span2 ? 'md:col-span-2' : '',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

// ── table fixture ─────────────────────────────────────────────────────────────

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
};

const tableData: UserRow[] = [
  { id: 1, name: 'Aleksandra Kowal', email: 'a.kowal@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Marek Nowak', email: 'm.nowak@example.com', role: 'Użytkownik', status: 'active' },
  { id: 3, name: 'Joanna Wiśniewska', email: 'j.wisn@example.com', role: 'Moderator', status: 'inactive' },
  { id: 4, name: 'Piotr Zając', email: 'p.zajac@example.com', role: 'Użytkownik', status: 'active' },
];

const tableColumns: TableColumn<UserRow>[] = [
  { key: 'id', header: '#', align: 'center' },
  { key: 'name', header: 'Imię i nazwisko' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Rola' },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (val) =>
      val === 'active' ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Aktywny
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-700/60">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          Nieaktywny
        </span>
      ),
  },
];

// ── form types ────────────────────────────────────────────────────────────────

type FormData = {
  name: string;
  email: string;
  message: string;
  newsletter: boolean;
};

// ── page ──────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: SelectOption<UserStatus>[] = [
  { value: UserStatus.Pending, label: 'Pending' },
  { value: UserStatus.Active, label: 'Active' },
  { value: UserStatus.Suspended, label: 'Suspended' },
  { value: UserStatus.Banned, label: 'Banned' },
];

const ROLE_OPTIONS: SelectOption<UserRole>[] = [
  { value: UserRole.Owner, label: 'Owner' },
  { value: UserRole.Admin, label: 'Admin' },
  { value: UserRole.SuperUser, label: 'SuperUser' },
  { value: UserRole.Member, label: 'Member' },
  { value: UserRole.User, label: 'User' },
];

export default function PlaygroundPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [submitted, setSubmitted] = useState<FormData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(UserStatus.Active);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.User);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeTabMany, setActiveTabMany] = useState<string>('auth');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { newsletter: false } });

  const newsletterValue = watch('newsletter');

  const onSubmit = (data: FormData) => {
    setSubmitted(data);
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#09090f] px-4 py-12">
      <div className="mx-auto max-w-5xl flex flex-col gap-10">

        {/* header */}
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Design System — Open Gate
          </h1>
          <p className="text-sm text-slate-500">
            Biblioteka komponentów UI · Tailwind v4 · react-spring · react-hook-form
          </p>
        </header>

        {/* ── BUTTONS ── */}
        <Section title="Przyciski">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <p className="text-xs text-slate-500 font-medium">Warianty kolorystyczne</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="green">Zatwierdź</Button>
                <Button variant="blue">Zapisz</Button>
                <Button variant="red">Usuń</Button>
              </div>
            </Card>

            <Card>
              <p className="text-xs text-slate-500 font-medium">Rozmiary</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="blue" size="sm">Mały</Button>
                <Button variant="blue" size="md">Średni</Button>
                <Button variant="blue" size="lg">Duży</Button>
              </div>
            </Card>

            <Card span2>
              <p className="text-xs text-slate-500 font-medium">Stany</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="green" disabled>Zablokowany</Button>
                <Button variant="blue" disabled>Zablokowany</Button>
                <Button variant="red" disabled>Zablokowany</Button>
              </div>
            </Card>
          </div>
        </Section>

        {/* ── INPUTS & TEXTAREA ── */}
        <Section title="Pola formularza">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <p className="text-xs text-slate-500 font-medium">Input — stany</p>
              <div className="flex flex-col gap-4">
                <Input label="Poprawne" placeholder="Wpisz wartość…" />
                <Input
                  label="Błąd"
                  placeholder="Wpisz wartość…"
                  error="To pole jest wymagane"
                />
                <Input
                  label="Z podpowiedzią"
                  placeholder="user@example.com"
                  type="email"
                  hint="Nie udostępnimy Twojego adresu e-mail"
                />
              </div>
            </Card>

            <Card>
              <p className="text-xs text-slate-500 font-medium">Textarea — stany</p>
              <div className="flex flex-col gap-4">
                <Textarea label="Wiadomość" placeholder="Wpisz wiadomość…" />
                <Textarea
                  label="Z błędem"
                  placeholder="Wpisz wiadomość…"
                  error="Wiadomość jest za krótka"
                />
              </div>
            </Card>
          </div>
        </Section>

        {/* ── TOGGLE ── */}
        <Section title="Toggle">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <p className="text-xs text-slate-500 font-medium">Interaktywne</p>
              <div className="flex flex-col gap-4">
                <Toggle
                  checked={toggle1}
                  onChange={setToggle1}
                  label="Powiadomienia e-mail"
                />
                <Toggle
                  checked={toggle2}
                  onChange={setToggle2}
                  label="Tryb ciemny"
                />
              </div>
            </Card>

            <Card>
              <p className="text-xs text-slate-500 font-medium">Stany</p>
              <div className="flex flex-col gap-4">
                <Toggle checked={false} label="Wyłączony (off)" onChange={() => {}} />
                <Toggle checked={true} label="Włączony (on)" onChange={() => {}} />
                <Toggle checked={true} disabled label="Zablokowany" onChange={() => {}} />
              </div>
            </Card>
          </div>
        </Section>

        {/* ── TABLE ── */}
        <Section title="Tabela">
          <Table<UserRow>
            columns={tableColumns}
            data={tableData}
            keyExtractor={(r) => r.id}
          />
        </Section>

        {/* ── FORM ── */}
        <Section title="Formularz (react-hook-form)">
          <Card span2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Imię i nazwisko"
                  placeholder="Jan Kowalski"
                  error={errors.name?.message}
                  {...register('name', { required: 'Imię jest wymagane' })}
                />
                <Input
                  label="Adres e-mail"
                  placeholder="jan@example.com"
                  type="email"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'E-mail jest wymagany',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Nieprawidłowy format e-mail',
                    },
                  })}
                />
              </div>

              <Textarea
                label="Wiadomość"
                placeholder="Napisz coś…"
                error={errors.message?.message}
                {...register('message', {
                  required: 'Wiadomość jest wymagana',
                  minLength: { value: 10, message: 'Minimum 10 znaków' },
                })}
              />

              <Toggle
                checked={newsletterValue}
                onChange={(v) => setValue('newsletter', v)}
                label="Zapisz mnie do newslettera"
              />

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="red" type="button" onClick={() => setSubmitted(null)}>
                  Anuluj
                </Button>
                <Button variant="green" type="submit">
                  Wyślij wiadomość
                </Button>
              </div>
            </form>
          </Card>
        </Section>

        {/* ── SELECT ── */}
        <Section title="Select / Dropdown">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <p className="text-xs text-slate-500 font-medium">Status użytkownika</p>
              <Select<UserStatus>
                label="Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={STATUS_OPTIONS}
              />
              <p className="text-xs text-muted">Wybrano: {selectedStatus}</p>
            </Card>

            <Card>
              <p className="text-xs text-slate-500 font-medium">Rola użytkownika</p>
              <Select<UserRole>
                label="Rola"
                value={selectedRole}
                onChange={setSelectedRole}
                options={ROLE_OPTIONS}
              />
              <p className="text-xs text-muted">Wybrano: {selectedRole}</p>
            </Card>

            <Card>
              <p className="text-xs text-slate-500 font-medium">Zablokowany</p>
              <Select<UserStatus>
                label="Status (disabled)"
                value={UserStatus.Active}
                onChange={() => {}}
                options={STATUS_OPTIONS}
                disabled
              />
            </Card>
          </div>
        </Section>

        {/* ── TABS ── */}
        <Section title="Taby (z animacją react-spring)">
          <Card span2>
            <p className="text-xs text-slate-500 font-medium">Podstawowe — 3 taby, zawsze mieszczą się w szerokości</p>
            <Tabs
              tabs={[
                { key: 'overview', label: 'Przegląd' },
                { key: 'details', label: 'Szczegóły' },
                { key: 'history', label: 'Historia' },
              ] satisfies TabDef[]}
              active={activeTab}
              onChange={setActiveTab}
            />
            <TabPanels
              activeKey={activeTab}
              panels={{
                overview: (
                  <div className="rounded-lg border border-border bg-surface p-6">
                    <h3 className="text-sm font-semibold text-text mb-2">Panel: Przegląd</h3>
                    <p className="text-sm text-muted">Crossfade + translate-y przez useTransition z @react-spring/web.</p>
                  </div>
                ),
                details: (
                  <div className="rounded-lg border border-border bg-surface p-6">
                    <h3 className="text-sm font-semibold text-text mb-2">Panel: Szczegóły</h3>
                    <p className="text-sm text-muted">exitBeforeEnter=true — stary panel znika zanim nowy wejdzie (stabilny layout dla różnych wysokości).</p>
                  </div>
                ),
                history: (
                  <div className="rounded-lg border border-border bg-surface p-6">
                    <h3 className="text-sm font-semibold text-text mb-2">Panel: Historia</h3>
                    <p className="text-sm text-muted">Config: tension 280, friction 32 — krótka, sprężysta animacja.</p>
                  </div>
                ),
              }}
            />
          </Card>

          <Card span2>
            <p className="text-xs text-slate-500 font-medium">Overflow — horizontal scroll + gradient fade na krawędziach</p>
            <p className="text-xs text-slate-500">Zwężaj okno / kontener, żeby zobaczyć scroll i gradient. Kliknięcie zawijanego taba przewija go do widoku.</p>
            <div className="max-w-md border border-border rounded-lg p-4 bg-bg">
              <Tabs
                tabs={[
                  { key: 'auth', label: 'Uwierzytelnianie' },
                  { key: 'feature', label: 'Funkcje' },
                  { key: 'feature-settings', label: 'Ustawienia funkcji' },
                  { key: 'commands', label: 'Komendy' },
                  { key: 'prompts', label: 'Prompty' },
                  { key: 'integrations', label: 'Integracje' },
                  { key: 'billing', label: 'Rozliczenia' },
                ] satisfies TabDef[]}
                active={activeTabMany}
                onChange={setActiveTabMany}
              />
              <TabPanels
                activeKey={activeTabMany}
                panels={Object.fromEntries(
                  ['auth', 'feature', 'feature-settings', 'commands', 'prompts', 'integrations', 'billing'].map((k) => [
                    k,
                    <div key={k} className="text-sm text-muted p-4">Panel: {k}</div>,
                  ]),
                )}
              />
            </div>
          </Card>
        </Section>

        {/* ── MODAL trigger ── */}
        <Section title="Modal">
          <Card>
            <p className="text-xs text-slate-500 font-medium">
              Modal wysuwa się od dołu z delikatnym cieniem (50% mniejszy obszar, 25% intensywności)
            </p>
            <div className="flex gap-3">
              <Button variant="blue" onClick={() => setModalOpen(true)}>
                Otwórz modal
              </Button>
            </div>
          </Card>
        </Section>

      </div>

      {/* ── MODAL ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={submitted ? 'Formularz wysłany' : 'Przykładowy modal'}
        footer={
          <>
            <Button variant="red" size="sm" onClick={() => setModalOpen(false)}>
              Zamknij
            </Button>
            <Button variant="green" size="sm" onClick={() => setModalOpen(false)}>
              Potwierdź
            </Button>
          </>
        }
      >
        {submitted ? (
          <div className="flex flex-col gap-3 text-sm text-slate-300">
            <p className="text-slate-400">Otrzymane dane:</p>
            <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 px-4 py-3 font-mono text-xs text-slate-300 space-y-1">
              <p><span className="text-slate-500">name:</span> {submitted.name}</p>
              <p><span className="text-slate-500">email:</span> {submitted.email}</p>
              <p><span className="text-slate-500">message:</span> {submitted.message}</p>
              <p><span className="text-slate-500">newsletter:</span> {submitted.newsletter ? 'tak' : 'nie'}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 text-sm text-slate-300">
            <p>
              Ten modal wysuwa się od dołu ekranu z animacją react-spring.
              Kliknij tło lub wciśnij <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-xs text-slate-400 border border-slate-700">Esc</kbd> aby zamknąć.
            </p>
            <p className="text-slate-500 text-xs">
              Cień tła: <code className="text-slate-400">rgba(0,0,0,0.125)</code> — 50% mniejszy obszar, 25% intensywności standardowego overlay.
            </p>
          </div>
        )}
      </Modal>
    </main>
  );
}

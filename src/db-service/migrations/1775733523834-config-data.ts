import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConfigData1775733523834 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO configs (key, description, value, config_type) VALUES
('command', 'Konfiguracja obsługi komend systemowych', 'false', 'core'),
('message', 'Ustawienia przetwarzania wiadomości tekstowych', 'false', 'core'),
('audio', 'Parametry przesyłania i formatowania dźwięku', 'false', 'core'),
('signal', 'Główne ustawienia dla integracji Signal', 'false', 'core'),
('whatsapp', 'Globalna konfiguracja kanału WhatsApp', 'false', 'core'),
('email', 'Parametry wysyłki powiadomień pocztowych', 'false', 'core'),
('groq', 'Konfiguracja modelu językowego AI Groq', 'false', 'core'),
('bot-number', 'Numer telefonu przypisany do bota', '', 'feature'),
('smtp-port', 'Numer portu serwera poczty wychodzącej', '', 'feature'),
('smtp-host', 'Adres serwera obsługującego protokół SMTP', '', 'feature'),
('smtp-password', 'Hasło do uwierzytelnienia konta e-mail', '', 'feature'),
('smtp-user', 'Nazwa użytkownika lub adres e-mail', '', 'feature'),
('smtp-from', 'Adres wyświetlany jako nadawca wiadomości', '', 'feature'),
('api-key', 'Klucz autoryzacyjny do usług Groq', '', 'feature'),
('api-url', 'Adres URL punktu końcowego API', '', 'feature'),
('sms-account-sid', 'Unikalny identyfikator konta u dostawcy', '', 'feature'),
('sms-auth-token', 'Token zabezpieczający do wysyłki SMS', '', 'feature'),
('sms-from', 'Numer, z którego przychodzą SMS-y', '', 'feature'),
('twilio-account-sid', 'Główny identyfikator projektu Twilio', '', 'feature'),
('twilio-auth-token', 'Prywatny klucz dostępu do API', '', 'feature'),
('twilio-from', 'Numer telefonu zarejestrowany w Twilio', '', 'feature'),
('whatsapp-phone-twilio', 'Numer WhatsApp używany w Twilio', '', 'feature'),
('whatsapp-phone-meta', 'Numer telefonu w panelu Meta', '', 'feature'),
('whatsapp-phone-id', 'Unikalne ID numeru w Meta', '', 'feature'),
('whatsapp-business-id', 'Identyfikator konta biznesowego WhatsApp', '', 'feature'),
('whatsapp-access-token', 'Długoterminowy token dostępu do API', '', 'feature'),
('whatsapp-verify-token', 'Token do weryfikacji webhooków Meta', '', 'feature');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM settings 
    WHERE key IN (
    'command', 'message', 'audio', 'signal', 'whatsapp', 'email', 'groq',
    'botNumber',
    'smt-port', 'smt-host', 'smt-password', 'smt-user', 'smt-from',
    'api-key', 'api-url',
    'sms-account-sid', 'sms-auth-token', 'sms-from',
    'twilio-account-sid', 'twilio-auth-token', 'twilio-from',
    'whatsapp-phone-twilio', 'whatsapp-phone-meta', 'whatsapp-phone-id', 
    'whatsapp-business-id', 'whatsapp-access-token', 'whatsapp-verify-token'
);
        `);
  }
}

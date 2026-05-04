/**
 * Główny kontener wiadomości przychodzącej z mostka Signal
 */
export interface SignalMessage {
  envelope: SignalEnvelope;
  account: string; // Numer telefonu konta odbierającego
}

/**
 * Nagłówek wiadomości zawierający metadane o nadawcy i czasie
 */
export interface SignalEnvelope {
  source: string;
  sourceNumber: string;
  sourceUuid: string;
  sourceName: string;
  sourceDevice: number;
  timestamp: number;
  serverReceivedTimestamp: number;
  serverDeliveredTimestamp: number;
  // Opcjonalne unie różnych typów treści:
  dataMessage?: SignalDataMessage;
  typingMessage?: SignalTypingMessage;
  receiptMessage?: SignalReceiptMessage;
  syncMessage?: SignalSyncMessage;
}

/**
 * Treść właściwej wiadomości tekstowej lub multimedialnej
 */
export interface SignalDataMessage {
  timestamp?: number;
  message: string | null;
  expiresInSeconds?: number;
  isExpirationUpdate?: boolean;
  viewOnce?: boolean;
  attachments?: SignalAttachment[];
  groupInfo?: GroupInfo; // Obecność tego pola oznacza, że wiadomość pochodzi z grupy
  quote?: SignalQuote;
}

/**
 * Cytat innej wiadomości (Reply w Signalu). `id` to timestamp wiadomości
 * cytowanej — używany przez detector bindingu do dopasowania
 * outbound_message_id zapisanego przy wysłaniu invite.
 */
export interface SignalQuote {
  id: number;
  author?: string;
  authorUuid?: string;
  authorNumber?: string;
  text?: string;
}

interface GroupInfo {
  groupId: string;
  groupName: string;
  revision: number;
  type: string;
}
/**
 * Załącznik do wiadomości
 */
export interface SignalAttachment {
  contentType: string;
  id: string;
  size: number;
  voiceNote: boolean;
  is_voice_note: boolean;
  filename: string | null;
  width: number | null;
  height: number | null;
  caption: string | null;
  uploadTimestamp: number;
}

/**
 * Informacja o tym, że użytkownik zaczął lub przestał pisać
 */
export interface SignalTypingMessage {
  action: 'STARTED' | 'STOPPED';
  timestamp: number;
}

/**
 * Potwierdzenia (Dostarczono / Przeczytano)
 */
export interface SignalReceiptMessage {
  when: number;
  isDelivery: boolean;
  isRead: boolean;
  isViewed: boolean;
  timestamps: number[]; // Lista timestampów wiadomości, których dotyczy status
}

/**
 * Wiadomości synchronizacyjne (np. z innych urządzeń tego samego użytkownika)
 */
export interface SignalSyncMessage {
  type?: 'CONTACTS_SYNC'; // Może być rozszerzone o inne typy sync
  sentMessage?: SignalSentMessageSync;
  readMessages?: SignalReadMessageSync[];
}

/**
 * Synchronizacja wiadomości wysłanej z innego urządzenia
 */
export interface SignalSentMessageSync {
  destination: string;
  destinationNumber: string;
  destinationUuid: string;
  timestamp: number;
  message: string | null;
  expiresInSeconds: number;
  isExpirationUpdate: boolean;
  viewOnce: boolean;
  attachments?: SignalAttachment[];
}

/**
 * Synchronizacja statusu przeczytania (użytkownik przeczytał wiadomość na innym urządzeniu)
 */
export interface SignalReadMessageSync {
  sender: string;
  senderNumber: string;
  senderUuid: string;
  timestamp: number; // Timestamp oryginalnej wiadomości, która została przeczytana
}

export enum MessageType {
  Message = 'message',
  Audio = 'audio',
  Command = 'command',
  Unknown = 'unknown',
}

export enum UserType {
  Owner = 'owner',
  Admin = 'admin',
  SuperUser = 'super_user',
  Member = 'member',
  User = 'user',
}

export enum UserStatus {
  Pending = 'pending',
  Active = 'active',
  Suspended = 'suspended',
  Banned = 'banned',
}

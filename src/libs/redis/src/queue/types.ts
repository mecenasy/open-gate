export enum QueueType {
  Command = 'command',
  Message = 'message',
  Transcription = 'transcription',
  Speech = 'speech',
}

export interface QueueMessageData<T, C> {
  data: T;
  context: C;
}

export interface QueueMessageToAudioData<T> {
  message: string;
  context: T;
  platform: string;
}

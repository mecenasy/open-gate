export interface SofCommand<T> {
  action: CommandAction;
  command: CommandType;
  data: T;
  message: string;
  error?: boolean;
}

export enum CommandAction {
  Open = 'open',
  Close = 'close',
}

export enum CommandType {
  Gate = 'gate',
  SideGate = 'side_gate',
  Error = 'error',
}

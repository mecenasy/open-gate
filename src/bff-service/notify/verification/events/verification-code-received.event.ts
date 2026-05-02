export class VerificationCodeReceivedEvent {
  constructor(
    public readonly phoneE164: string,
    public readonly code: string,
    public readonly source: string,
  ) {}
}

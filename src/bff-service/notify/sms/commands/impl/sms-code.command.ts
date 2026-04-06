export class SmsCodeCommand {
  constructor(
    public readonly phoneNumber: string,
    public readonly code: number,
  ) {}
}

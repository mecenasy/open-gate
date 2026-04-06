export class MailCodeCommand {
  constructor(
    public readonly email: string,
    public readonly code: number,
  ) {}
}

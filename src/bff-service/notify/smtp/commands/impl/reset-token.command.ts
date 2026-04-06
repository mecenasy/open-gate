export class ResetTokenCommand {
  constructor(
    public readonly email: string,
    public readonly token: string,
  ) {}
}

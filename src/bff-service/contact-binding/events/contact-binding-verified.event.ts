export class ContactBindingVerifiedEvent {
  constructor(
    public readonly bindingId: string,
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly platform: string,
    public readonly platformUserId: string,
    public readonly phoneE164: string,
  ) {}
}

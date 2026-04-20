import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, ContactMembership, ContactAccessLevel } from '@app/entities';

interface CreateContactInput {
  tenantId: string;
  email?: string | null;
  phone?: string | null;
  name: string;
  surname?: string | null;
  accessLevel: ContactAccessLevel;
}

interface UpdateContactInput {
  email?: string | null;
  phone?: string | null;
  name?: string;
  surname?: string | null;
}

export type ContactWithMembership = Contact & { accessLevel: ContactAccessLevel };

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectRepository(ContactMembership)
    private readonly membershipRepo: Repository<ContactMembership>,
  ) {}

  async createForTenant(input: CreateContactInput): Promise<ContactWithMembership> {
    const contact = this.contactRepo.create({
      email: input.email ?? null,
      phone: input.phone ?? null,
      name: input.name,
      surname: input.surname ?? null,
    });
    const saved = await this.contactRepo.save(contact);
    await this.membershipRepo.save(
      this.membershipRepo.create({
        contactId: saved.id,
        tenantId: input.tenantId,
        accessLevel: input.accessLevel,
      }),
    );
    return { ...saved, accessLevel: input.accessLevel };
  }

  async update(contactId: string, input: UpdateContactInput): Promise<Contact | null> {
    const existing = await this.contactRepo.findOne({ where: { id: contactId } });
    if (!existing) return null;
    if (input.email !== undefined) existing.email = input.email;
    if (input.phone !== undefined) existing.phone = input.phone;
    if (input.name !== undefined) existing.name = input.name;
    if (input.surname !== undefined) existing.surname = input.surname;
    return this.contactRepo.save(existing);
  }

  async listForTenant(tenantId: string): Promise<ContactWithMembership[]> {
    const rows = await this.membershipRepo
      .createQueryBuilder('m')
      .innerJoin(Contact, 'c', 'c.id = m.contact_id')
      .where('m.tenant_id = :tenantId', { tenantId })
      .select([
        'c.id AS id',
        'c.email AS email',
        'c.phone AS phone',
        'c.name AS name',
        'c.surname AS surname',
        'c.created_at AS "createdAt"',
        'c.updated_at AS "updatedAt"',
        'm.access_level AS "accessLevel"',
      ])
      .getRawMany<ContactWithMembership>();
    return rows;
  }

  async removeFromTenant(tenantId: string, contactId: string): Promise<boolean> {
    const result = await this.membershipRepo.delete({ tenantId, contactId });
    return (result.affected ?? 0) > 0;
  }

  async countForTenant(tenantId: string): Promise<number> {
    return this.membershipRepo.count({ where: { tenantId } });
  }
}

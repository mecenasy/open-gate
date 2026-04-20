import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact, ContactMembership } from '@app/entities';
import { ContactService } from './contact.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contact, ContactMembership])],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}

import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { AddUserCommand } from '../impl/add-user.command';
import { User } from '../../entity/user.entity';
import { UserRole } from '../../entity/user-role.entity';
import { PasswordService } from '../../password/password.service';
import { UserSettingsService } from '../../user-settings/user-settings.service';
import { UserStatus } from '../../status';
import { UserType } from '../../user-type';
import { protoToJsUserType } from 'src/utils/user-type-converter';
import { entityToProto } from '../../utils/entity-to-proto';
import { UserData, UserType as ProtoUserType } from 'src/proto/user';

@CommandHandler(AddUserCommand)
export class AddUserHandler extends BaseCommandHandler<AddUserCommand, UserData> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly passwordService: PasswordService,
    private readonly userSettingsService: UserSettingsService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: AddUserCommand): Promise<UserData> {
    return this.run(
      'AddUser',
      async () => {
        const { email, phone, password, name, surname, type, phoneOwner } = command.request;
        console.log('🚀 ~ AddUserHandler ~ execute ~ type:', type);

        const userType = await this.userRoleRepository.findOneOrFail({
          where: { userType: protoToJsUserType(type ?? ProtoUserType.USER) },
        });

        const user = this.userRepository.create({
          email,
          phone,
          name,
          surname,
          status: UserStatus.Pending,
          userRole: userType,
          userSettings: this.userSettingsService.create(),
        });

        if (phoneOwner) {
          const owner = await this.userRepository.findOneOrFail({ where: { phone: phoneOwner } });
          user.ownerId = owner.id;
        }

        if (password) {
          user.password = this.passwordService.createPassword(password);
        }

        const entity = await this.userRepository.save(user);
        const result = entityToProto(entity);

        this.logger.log('User added successfully', { userId: result.id });
        return result;
      },
      { email: command.request.email, type: command.request.type },
    );
  }
}

import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPasswordDifferent', async: false })
export class IsPasswordDifferentConstraint implements ValidatorConstraintInterface {
  validate(newPassword: string, args: ValidationArguments) {
    const object = args.object as ChangePasswordType;
    return newPassword !== object.oldPassword;
  }

  defaultMessage() {
    return 'New password must be different from old password';
  }
}

@InputType()
export class ChangePasswordType {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character',
  })
  @Validate(IsPasswordDifferentConstraint)
  newPassword: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;
}

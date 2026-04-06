import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { AuthStatus } from '../../types/login-status';

export class StatusResponse {
  constructor(readonly partial?: Partial<StatusResponse>) {
    Object.assign(this, partial);
  }

  @Expose()
  @IsNotEmpty()
  @IsEnum(AuthStatus)
  @ApiProperty({
    enum: AuthStatus,
    description: 'The current login progression status',
    example: AuthStatus.new,
    required: true,
  })
  public status!: AuthStatus;
}

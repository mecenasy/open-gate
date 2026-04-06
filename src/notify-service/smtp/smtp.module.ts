import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { smtpConfig, SmtpConfig } from './config/smtp.configs';
import { SmtpService } from './smtp.service';
import { SmtpController } from './smtp.controller';

@Module({
  imports: [
    ConfigModule.forFeature(smtpConfig),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<SmtpConfig>('smtp')?.host,
          port: configService.get<SmtpConfig>('smtp')?.port,
          secure: false,
          ignoreTLS: false,
          requireTLS: true,
          auth: {
            user: configService.get<SmtpConfig>('smtp')?.user,
            pass: configService.get<SmtpConfig>('smtp')?.password,
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<SmtpConfig>('smtp')?.from}>`,
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  controllers: [SmtpController],
  providers: [SmtpService],
  exports: [SmtpService],
})
export class SmtpModule {}

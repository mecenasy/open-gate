# Notifications & External Integrations Skill

## Overview

Open Gate's Notify Service handles multi-channel notifications through email, SMS, Signal, WhatsApp (WIP), and Messenger (WIP).

## Architecture

### Notify Service

**Location:** `src/notify-service/`  
**Ports:**

- HTTP API: 3002
- gRPC Server: 50052 (communicates with Core Service via gRPC)

**Internal Communication:** gRPC with Core Service (bidirectional)  
**External Communication:** REST/HTTP with third-party services

### Event Flow

```
Core Service {gRPC:50052}
       ↓
Notify Service (3002)
       ↓
  [Notification Handler]
       ↓
┌──────┬────────┬─────────┬──────────┬──────────┐
▼      ▼        ▼         ▼          ▼          ▼
Email  SMS    Signal   WhatsApp   Messenger  WebSocket
(SMTP) (REST) (REST)   (REST-WIP) (REST-WIP) (Local)
```

### Communication Protocols

| Direction | Protocol | Details |
|-----------|----------|---------|
| Core → Notify | **gRPC** | High-performance, bidirectional streaming on port 50052 |
| Notify → Email | **SMTP** | Nodemailer SMTP client connection |
| Notify → SMS | **REST (HTTP)** | Twilio API endpoints |
| Notify → Signal | **REST (HTTP)** | Signal CLI REST API or Official Signal API |
| Notify → WhatsApp | **REST (HTTP)** | WhatsApp Business API (WIP) |
| Notify → Messenger | **REST (HTTP)** | Facebook Messenger API (WIP) |

## Email Notifications

### Nodemailer Configuration

Environment variables:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@open-gate.com
MAIL_FROM_NAME=Open Gate
```

### Email Service

```typescript
@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('MAIL_HOST'),
      port: configService.get('MAIL_PORT'),
      secure: configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: configService.get('MAIL_USER'),
        pass: configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: 'Welcome to Open Gate',
      html: this.getWelcomeTemplate(name),
    });
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: 'Reset Your Password',
      html: this.getPasswordResetTemplate(resetLink),
    });
  }

  private getWelcomeTemplate(name: string): string {
    return `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for joining Open Gate.</p>
      <p>Start exploring now: <a href="${process.env.FRONTEND_URL}">Login</a></p>
    `;
  }

  private getPasswordResetTemplate(resetLink: string): string {
    return `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link expires in 24 hours.</p>
    `;
  }
}
```

### Sending Emails from Core Service

```typescript
// In Core Service, via gRPC call
@CommandHandler(UserCreatedCommand)
export class UserCreatedHandler implements ICommandHandler<UserCreatedCommand> {
  constructor(private readonly notifyClient: NotifyClient) {}

  async execute(command: UserCreatedCommand): Promise<void> {
    // Create user in database...

    // Send welcome email via Notify Service
    await this.notifyClient.sendWelcomeEmail({
      email: command.data.email,
      name: command.data.name,
    });
  }
}
```

## SMS Notifications

### Twilio Configuration

Environment variables:

```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### SMS Service

```typescript
@Injectable()
export class SmsService {
  private client: Twilio;

  constructor(private configService: ConfigService) {
    this.client = twilio(
      configService.get('TWILIO_ACCOUNT_SID'),
      configService.get('TWILIO_AUTH_TOKEN')
    );
  }

  async sendOTP(phoneNumber: string, code: string): Promise<void> {
    await this.client.messages.create({
      body: `Your Open Gate verification code is: ${code}. Valid for 10 minutes.`,
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
      to: phoneNumber,
    });
  }

  async send2FACode(phoneNumber: string, code: string): Promise<void> {
    await this.client.messages.create({
      body: `Your two-factor authentication code is: ${code}`,
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
      to: phoneNumber,
    });
  }

  async sendNotification(
    phoneNumber: string,
    message: string
  ): Promise<void> {
    await this.client.messages.create({
      body: message,
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
      to: phoneNumber,
    });
  }
}
```

## Signal Integration (REST API)

### Communication: REST/HTTP Only

**Signal Service uses REST API** to communicate with external Signal service:

- **Option 1**: Signal CLI REST API (local Docker container on port 8080)
- **Option 2**: Official Signal Business API (cloud-hosted)

**Not using gRPC** - Only REST/HTTP for Signal messaging

### Configuration

Environment variables:

```env
# Signal integration type
SIGNAL_PROVIDER=cli-rest-api  # or 'official'

# Signal CLI REST API (local container)
SIGNAL_CLI_ENDPOINT=http://signal-cli-rest-api:8080
SIGNAL_PHONE_NUMBER=+1234567890

# Official Signal API (cloud)
SIGNAL_API_KEY=xxx
SIGNAL_API_URL=https://api.signal.example.com
```

### Signal Service Implementation (REST)

```typescript
@Injectable()
export class SignalService {
  private readonly logger = new Logger(SignalService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

  /**
   * Send message via Signal REST API
   * HTTP POST to Signal endpoint
   */
  async sendMessage(
    phoneNumber: string,
    message: string
  ): Promise<void> {
    try {
      const endpoint = this.configService.get('SIGNAL_CLI_ENDPOINT');
      
      await this.httpService
        .post(
          `${endpoint}/v1/send`,
          {
            message,
            recipients: [phoneNumber],
            base64_attachments: [],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          }
        )
        .toPromise();

      this.logger.log(
        `Signal message sent to ${phoneNumber}`,
        'SignalService'
      );
    } catch (error) {
      this.logger.error(
        `Failed to send Signal message to ${phoneNumber}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        'Failed to send Signal notification'
      );
    }
  }

  /**
   * Send group message via Signal REST API
   */
  async sendGroupMessage(
    groupId: string,
    message: string
  ): Promise<void> {
    try {
      const endpoint = this.configService.get('SIGNAL_CLI_ENDPOINT');
      
      await this.httpService
        .post(
          `${endpoint}/v1/groups`,
          {
            message,
            groupId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          }
        )
        .toPromise();

      this.logger.log(
        `Signal group message sent to ${groupId}`,
        'SignalService'
      );
    } catch (error) {
      this.logger.error(
        `Failed to send Signal group message: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        'Failed to send Signal notification'
      );
    }
  }
}
```

## WhatsApp Integration (WIP)

### Planned Implementation

```typescript
@Injectable()
export class WhatsAppService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    // WIP: Implement WhatsApp Business API integration
    // Options:
    // 1. Official WhatsApp Business API
    // 2. Twilio WhatsApp integration
    // 3. Meta Cloud API
    throw new NotImplementedException('WhatsApp integration in progress');
  }
}
```

### Configuration Template (Future)

```env
# WhatsApp - Configuration pending implementation
WHATSAPP_PROVIDER=twilio | meta | official
WHATSAPP_API_KEY=xxx
WHATSAPP_PHONE_ID=xxx
```

## Messenger Integration (WIP)

### Planned Implementation

```typescript
@Injectable()
export class MessengerService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

  async sendMessage(recipientId: string, message: string): Promise<void> {
    // WIP: Implement Facebook Messenger integration
    throw new NotImplementedException('Messenger integration in progress');
  }
}
```

### Configuration Template (Future)

```env
# Messenger - Configuration pending implementation
MESSENGER_PAGE_ACCESS_TOKEN=xxx
MESSENGER_VERIFY_TOKEN=xxx
```

## Notification Service Module

### Module Setup

```typescript
@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    NotifyService,
    EmailService,
    SmsService,
    SignalService,
    WhatsAppService,
    MessengerService,
  ],
  exports: [NotifyService],
})
export class NotifyModule {}
```

### Central Notification Service

```typescript
@Injectable()
export class NotifyService {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private signalService: SignalService,
    private whatsAppService: WhatsAppService,
    private messengerService: MessengerService,
    private logger: Logger
  ) {}

  async sendNotification(
    notification: NotificationDto
  ): Promise<NotificationResult> {
    const results: NotificationResult[] = [];

    // Send via all enabled channels
    if (notification.channels.includes('email')) {
      try {
        await this.emailService.send(notification.email, notification.subject, notification.body);
        results.push({ channel: 'email', status: 'success' });
      } catch (error) {
        this.logger.error(`Email failed: ${error.message}`);
        results.push({ channel: 'email', status: 'failed', error: error.message });
      }
    }

    if (notification.channels.includes('sms')) {
      try {
        await this.smsService.send(notification.phoneNumber, notification.body);
        results.push({ channel: 'sms', status: 'success' });
      } catch (error) {
        this.logger.error(`SMS failed: ${error.message}`);
        results.push({ channel: 'sms', status: 'failed', error: error.message });
      }
    }

    if (notification.channels.includes('signal')) {
      try {
        await this.signalService.sendMessage(notification.phoneNumber, notification.body);
        results.push({ channel: 'signal', status: 'success' });
      } catch (error) {
        this.logger.error(`Signal failed: ${error.message}`);
        results.push({ channel: 'signal', status: 'failed', error: error.message });
      }
    }

    return { channels: results, timestamp: new Date() };
  }
}
```

## gRPC Proto Definition

```protobuf
// src/proto/notify.proto

syntax = "proto3";

package notify;

service NotifyService {
  rpc SendEmail(EmailRequest) returns (NotificationResponse);
  rpc SendSMS(SMSRequest) returns (NotificationResponse);
  rpc SendSignal(SignalRequest) returns (NotificationResponse);
  rpc SendNotification(SendNotificationRequest) returns (NotificationResponse);
}

message EmailRequest {
  string email = 1;
  string subject = 2;
  string body = 3;
  string html = 4;
}

message SMSRequest {
  string phone_number = 1;
  string message = 2;
}

message SignalRequest {
  string phone_number = 1;
  string message = 2;
}

message SendNotificationRequest {
  string user_id = 1;
  repeated string channels = 2; // 'email', 'sms', 'signal'
  string email = 3;
  string phone_number = 4;
  string subject = 5;
  string body = 6;
}

message NotificationResponse {
  bool success = 1;
  string message = 2;
  int32 timestamp = 3;
}
```

## Queue-Based Notification Processing

For high-volume notifications, use Bull queues:

```typescript
@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue('notifications')
    private notificationQueue: Queue<NotificationDto>
  ) {}

  async queueNotification(notification: NotificationDto): Promise<void> {
    await this.notificationQueue.add(notification, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}

@Processor('notifications')
export class NotificationProcessor {
  constructor(private notifyService: NotifyService) {}

  @Process()
  async processNotification(job: Job<NotificationDto>) {
    try {
      await this.notifyService.sendNotification(job.data);
      return { success: true };
    } catch (error) {
      throw error; // Will retry
    }
  }
}
```

## Error Handling & Retries

```typescript
async sendNotification(notification: NotificationDto): Promise<void> {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await this.emailService.send(notification.email, notification.subject, notification.body);
      return;
    } catch (error) {
      lastError = error;
      this.logger.warn(
        `Attempt ${attempt}/${maxRetries} failed: ${error.message}`
      );

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError;
}
```

## Best Practices

### 1. Template Management

```typescript
// Store templates in database or files
const templates = {
  welcome: (name: string) => `Welcome, ${name}!`,
  passwordReset: (link: string) => `Reset password: ${link}`,
  twoFactor: (code: string) => `Your 2FA code: ${code}`,
};
```

### 2. Rate Limiting

```env
# Prevent spam
EMAIL_RATE_LIMIT=100/hour
SMS_RATE_LIMIT=50/hour
SIGNAL_RATE_LIMIT=100/hour
```

### 3. Testing Notifications

```typescript
describe('EmailService', () => {
  it('should send welcome email', async () => {
    const mockTransport = jest.fn();
    service.transporter.sendMail = mockTransport;

    await service.sendWelcomeEmail('test@example.com', 'John');
    
    expect(mockTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: expect.stringContaining('Welcome'),
      })
    );
  });
});
```

### 4. Notification Logging

```typescript
await this.logger.log(
  `Notification sent to ${notification.email} via email`,
  'NotifyService'
);
```

## Related Documentation

- [Backend Architecture](SKILL-backend-architecture.md) - Service structure
- [CQRS Pattern](SKILL-cqrs-pattern.md) - Event handling
- [Docker Deployment](SKILL-docker-deployment.md) - Container setup

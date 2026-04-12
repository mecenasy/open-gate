# Authentication & Session Management Skill

## Overview

Open Gate uses server-side session-based authentication with support for OAuth 2.0, WebAuthn, and TOTP for multi-factor authentication.

## Session Architecture

### Session Storage

Sessions are stored in Redis with the following structure:

```typescript
interface SessionData {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}
```

### Session Lifecycle

```
1. User logs in
   ↓
2. Credentials validated
   ↓
3. Session created in Redis
   ↓
4. Session ID sent to client (HttpOnly cookie)
   ↓
5. Client includes cookie in requests
   ↓
6. Server validates session on each request
   ↓
7. Session expires (configurable TTL)
```

## Environment Configuration

```env
# Session Configuration
SESSION_SECRET=your-secret-key
SESSION_TIMEOUT=86400000 # 24 hours in milliseconds
SESSION_COOKIE_SECURE=true # HTTPS only in production
SESSION_COOKIE_HTTP_ONLY=true # Prevent XSS access

# OAuth Configuration
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx

# WebAuthn Configuration
WEBAUTHN_RP_NAME="Open Gate"
WEBAUTHN_RP_ID=example.com
WEBAUTHN_ORIGIN=https://example.com

# TOTP Configuration
TOTP_WINDOW=1 # Number of valid time windows
```

## Authentication Strategies

### 1. Local Authentication (Session)

**User Registration:**

```typescript
@Post('auth/register')
async register(@Body() dto: RegisterDto) {
  // Validate email is unique
  const existing = await this.userService.findByEmail(dto.email);
  if (existing) {
    throw new ConflictException('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(dto.password, 10);

  // Create user
  const user = await this.userService.create({
    email: dto.email,
    password: hashedPassword,
    name: dto.name,
  });

  // Create session (handled by Passport)
  return { id: user.id, email: user.email };
}
```

**User Login:**

```typescript
@Post('auth/login')
@UseGuards(LocalAuthGuard)
async login(@Request() req) {
  // Passport validates credentials and populates req.user
  const session = await this.sessionService.create(req.user);
  
  return {
    userId: req.user.id,
    sessionId: session.id,
    expiresAt: session.expiresAt,
  };
}
```

**Request with Session:**

```typescript
// Client sends request with session cookie
GET /api/profile HTTP/1.1
Cookie: sessionId=abc123xyz
```

### 2. OAuth 2.0 Integration

**Google OAuth:**

```typescript
@Get('auth/google')
@UseGuards(GoogleAuthGuard)
async googleAuth() {
  // Redirects to Google login
}

@Get('auth/google/callback')
@UseGuards(GoogleAuthGuard)
async googleAuthCallback(@Request() req) {
  // User authenticated by Google
  const user = req.user;
  
  // Find or create user in database
  let dbUser = await this.userService.findByGoogleId(user.googleId);
  if (!dbUser) {
    dbUser = await this.userService.create({
      googleId: user.googleId,
      email: user.email,
      name: user.displayName,
      avatar: user.photos[0]?.value,
    });
  }

  // Create session
  const session = await this.sessionService.create(dbUser);
  
  // Redirect to frontend with session
  return redirect(`http://localhost:4002?sessionId=${session.id}`);
}
```

**Passport Strategy:**

```typescript
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      googleId: profile.id,
      email: profile.emails[0].value,
      displayName: profile.displayName,
      photos: profile.photos,
    };
  }
}
```

### 3. WebAuthn (Passwordless)

**Registration:**

```typescript
@Post('auth/webauthn/register/start')
async registerWebauthStart(@Request() req) {
  const user = req.user;
  
  const options = generateRegistrationOptions({
    rpID: process.env.WEBAUTHN_RP_ID,
    rpName: process.env.WEBAUTHN_RP_NAME,
    userID: user.id,
    userName: user.email,
    userDisplayName: user.name,
  });

  // Store challenge in session temporarily
  await this.sessionService.setChallenge(req.sessionId, options.challenge);

  return options;
}

@Post('auth/webauthn/register/finish')
async registerWebauthFinish(
  @Body() dto: AuthenticatorAttestationResponseJSON,
  @Request() req
) {
  const user = req.user;
  const challenge = await this.sessionService.getChallenge(req.sessionId);

  const verification = await verifyRegistrationResponse({
    response: dto,
    expectedChallenge: challenge,
    expectedOrigin: process.env.WEBAUTHN_ORIGIN,
    expectedRPID: process.env.WEBAUTHN_RP_ID,
  });

  if (verification.verified) {
    // Store credential
    await this.userService.addWebAuthnCredential(user.id, {
      id: verification.registrationInfo.credentialID,
      publicKey: verification.registrationInfo.credentialPublicKey,
      counter: verification.registrationInfo.counter,
    });

    return { success: true };
  }

  throw new BadRequestException('WebAuthn registration failed');
}
```

**Authentication:**

```typescript
@Post('auth/webauthn/authenticate')
async authenticateWebauthn(@Body() dto: AuthenticatorAssertionResponseJSON) {
  // Similar flow: generate challenge, verify response, create session
}
```

### 4. TOTP (Two-Factor Authentication)

**Enable TOTP:**

```typescript
@Post('auth/totp/enable')
async enableTOTP(@Request() req) {
  const user = req.user;
  
  const secret = speakeasy.generateSecret({
    name: `Open Gate (${user.email})`,
    issuer: 'Open Gate',
  });

  // Store temporarily, require verification before enabling
  await this.sessionService.setTotpSecret(req.sessionId, secret.base32);

  return {
    qrCode: secret.qr_code,
    secret: secret.base32,
  };
}

@Post('auth/totp/verify')
async verifyTOTP(@Body() dto: { token: string }, @Request() req) {
  const secret = await this.sessionService.getTotpSecret(req.sessionId);
  
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: dto.token,
    window: parseInt(process.env.TOTP_WINDOW || '1'),
  });

  if (!verified) {
    throw new BadRequestException('Invalid TOTP token');
  }

  // Enable TOTP for user
  const user = req.user;
  await this.userService.enableTOTP(user.id, secret);

  return { success: true };
}
```

**Login with TOTP:**

```typescript
@Post('auth/login-totp')
@UseGuards(LocalAuthGuard)
async loginWithTOTP(@Body() dto: { totp: string }, @Request() req) {
  const user = req.user;

  // Verify TOTP token
  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: 'base32',
    token: dto.totp,
    window: parseInt(process.env.TOTP_WINDOW || '1'),
  });

  if (!verified) {
    throw new UnauthorizedException('Invalid TOTP token');
  }

  // Create session
  const session = await this.sessionService.create(user);
  
  return { sessionId: session.id };
}
```

## Session Guards and Decorators

### Session Guard

```typescript
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.cookies['sessionId'];

    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    const session = await this.sessionService.get(sessionId);
    if (!session) {
      throw new UnauthorizedException('Session expired');
    }

    // Attach session and user data to request
    request.session = session;
    request.user = await this.userService.findById(session.userId);

    return true;
  }
}
```

### Auth Decorator

```typescript
export const Auth = () => UseGuards(SessionGuard);

@Controller('profile')
@Auth()
export class ProfileController {
  @Get()
  getProfile(@Request() req) {
    return req.user;
  }
}
```

## Session Logout

```typescript
@Post('auth/logout')
@Auth()
async logout(@Request() req) {
  await this.sessionService.destroy(req.session.id);
  
  return { success: true };
}
```

## Session Vulnerability Protection

### CSRF Protection

```typescript
// In AppModule
import { CsrfModule } from '@nestjs/csrf';

@Module({
  imports: [
    CsrfModule.forRoot({
      global: true,
      cookieKey: '_csrf_token',
      headerKey: 'x-csrf-token',
    }),
  ],
})
export class AppModule {}
```

### Session Fixation Prevention

```typescript
// Regenerate session on login
const session = await this.sessionService.create(user);
// Old session ID is invalidated
```

### HTTP Security Headers

```typescript
// In main.ts
app.use(helmet());
```

## Best Practices

### 1. Never Expose Session ID in URL

```typescript
// ❌ Bad
return redirect(`http://localhost:4002?sessionId=${session.id}`);

// ✅ Good - use HttpOnly cookie
res.cookie('sessionId', session.id, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict',
});
```

### 2. Session Timeout

```typescript
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
```

### 3. Session Validation on Each Request

```typescript
@UseGuards(SessionGuard)
```

### 4. Log Authentication Events

```typescript
await this.logger.log(`User ${user.id} logged in from ${req.ip}`);
```

### 5. Rate Limiting on Auth Endpoints

```typescript
@Post('auth/login')
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 attempts per minute
async login() {}
```

## Testing Authentication

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let sessionService: SessionService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, SessionService],
    }).compile();

    service = module.get(AuthService);
    sessionService = module.get(SessionService);
  });

  it('should create session on login', async () => {
    const user = { id: 'user-1', email: 'test@example.com' };
    const session = await service.login(user);

    expect(session).toBeDefined();
    expect(session.userId).toBe('user-1');
  });

  it('should invalidate session on logout', async () => {
    const session = await sessionService.create(user);
    await service.logout(session.id);

    const found = await sessionService.get(session.id);
    expect(found).toBeNull();
  });
});
```

## Related Documentation

- [Backend Architecture](SKILL-backend-architecture.md) - Service structure
- [Development Guidelines](README.md#development-guidelines) - Code patterns
- [Known Issues](README.md#known-issues) - Security concerns

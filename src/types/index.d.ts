import ms from 'ms';

declare namespace NodeJS {
  interface ProcessEnv {
    APP_PORT: string;
    APP_URL: string;

    ADMIN_PASSWORD: string;
    ADMIN_EMAIL: string;
    ADMIN_PHONE: string;

    MODE: 'dev' | 'production';
    ALLOWED_ORIGIN: string;
    CLIENT_URL: string;

    COOKIE_SECRET: string;
    SESSION_SECRET: string;
    SESSION_NAME: string;
    SESSION_DOMAIN: string;
    SESSION_MAX_AGE: string;
    SESSION_HTTP_ONLY: string;
    SESSION_SECURE: string;
    SESSION_FOLDER: string;
    SESSION_SAME_SITE: 'lax' | 'strict' | 'none';

    DATABASE_USER: string;
    DATABASE_PASSWORD: string;
    DATABASE_HOST: string;
    DATABASE_PORT: string;
    DATABASE_DB: string;
    DATABASE_URL: string;
    DATABASE_SYNC: '1' | '0';

    REDIS_URL: string;
    REDIS_PASSWORD: string;
    REDIS_PORT: string;
    REDIS_HOST: string;

    TWILO_SID: string;
    TWILO_TOKEN: string;
    TWILO_PHONE: string;

    POSTMAN_API_KEY: string;
    POSTMAN_COLLECTION_ID: string;

    SMTP_HOST: string;
    SMTP_USER: string;
    SMTP_PASSWORD: string;
    SMTP_PORT: string;

    JWT_SECRET_KEY: string;
    JWT_EXPIRE_AT: ms.StringValue;

    GRPC_URL: string;
    GRPC_PORT: string;
  }
}

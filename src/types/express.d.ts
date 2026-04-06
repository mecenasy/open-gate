import { User } from '../user/entity/user.entity';

declare module 'express' {
  export interface Request {
    user?: User;
    securityContext?: SecurityContext;
  }
}

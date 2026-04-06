import { User } from '../../grpc-service/user/entity/user.entity';

declare module 'express' {
  export interface Request {
    user?: User;
    securityContext?: SecurityContext;
  }
}

import { UserRole } from '@/commons/enums/user-role.enum';

export interface IJwtPayload {
  id: string;
  username: string;
  role: UserRole;
}

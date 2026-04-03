import { Role } from "src/shared/enums/role.enum";

export interface PayloadInterface {
  sub: number;
  email: string;
  role : Role;
}

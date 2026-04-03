import { SigninDto } from '../dto/sign-in.dto';
import { SignupDto } from '../dto/sign-up.dto';
import { Role } from 'src/shared/enums/role.enum';
import { User } from 'src/user/entities/user.entity';

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface SignupChainData extends SignupDto {
  salt?: string;
  createdUser?: User;
}

export interface SignupResult {
  user: PublicUser;
}

export interface SigninChainData extends SigninDto {
  user?: User;
  access_token?: string;
  sanitizedUser?: PublicUser;
}

export interface SigninResult {
  access_token: string;
  user: PublicUser;
}

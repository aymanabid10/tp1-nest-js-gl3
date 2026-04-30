import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserService } from '../../user/user.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    try {
      const authHeader = client.handshake.headers.authorization;
      const bearerToken = authHeader?.split(' ')[1];
      const token = bearerToken || (client.handshake.auth.token as string);

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = this.jwtService.verify(token);

      // Assuming payload has 'sub' for user ID based on common NestJS patterns
      const user = await this.userService.findOne(payload.sub); 
      
      // We attach the user object to the socket for later use
      context.switchToWs().getClient().user = user;
      return true;

    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }
}

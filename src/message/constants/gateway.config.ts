import { GatewayMetadata } from '@nestjs/websockets';


export const GATEWAY_OPTIONS: GatewayMetadata = {
  cors: { origin: process.env.WS_CORS_ORIGIN ?? '*' },
  namespace: 'chat',
};

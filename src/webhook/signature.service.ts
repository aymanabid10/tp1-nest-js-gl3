import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class SignatureService {
  private readonly secret = process.env.WEBHOOK_SECRET || "default_secret";

  verify(payload: any, signature: string): boolean {
    const hash = this.getSecret(payload, this.secret);
    return hash === signature;
  }

  sign(payload: any, secret: string): string {
    return this.getSecret(payload, secret);
  }

  private getSecret(payload: any, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}
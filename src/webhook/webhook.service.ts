import { Injectable } from "@nestjs/common";

@Injectable()
export class WebhookService {
    async processIncomingEvent(payload: any) {
        // Process the incoming webhook event
        console.log("Received webhook event:", payload);
    }
}
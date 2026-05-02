export interface WebhookEventHandler {
    handle(data: any): Promise<any>;
}
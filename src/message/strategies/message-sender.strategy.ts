import { Message } from '../entities/message.entity';

// Strategy interface for sending a message.
// Concrete implementations handle DM vs Room logic independently.

export interface MessageSenderStrategy {
  send(): Promise<Message>;
}

import { Handler } from './handler.interface';

export abstract class AbstractHandler<T> implements Handler<T> {
  private nextHandler?: Handler<T>;

  setNext(handler: Handler<T>): Handler<T> {
    this.nextHandler = handler;
    return handler;
  }

  async handle(data: T): Promise<T> {
    if (this.nextHandler) {
      return this.nextHandler.handle(data);
    }
    return data;
  }
}

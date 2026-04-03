export interface Handler<T> {
  setNext(handler: Handler<T>): Handler<T>;
  handle(data: T): Promise<T>;
}

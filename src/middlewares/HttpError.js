export class HttpError extends Error {
  constructor(status, message, field) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    if (field) this.field = field;
  }
}

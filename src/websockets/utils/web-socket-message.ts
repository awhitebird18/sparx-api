export class WebSocketMessage {
  type: string;
  payload: any;
  meta: {
    timestamp: number;
    [key: string]: any;
  };

  constructor(type: string, payload: any, meta?: { [key: string]: any }) {
    this.type = type;
    this.payload = payload;
    this.meta = {
      timestamp: Date.now(),
      ...meta,
    };
  }
}

import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class WebSocketService {
  private ws: WebSocket;
  wsObservable: Observable<any>;

  constructor(@Inject('CHANNELS_WEBSOCKET_URL') CHANNELS_WEBSOCKET_URL) {
    this.wsObservable = Observable.create(observer => {
      this.ws = new WebSocket(CHANNELS_WEBSOCKET_URL);
 
      this.ws.onopen = (event) => {
      };
 
      this.ws.onclose = (event) => {
        if (event.wasClean) {
          observer.complete();
        } else {
          observer.error(event);
        }
      };
 
      this.ws.onerror = (event) => {
        observer.error(event);
      }
 
      this.ws.onmessage = (event) => {
        observer.next(JSON.parse(event.data));
      }
 
      return () => {
        this.ws.close();
      };
    }).share();
  }

  sendData(message: Object): void {
    this.ws.send(JSON.stringify(message));
  }
}

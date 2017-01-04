import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class WebSocketService {
  private ws: any;
  wsObservable: Observable<any>;

  constructor(@Inject('CHANNELS_WEBSOCKET_URL') CHANNELS_WEBSOCKET_URL) {
    this.wsObservable = Observable.create(observer => {
      this.ws = new WebSocket(CHANNELS_WEBSOCKET_URL);
 
      this.ws.onopen = (e) => {
      };
 
      this.ws.onclose = (e) => {
        if (e.wasClean) {
          observer.complete();
        } else {
          observer.error(e);
        }
      };
 
      this.ws.onerror = (e) => {
        observer.error(e);
      }
 
      this.ws.onmessage = (e) => {
        observer.next(JSON.parse(e.data));
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

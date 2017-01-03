import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class WebSocketService {
  private websocketUrl = 'ws://127.0.0.1:8001/api/ws';
  private ws: any;
  wsObservable: Observable<any>;

  constructor() {
    this.wsObservable = Observable.create(observer => {
      this.ws = new WebSocket(this.websocketUrl);
 
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
}

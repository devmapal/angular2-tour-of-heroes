import { EventEmitter, Injectable, Output } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Hero } from './hero';
import { WebSocketService } from './web-socket.service';

@Injectable()
export class HeroService {
  private heroesUrl = 'http://127.0.0.1:8001/api/hero';  // URL to web api

  constructor(private http: Http, private webSocketService: WebSocketService) {
    webSocketService.wsObservable.subscribe(data => {
        this.onmessage(data)
    });
  }

  @Output() deleteEvent: EventEmitter<any> = new EventEmitter<any>();

  private onmessage(data: any): void {
    let payload = data.payload;

    if(payload.action === 'delete') {
      this.deleteEvent.emit(payload.pk);
    }
  }

  getHeroes(): Promise<Hero[]> {
    return this.http
      .get(this.heroesUrl + '/')
      .toPromise()
      .then(response => response.json() as Hero[])
      .catch(this.handleError);
  }

  getHero(id: number): Promise<Hero> {
    return this.getHeroes()
      .then(heroes => heroes.find(hero => hero.id === id));
  }

  save(hero: Hero): Promise<Hero> {
    if (hero.id) {
      return this.put(hero);
    }
    return this.post(hero);
  }

  delete(hero: Hero): void {
    let data: Object = {
      'stream': 'hero',
      'payload': {
        'pk': hero.id,
        'action': 'delete',
        'model': 'hero_service.hero',
      }
    }

    this.webSocketService.sendData(data);
  }

  // Add new Hero
  private post(hero: Hero): Promise<Hero> {
    let headers = new Headers({
      'Content-Type': 'application/json'
    });

    return this.http
      .post(this.heroesUrl, JSON.stringify(hero), { headers: headers })
      .toPromise()
      .then(res => res.json().data)
      .catch(this.handleError);
  }

  // Update existing Hero
  private put(hero: Hero): Promise<Hero> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let url = `${this.heroesUrl}/${hero.id}`;

    return this.http
      .put(url, JSON.stringify(hero), { headers: headers })
      .toPromise()
      .then(() => hero)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}

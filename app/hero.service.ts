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

  @Output() createEvent: EventEmitter<Hero> = new EventEmitter<Hero>();
  @Output() updateEvent: EventEmitter<Hero> = new EventEmitter<Hero>();
  @Output() deleteEvent: EventEmitter<number> = new EventEmitter<number>();

  private onmessage(data: any): void {
    let payload = data.payload;

    if(payload.action === 'create') {
        let hero: Hero = {'id': payload.pk, 'name': payload.data.name} as Hero;
        this.createEvent.emit(hero);
    } else if(payload.action === 'update') {
        let hero: Hero = {'id': payload.pk, 'name': payload.data.name} as Hero;
        this.updateEvent.emit(hero);
    } else if(payload.action === 'delete') {
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

  save(hero: Hero): void {
    if (hero.id) {
      this.update(hero);
    } else {
      this.create(hero);
    }
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
  private create(hero: Hero): void {
    let data: Object = {
      'stream': 'hero',
      'payload': {
        'action': 'create',
        'model': 'hero_service.hero',
        'data': {
          'name': hero.name,
        }
      }
    }

    this.webSocketService.sendData(data);
  }

  // Update existing Hero
  private update(hero: Hero): void {
    let data: Object = {
      'stream': 'hero',
      'payload': {
        'pk': hero.id,
        'action': 'update',
        'model': 'hero_service.hero',
        'data': {
          'name': hero.name,
        }
      }
    }

    this.webSocketService.sendData(data);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}

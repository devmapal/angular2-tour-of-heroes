import { EventEmitter, Injectable, Output } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Hero } from './hero';
import { WebSocketDemultiplexerService } from './web-socket-demultiplexer.service';

@Injectable()
export class HeroService {
  private heroesUrl = 'http://127.0.0.1:8001/api/hero';  // URL to web api

  constructor(private http: Http, private webSocketDemultiplexerService: WebSocketDemultiplexerService) {
    webSocketDemultiplexerService.subscribe('hero', payload => {
      this.onmessage(payload)
    });
  }

  @Output() createEvent: EventEmitter<Hero> = new EventEmitter<Hero>();
  @Output() updateEvent: EventEmitter<Hero> = new EventEmitter<Hero>();
  @Output() deleteEvent: EventEmitter<number> = new EventEmitter<number>();

  private onmessage(payload: Object): void {
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
    let payload: Object = {
      'pk': hero.id,
      'action': 'delete',
      'model': 'hero_service.hero',
    }

    this.webSocketDemultiplexerService.sendData('hero', payload);
  }

  // Add new Hero
  private create(hero: Hero): void {
    let payload: Object = {
      'action': 'create',
      'model': 'hero_service.hero',
      'data': {
        'name': hero.name,
      }
    }

    this.webSocketDemultiplexerService.sendData('hero', payload);
  }

  // Update existing Hero
  private update(hero: Hero): void {
    let payload: Object = {
      'pk': hero.id,
      'action': 'update',
      'model': 'hero_service.hero',
      'data': {
        'name': hero.name,
      }
    }

    this.webSocketDemultiplexerService.sendData('hero', payload);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}

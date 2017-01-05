import { EventEmitter, Injectable, Output } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Hero } from './hero';
import { DataBinding } from './data-binding';
import { WebSocketDataBindingService } from './web-socket-data-binding.service';

@Injectable()
export class HeroService {
  private heroesUrl = 'http://127.0.0.1:8001/api/hero';  // URL to web api

  constructor(private http: Http, private webSocketDataBindingService: WebSocketDataBindingService) {
    webSocketDataBindingService.subscribe('hero', 'hero_service.hero', payload => {
      this.onmessage(payload)
    });
  }

  @Output() createEvent: EventEmitter<Hero> = new EventEmitter<Hero>();
  @Output() updateEvent: EventEmitter<Hero> = new EventEmitter<Hero>();
  @Output() deleteEvent: EventEmitter<number> = new EventEmitter<number>();

  private onmessage(payload: DataBinding): void {
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
    this.webSocketDataBindingService.delete(
      'hero', 'hero_service.hero', hero.id);
  }

  // Add new Hero
  private create(hero: Hero): void {
    this.webSocketDataBindingService.create(
      'hero', 'hero_service.hero', {'name': hero.name});
  }

  // Update existing Hero
  private update(hero: Hero): void {
    this.webSocketDataBindingService.update(
      'hero', 'hero_service.hero', hero.id, {'name': hero.name});
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}

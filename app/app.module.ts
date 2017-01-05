import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import './rxjs-extensions';
import { AppComponent } from './app.component';
import { AppRoutingModule, routedComponents } from './app-routing.module';
import { HeroService } from './hero.service';
import { HeroSearchComponent } from './hero-search.component';
import { WebSocketService } from './web-socket.service';
import { WebSocketDemultiplexerService } from './web-socket-demultiplexer.service';
import { WebSocketDataBindingService } from './web-socket-data-binding.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    HeroSearchComponent,
    routedComponents
  ],
  providers: [
    HeroService,
    WebSocketService,
    WebSocketDemultiplexerService,
    WebSocketDataBindingService,
    { provide: 'WEBSOCKET_URL', useValue: 'ws://127.0.0.1:8001/api/ws' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

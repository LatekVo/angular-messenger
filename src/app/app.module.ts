import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { ChatInterfaceComponent } from "./chat-interface/chat-interface.component";
import { SignInComponent } from "./sign-in/sign-in.component";

import { ChatInterfaceModule } from "./chat-interface/chat-interface.module";
import { SignInModule } from "./sign-in/sign-in.module";

const routes: Routes = [
  { path: 'login', component: SignInComponent },
  { path: 'chat', component: ChatInterfaceComponent },
  { path: '**', redirectTo: '/chat' }
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    ChatInterfaceModule,
  ],
  providers: [],
  bootstrap: [AppComponent, SignInComponent]
})
export class AppModule { }

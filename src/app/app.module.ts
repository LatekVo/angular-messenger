import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

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
    HttpClientModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

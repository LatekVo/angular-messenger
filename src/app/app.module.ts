import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ChatInterfaceComponent } from "./chat-interface/chat-interface.component";
import { SignInComponent } from "./sign-in/sign-in.component";

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// vvv THESE TWO LINES ARE 'unused' BUT DELETING THEM WILL BREAK THE PROJECT.
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
    BrowserAnimationsModule,

    // these two are unnecessary, but I added them to mark the aforementioned two lines marked as used.
    ChatInterfaceModule,
    SignInModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FriendsListComponent } from './friends-list/friends-list.component';
import { TextAreaComponent } from './text-area/text-area.component';
import { InfoTabComponent } from './info-tab/info-tab.component';
import { ChatInterfaceComponent } from './chat-interface.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PersonNameOrSurnamePipe } from "../shared/pipes/person-name-or-surname.pipe";
import { SharedModule } from "../shared/shared.module";
import {MatListModule} from "@angular/material/list";
import {MatButtonModule} from "@angular/material/button";
import {MatExpansionModule} from "@angular/material/expansion";

@NgModule({
  declarations: [
    FriendsListComponent,
    TextAreaComponent,
    InfoTabComponent,
    ChatInterfaceComponent
  ],
    imports: [
        SharedModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgOptimizedImage,
        MatListModule,
        MatButtonModule,
        MatExpansionModule
    ],
  exports: [
    ChatInterfaceComponent
  ],
  providers: [
    PersonNameOrSurnamePipe
  ],
  bootstrap: [
    ChatInterfaceComponent
  ]
})
export class ChatInterfaceModule { }

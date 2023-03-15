import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FriendFilterPipe, FriendsListComponent} from './friends-list/friends-list.component';
import { TextAreaComponent } from './text-area/text-area.component';
import { InfoTabComponent } from './info-tab/info-tab.component';
import { ChatInterfaceComponent } from './chat-interface.component';
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    FriendsListComponent,
    TextAreaComponent,
    InfoTabComponent,
    ChatInterfaceComponent,

    // custom utilities
    FriendFilterPipe
  ],
    imports: [
        CommonModule,
        FormsModule
    ],
  exports: [
    ChatInterfaceComponent
  ],
  bootstrap: [
    ChatInterfaceComponent
  ]
})
export class ChatInterfaceModule { }

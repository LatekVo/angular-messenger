import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendsListComponent } from './friends-list/friends-list.component';
import { TextAreaComponent } from './text-area/text-area.component';
import { InfoTabComponent } from './info-tab/info-tab.component';
import { ChatInterfaceComponent } from './chat-interface.component';

@NgModule({
  declarations: [
    FriendsListComponent,
    TextAreaComponent,
    InfoTabComponent,
    ChatInterfaceComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ChatInterfaceComponent
  ],
  bootstrap: [
    ChatInterfaceComponent
  ]
})
export class ChatInterfaceModule { }

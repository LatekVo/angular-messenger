import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PersonNameOrSurnamePipe } from './pipes/person-name-or-surname.pipe';
import { FormsModule } from "@angular/forms";
import { NotificationSnackBarComponent } from './components/notification-snack-bar/notification-snack-bar.component';
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { ChatNamePipe } from './pipes/chat-name.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule
  ],
  declarations: [
    PersonNameOrSurnamePipe,
    NotificationSnackBarComponent,
    ChatNamePipe,
  ],
    exports: [
        PersonNameOrSurnamePipe,
        CommonModule,
        FormsModule,
        ChatNamePipe
    ]
})
export class SharedModule { }

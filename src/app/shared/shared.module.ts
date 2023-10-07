import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PersonNameOrSurnamePipe } from './pipes/person-name-or-surname.pipe';
import { FormsModule } from "@angular/forms";
import { NotificationSnackBarComponent } from './components/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ChatNamePipe } from './pipes/chat-name.pipe';
import { InviteInfoComponent } from './components/invite-info-dialog/invite-info.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatListModule } from "@angular/material/list";
import { UserSettingsDialogComponent } from './components/user-settings-dialog/user-settings-dialog.component';
import { MatIconModule } from "@angular/material/icon";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatListModule,
    MatIconModule,
  ],
  declarations: [
    PersonNameOrSurnamePipe,
    NotificationSnackBarComponent,
    ChatNamePipe,
    InviteInfoComponent,
    UserSettingsDialogComponent,
  ],
    exports: [
        PersonNameOrSurnamePipe,
        CommonModule,
        FormsModule,
        ChatNamePipe
    ]
})
export class SharedModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PersonNameOrSurnamePipe } from './pipes/person-name-or-surname.pipe';
import { FormsModule } from "@angular/forms";
import { NotificationSnackBarComponent } from './components/notification-snack-bar/notification-snack-bar.component';
import {MatSnackBarModule} from "@angular/material/snack-bar";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule
  ],
  declarations: [
    PersonNameOrSurnamePipe,
    NotificationSnackBarComponent,
  ],
  exports: [
    PersonNameOrSurnamePipe,
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PersonNameOrSurnamePipe } from './pipes/person-name-or-surname.pipe';
import { FormsModule } from "@angular/forms";
import { NotificationSnackBarComponent } from './components/notification-snack-bar/notification-snack-bar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
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

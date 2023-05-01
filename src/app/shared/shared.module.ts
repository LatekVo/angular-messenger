import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PersonNameOrSurnamePipe } from './pipes/person-name-or-surname.pipe';
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    PersonNameOrSurnamePipe,
  ],
  exports: [
    PersonNameOrSurnamePipe,
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }

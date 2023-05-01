import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAreaComponent } from './text-area.component';
import { HttpClientTestingModule } from "@angular/common/http/testing";
import {HttpClient, HttpClientModule, HttpHandler} from "@angular/common/http";
import {ChatInterfaceComponent} from "../chat-interface.component";
import {FriendsListComponent} from "../friends-list/friends-list.component";
import {InfoTabComponent} from "../info-tab/info-tab.component";
import {ChatInterfaceModule} from "../chat-interface.module";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PersonNameOrSurnamePipe} from "../../shared/pipes/person-name-or-surname.pipe";

describe('TextAreaComponent', () => {
  let component: TextAreaComponent;
  let fixture: ComponentFixture<TextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ChatInterfaceComponent,
        FriendsListComponent,
        TextAreaComponent,
        InfoTabComponent,
      ],
      imports: [
        ChatInterfaceModule,
        CommonModule,
        SharedModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
      ],
      providers: [
        HttpClient,
        HttpHandler,
        PersonNameOrSurnamePipe
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

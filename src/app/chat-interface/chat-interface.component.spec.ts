import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInterfaceComponent } from './chat-interface.component';
import { FriendsListComponent } from "./friends-list/friends-list.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TextAreaComponent } from "./text-area/text-area.component";
import { InfoTabComponent } from "./info-tab/info-tab.component";
import { PersonNameOrSurnamePipe } from "../shared/pipes/person-name-or-surname.pipe";
import {HttpClient, HttpClientModule, HttpHandler} from "@angular/common/http";
import { SharedModule } from "../shared/shared.module";
import { ChatInterfaceModule } from "./chat-interface.module";

describe('ChatInterfaceComponent', () => {
  let component: ChatInterfaceComponent;
  let fixture: ComponentFixture<ChatInterfaceComponent>;

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

    fixture = TestBed.createComponent(ChatInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

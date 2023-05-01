import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendsListComponent} from './friends-list.component';
import {HttpClient, HttpClientModule, HttpHandler} from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {TextAreaComponent} from "../text-area/text-area.component";
import {InfoTabComponent} from "../info-tab/info-tab.component";
import {ChatInterfaceComponent} from "../chat-interface.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {ChatInterfaceModule} from "../chat-interface.module";
import {PersonNameOrSurnamePipe} from "../../shared/pipes/person-name-or-surname.pipe";


describe('FriendsListComponent', () => {
  let component: FriendsListComponent;
  let fixture: ComponentFixture<FriendsListComponent>;

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

    fixture = TestBed.createComponent(FriendsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

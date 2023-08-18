import { Component, OnInit, ApplicationRef, NgZone } from '@angular/core';
import { MessageModel } from "../../shared/models/messageModel";
import { HttpClient } from "@angular/common/http";
import { UserContextService } from "../../shared/services/user-context.service";
import { ChatContextService } from "../../shared/services/chat-context.service";
import { PopupHandlerService } from "../../shared/services/popup-handler.service";


// todo: move all network components to a separate 'API interaction' service

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.css']
})
export class TextAreaComponent implements OnInit {
  messageList: MessageModel[] = []; // this seems unnecessary, but is an important interface between the behaviour subject and html
  constructor(private http: HttpClient, private popupService: PopupHandlerService, public chatContextService: ChatContextService, private appRef: ApplicationRef, private ngZone: NgZone) {}

  ngOnInit() {
    this.chatContextService.storedMessageList.subscribe(() => {
      // todo: this is an update-detection manual trigger to trigger reloading of ngFor, i want this implemented into a global service
      this.ngZone.run(() => {
        this.appRef.tick();
      });
      let element = document.getElementById('conversation-box');
      if (element) {
        element.scrollTop = element.scrollHeight
      }
    });

    // simply scroll down on new chat id
    this.chatContextService.storedOpenedChatId.subscribe(() => {
      let element = document.getElementById('conversation-box');
      if (element) {
        element.scrollTop = element.scrollHeight
      }
    });
  }

  messageInput: string = "";

  sendMessage() {
    this.http.post('/api/sendMessage', {content: this.messageInput, chatId: this.chatContextService.storedOpenedChatId.value}, {observe: "response"}).subscribe({
      next: () => {},
      error: response => {
        this.popupService.dispatchFromResponse(response);
      }
    });
    this.messageInput = "";
  }
}

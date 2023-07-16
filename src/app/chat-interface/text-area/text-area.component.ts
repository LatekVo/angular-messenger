import { Component, OnInit } from '@angular/core';
import { MessageModel } from "../../shared/models/messageModel";
import { HttpClient } from "@angular/common/http";
import { UserContextService } from "../../shared/services/user-context.service";
import { ChatContextService } from "../../shared/services/chat-context.service";

// todo: move all network components to a separate 'API interaction' service

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.css']
})
export class TextAreaComponent implements OnInit {
  messageList: MessageModel[] = [];

  constructor(private http: HttpClient, private userContextService: UserContextService, private chatContextService: ChatContextService) {}

  ngOnInit() {
    this.chatContextService.storedMessageList.subscribe(newValue => {
      this.messageList = this.chatContextService.storedMessageList.value;
    });

    this.messageList = this.chatContextService.storedMessageList.value;
  }

  messageInput: string = "";

  sendMessage() {
    this.http.post('/api/sendMessage', {content: this.messageInput, chatId: this.chatContextService.storedOpenedChatId});
    this.messageInput = "";
  }
}

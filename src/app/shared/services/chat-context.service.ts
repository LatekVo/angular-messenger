import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subscription } from "rxjs";
import { LocalStorageKeys as lsk } from "../enums/local-storage-keys";
import { HttpClient } from "@angular/common/http";
import { MessageModel } from "../models/messageModel";
import { CookieService } from "./cookie.service";
import { PopupHandlerService } from "./popup-handler.service";
import { ChatModel } from "../models/chatModel";
import { UserContextService } from "./user-context.service"; // needed for message streaming
//import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class ChatContextService {
  storedOpenChat: BehaviorSubject<ChatModel> = new BehaviorSubject({} as ChatModel);
  storedChatsList: BehaviorSubject<ChatModel[]> = new BehaviorSubject(new Array<ChatModel>());
  storedOpenedChatId = new BehaviorSubject(localStorage.getItem(lsk.OPENED_CHAT_ID));
  storedMessageList = new BehaviorSubject([] as MessageModel[]);
  messageStream: EventSource = new EventSource('');

  updateChatList() {
    this.userContextService.checkForCookies();
    this.http.post<{chats: string[]}>('/api/fetchChats', {})
    .pipe(map(body => body.chats))
    .subscribe((rawChatIdList) => {
      this.storedChatsList.next(rawChatIdList.map((chatId) => {
        return {
          chatName: undefined,
          chatId: chatId,
          pfpSourceUrl: `${chatId}.png`
        }
      }));
      this.storedChatsList.value.forEach((chat) => {
        // todo: during runtime, this segment only works once, the next time it's run an empty request is sent.
        this.http.post<{chatName: string}>('/api/getChatName', {chatId: chat.chatId})
          .pipe(map(body => body.chatName))
          .subscribe((chatName) => {
            chat.chatName = chatName;
          });
      });
    });
  }

  constructor(private http: HttpClient, private cookieService: CookieService, private popupService: PopupHandlerService, private userContextService: UserContextService) {
    let pagination = {
      batchAmount: 1000, // temporarily high, will have to break it down into chunks later, chunks of 50 to be exact.
      batchIndex: 0,
    }
    // We'll use two protocols, fetchMessages along with a paginator, and then fetchMessageUpdates, which will be a lingering call utilising an observable.
    // I'll take care of the pagination later, but what i have in mind right now is to create a wrapper around the scrollable area, which would auto set variables in some pagination class.
    // todo: cache results of fetchMessages, and check for them before sending a new request.
    // todo: sort each received message by whether it's authored by the current user.
    this.storedOpenedChatId.subscribe((newChatId) => {
      if (newChatId === null) {
        // popupService.dispatch('Opened a chat with no ID assigned!', 'error')
        // this behaviour is to be expected at the startup throw new Error('opened a chat with no ID assigned');
        return;
      }
      this.storedChatsList.value.forEach((selectedChat, index, array) => {
        if (selectedChat.chatId === newChatId) {
          this.storedOpenChat.next(selectedChat);
        }
      });

      this.http.post<{ messages: MessageModel[] }>('/api/fetchMessages', {chatId: newChatId, pagination: pagination})
        .pipe(
          map(body => body.messages.reverse()),
          map(messages => {
              messages.forEach((message) => {
                if (message.senderId == this.userContextService.storedUserId.value) {
                  message.writtenByMe = true;
                }
              });
              return messages;
            }
          )
        )
        .subscribe((newMessages) => {
          // ngrx would really come in handy here, for caching all the chats when context is switched.
          // I will have to store different pages separately somehow, will probably set messages per page to a fixed number
          this.storedMessageList.next(newMessages);
          // todo: replace this http post req with websockets for bi-communication
          // todo: actually, make a function to send and receive messages all under a single websocket stored in this service.
          // for now though, since sending and loading messages already works great,
          // we will be transmitting chatId through cookies, since i wanted to do that anyways to autoload last open chat on login
          cookieService.setCookie('chatId', newChatId);

          this.messageStream.close();
          this.messageStream = new EventSource('/api/streamMessages', { withCredentials: true }); // {withCredentials: true} ensures all cookies are sent
          this.messageStream.onmessage = (incomingEvent) => {
            console.log(`chat-context: received broadcast:`, incomingEvent.data);
            let message = JSON.parse(incomingEvent.data);
            let currentMessages = this.storedMessageList.value;
            currentMessages.push(message);
            this.storedMessageList.next(currentMessages);
            // todo: toggle this function if user chooses to scroll up
          }
        });
    });
    this.updateChatList();
  }
}

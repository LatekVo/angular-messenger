import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subscription } from "rxjs";
import { LocalStorageKeys as lsk } from "../enums/local-storage-keys";
import { HttpClient } from "@angular/common/http";
import { MessageModel } from "../models/messageModel";
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { CookieService } from "./cookie.service";
import { PopupHandlerService } from "./popup-handler.service"; // needed for message streaming

@Injectable({
  providedIn: 'root'
})
export class ChatContextService {
  storedOpenedChatId = new BehaviorSubject(localStorage.getItem(lsk.OPENED_CHAT_ID));
  storedMessageList = new BehaviorSubject([] as MessageModel[]);
  messageStreamSocket: WebSocketSubject<MessageModel> = webSocket('/');
  constructor(private http: HttpClient, private cookieService: CookieService, private popupService: PopupHandlerService) {
    let pagination = {
      batchAmount: 50,
      batchIndex: 0,
    }
    // We'll use two protocols, fetchMessages along with a paginator, and then fetchMessageUpdates, which will be a lingering call utilising an observable.
    // I'll take care of the pagination later, but what i have in mind right now is to create a wrapper around the scrollable area, which would auto set variables in some pagination class.
    // todo: cache results of fetchMessages, and check for them before sending a new request.
    // todo: sort each received message by whether it's authored by the current user.
    this.storedOpenedChatId.subscribe((newChatId) => {
      if (newChatId === null) {
        // popupService.dispatch('Opened a chat with no ID assigned!', 'error')
        throw new Error('opened a chat with no ID assigned');
      }
      this.http.post<{ messages: MessageModel[] }>('/api/fetchMessages', {chatId: newChatId, pagination: pagination})
        .pipe(map(body => body.messages.reverse()))
        .subscribe((newMessages) => {
          // ngrx would really come in handy here, for caching all the chats when context is switched.
          // I will have to store different pages separately somehow, will probably set messages per page to a fixed number
          this.storedMessageList.next(newMessages);

          // todo: replace this http post req with websockets for bi-communication
          // todo: actually, make a function to send and receive messages all under a single websocket stored in this service.
          // for now though, since sending and loading messages already works great,
          // we will be transmitting chatId through cookies, since i wanted to do that anyways to autoload last open chat on login
          cookieService.setCookie('chatId', newChatId);

          let messageStream = new EventSource('/api/streamMessages', { withCredentials: true }); // {withCredentials: true} ensures all cookies are sent
          messageStream.onmessage = (incomingEvent) => {
            console.log(`chat-context: received broadcast:`, incomingEvent.data);
            let message = JSON.parse(incomingEvent.data);
            let currentMessages = this.storedMessageList.value;
            currentMessages.push(message);
            this.storedMessageList.next(currentMessages);
            // todo: toggle this function if user chooses to scroll up
          }
        });
    });
  }
}

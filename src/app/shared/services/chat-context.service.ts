import { Injectable } from '@angular/core';
import {BehaviorSubject, map, Observable} from "rxjs";
import { LocalStorageKeys as lsk } from "../enums/local-storage-keys";
import { HttpClient } from "@angular/common/http";
import { MessageModel } from "../models/messageModel";

@Injectable({
  providedIn: 'root'
})
export class ChatContextService {
  storedOpenedChatId = new BehaviorSubject(localStorage.getItem(lsk.OPENED_CHAT_ID));
  storedMessageList = new BehaviorSubject([] as MessageModel[]);
  constructor(private http: HttpClient) {
    let pagination = {
      batchAmount: 50,
      batchIndex: 0,
    }
    // We'll use two protocols, fetchMessages along with a paginator, and then fetchMessageUpdates, which will be a lingering call utilising an observable.
    // I'll take care of the pagination later, but what i have in mind right now is to create a wrapper around the scrollable area, which would auto set variables in some pagination class.
    // todo: cache results of fetchMessages, and check for them before sending a new request.
    // todo: sort each received message by whether it's authored by the current user.
    this.storedOpenedChatId.subscribe((newChatId) => {
      this.http.post<{ messages: MessageModel[] }>('/api/fetchMessages', {chatId: newChatId, pagination: pagination})
        .pipe(map(body => body.messages))
        .subscribe((newMessages) => {
          // ngrx would really come in handy here, for caching all the chats when context is switched.
          // i will have to store different pages separately somehow, will probably set messages per page to a fixed number
          console.log(`chat-context.ts: updated message list for chat: ${newChatId}`, newMessages)
          this.storedMessageList.next(newMessages);
        });
    });
  }
}

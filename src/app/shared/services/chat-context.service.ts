import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { LocalStorageKeys as lsk } from "../enums/local-storage-keys";
import { HttpClient } from "@angular/common/http";
import { MessageModel } from "../models/messageModel";

@Injectable({
  providedIn: 'root'
})
export class ChatContextService {
  storedOpenedChatId = new BehaviorSubject(localStorage.getItem(lsk.OPENED_CHAT_ID));
  storedAvailableChatIdList = new BehaviorSubject([]);
  storedMessageList = new BehaviorSubject([]);
  constructor(private http: HttpClient) {
    let pagination = {
      batchAmount: 50,
      batchIndex: 0,
    }
    // We'll use two protocols, fetchMessages along with a paginator, and then fetchMessageUpdates, which will be a lingering call utilising an observable.
    // I'll take care of the pagination later, but what i have in mind right now is to create a wrapper around the scrollable area, which would auto set variables in some pagination class.
    this.http.post<MessageModel[]>('/api/fetchMessages', {chatId: this.storedOpenedChatId, pagination: pagination});


  }

}

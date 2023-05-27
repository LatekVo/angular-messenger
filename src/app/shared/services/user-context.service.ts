import {Injectable} from '@angular/core';
import {LocalStorageKeys as lsk} from '../enums/local-storage-keys';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

// TODO: this should have been made in Redux, and will need to be rewritten to Redux in future

@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  get userId() {
    // null value will signal that current user's id is unavailable, by now, it should be known that user is not logged in so user id will have to get re-requested
    return localStorage.getItem(lsk.USER_ID);
  }

  set userToken(newToken) {
    if (newToken)
      localStorage.setItem(lsk.USER_TOKEN, newToken);
  }

  get userToken() {
    // null value will be used by app initializer to check whether logging in with a token is possible
    return localStorage.getItem(lsk.USER_TOKEN);
  }

  get openedChatId() {
    // null value will signal there is no open chat, display a 'no open chat' banner in the chat field instead
    return localStorage.getItem(lsk.OPENED_CHAT_ID);
  }

  get availableChatIdList() {
    // null value for no open chats, just keep the 'new chat' button
    let availableChatIdListRaw = localStorage.getItem(lsk.AVAILABLE_CHAT_ID_LIST);

    if (availableChatIdListRaw !== null) {
      return JSON.parse(availableChatIdListRaw);
    } else {
      return null;
    }
  }

  constructor(private http: HttpClient) {

  }
}

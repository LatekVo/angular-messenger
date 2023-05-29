import {Injectable} from '@angular/core';
import {LocalStorageKeys as lsk} from '../enums/local-storage-keys';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {Router} from "@angular/router";
import {CookieService} from "./cookie.service";

// TODO: this should have been made in Redux, and will need to be rewritten to Redux in future

@Injectable({
  providedIn: 'root'
})
export class UserContextService {
  storedUserId = new BehaviorSubject(localStorage.getItem(lsk.USER_ID));
  storedUserToken = new BehaviorSubject(localStorage.getItem(lsk.USER_TOKEN));
  storedOpenedChatId = new BehaviorSubject(localStorage.getItem(lsk.OPENED_CHAT_ID));
  storedAvailableChatIdList = new BehaviorSubject([]);

  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) {
    // in case of recent login, parse all received cookies and move the data to localStorage
    let cookieUserToken = cookieService.getCookie(lsk.USER_TOKEN)
    if (cookieUserToken) {
      localStorage.setItem(lsk.USER_TOKEN, cookieUserToken);
      this.storedUserToken.next(cookieUserToken);
      cookieService.deleteCookie(lsk.USER_TOKEN);
    }
    let cookieUserId = cookieService.getCookie(lsk.USER_ID)
    if (cookieUserId) {
      localStorage.setItem(lsk.USER_ID, cookieUserId);
      this.storedUserToken.next(cookieUserId);
      cookieService.deleteCookie(lsk.USER_ID);
    }

    if (this.storedUserToken.value != null && this.storedUserId) {
      // unverified token present
      http.post('/api/tokenLogin', {token: this.storedUserToken.value}, {observe: "response"}).subscribe(response => {
        if (response.status === 200) {
          // login succeeded
          if (router.url === '/login') {
            router.navigate(['/', 'chat']).catch(err => console.log('navigation error: ' + err));
          }
        } else {
          // token expired
          localStorage.removeItem(lsk.USER_TOKEN);
          localStorage.removeItem(lsk.USER_ID);

          router.navigate(['/', 'login']).catch(err => console.log('navigation error: ' + err));
        }
      });
    } else {
      // no token present
      router.navigate(['/', 'login']).catch(err => console.log('navigation error: ' + err));
    }
  }
}

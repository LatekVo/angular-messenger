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

  checkForCookies() {

    // user token is initially transferred into local storage, but after it's verification, it has to be copied back to the cookie for http communication purposes
    let cookieUserToken = this.cookieService.getCookie(lsk.USER_TOKEN)
    if (cookieUserToken) {
      console.log('Cookie Found: USER_TOKEN');
      localStorage.setItem(lsk.USER_TOKEN, cookieUserToken);
      this.storedUserToken.next(cookieUserToken);
      //this.cookieService.deleteCookie(lsk.USER_TOKEN);
    }
    let cookieUserId = this.cookieService.getCookie(lsk.USER_ID)
    if (cookieUserId) {
      console.log('Cookie Found: USER_ID');
      localStorage.setItem(lsk.USER_ID, cookieUserId);
      this.storedUserId.next(cookieUserId);
      this.cookieService.deleteCookie(lsk.USER_ID);
    }
  }

  goToDefaultPage() {
    console.log('Stored values:', this.storedUserToken.value, this.storedUserId.value);
    if (this.storedUserToken.value != null && this.storedUserId.value != null) {
      console.log('INFO: credentials present, attempting automatic login');
      this.http.post('/api/validateSession', {}, {observe: "response"}).subscribe(response => {
        if (response.status === 200) {
          this.cookieService.setCookie('userToken', String(this.storedUserToken.value)); // session-long, ensures that if this cookie is invalid, it does not persist
          console.log('INFO: logged in with stored credentials');
          // login succeeded
          if (this.router.url === '/login') {
            this.router.navigate(['/', 'chat']).catch(err => console.log('navigation error: ' + err));
          }
        } else {
          console.log('INFO: stored token and userId expired, redirecting to login');
          // token expired
          localStorage.removeItem(lsk.USER_TOKEN);
          localStorage.removeItem(lsk.USER_ID);

          this.router.navigate(['/', 'login']).catch(err => console.log('navigation error: ' + err));
        }
      });
    } else {
      // no token present - new device
      this.router.navigate(['/', 'login']).catch(err => console.log('navigation error: ' + err));
    }

  }

  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) {
    this.checkForCookies();
    this.goToDefaultPage();
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  // code source: https://stackoverflow.com/a/52406518/14388269

  getCookie(key: string) {
    let match = document.cookie.match(RegExp('(?:^|;\\s*)' + key + '=([^;]*)'));
    return match ? match[1] : null;
  }

  setCookie(key: string, value: string, expiry?: Date) {
    if (expiry) {
      document.cookie = `${key}=${value};expires=${expiry.toUTCString()}`;
    } else {
      document.cookie = `${key}=${value}`;
    }
  }

  deleteCookie(key: string) {
    document.cookie = key +"=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }

  // direct copy: https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
  deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
  constructor() { }
}

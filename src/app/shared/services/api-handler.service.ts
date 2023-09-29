import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {BehaviorSubject} from "rxjs";

// thought about a couple of possible implementations for this, but I believe 1:1 pairing any new apiCalls through here
// as well as caching selected calls is the most sensible. With time, probably most if not all http calls will be migrated here

@Injectable({
  providedIn: 'root'
})
export class ApiHandlerService {
  // todo: either move this function to a util service or move message fetching here
  public deSanitize = (input: string) => {
    // reversal of the server-side function, this theoretically shouldn't be necessary, but angular does some unknown operations in the background which force me to de-sanitize these notations manually
    const map = new Map<string, string>([
      ['&lt;', '<'],
      ['&gt;', '>'],
      ['&quot;', '"'],
      ['&#x27;', "'"],
      ['&#x2F;', '/'],
      ['&grave;', '`'],
      //['&amp;', '&']
    ]);

    const reg = /[&<>"'/`]/ig;
    return input.replace(reg, (match: string): string => {
      let res = map.get(match);
      if (res)
        return res;
      else
        return '';

      //return map.get(match) ?? '';
    });
  }

  constructor(private http: HttpClient) { }

  private usernameCache: Map<string, BehaviorSubject<string>> = new Map();
  getUsername(id: string) {
    if (!this.usernameCache.has(id)) {
      this.usernameCache.set(id, new BehaviorSubject<string>(""));
      this.http.post<{username: string}>('/api/getUsername', {id: id}).subscribe({
        next: response => {
          this.usernameCache.get(id)?.next(this.deSanitize(response.username));
        },
        error: response => {}
      });
    }
    return this.usernameCache.get(id);
  }
}

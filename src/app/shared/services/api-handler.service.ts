import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {BehaviorSubject} from "rxjs";

// thought about a couple of possible implementations for this, but I believe 1:1 pairing any new apiCalls through here
// as well as caching selected calls is the most sensible. With time, probably most if not all http calls will be migrated here

@Injectable({
  providedIn: 'root'
})
export class ApiHandlerService {
  constructor(private http: HttpClient) { }

  private usernameCache: Map<string, BehaviorSubject<string>> = new Map();
  getUsername(id: string) {
    if (!this.usernameCache.has(id)) {
      this.usernameCache.set(id, new BehaviorSubject<string>(""));
      this.http.post<{username: string}>('/api/getUsername', {id: id}).subscribe({
        next: response => {
          this.usernameCache.get(id)?.next(response.username);
        },
        error: response => {}
      });
    }
    return this.usernameCache.get(id);
  }
}

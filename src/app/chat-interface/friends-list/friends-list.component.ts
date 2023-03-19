import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import {Friend} from "../../models/friend";
import {HttpClient} from "@angular/common/http";
import {catchError, throwError} from "rxjs";
import { cloneDeep } from 'lodash'; // it's absurd deepCloning isn't built in

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit {

  friendList: Friend[] = []

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchFriends().subscribe((friendList) => {
      this.friendList = friendList;
    })

    // fixme: temporarily hardcoded
    this.friendList = [
      // placeholder values for testing
      {firstName: "Bob", lastName: "Drew", pfpSourceUrl: "/assets/placeholder_pfp.png"},
      {firstName: "Ale", lastName: "Moin", pfpSourceUrl: "/assets/placeholder_pfp.png"},
      {firstName: "Lew", lastName: "Berg", pfpSourceUrl: "/assets/placeholder_pfp.png"}
    ]
  }

  // TODO: add API for fetchFriendList

  fetchFriends(): Observable<Friend[]> {
    return this.http.get<Friend[]>('/api/fetchFriendList');
  }

  // we are using the ngModel to bind the input box to this var
  searchInput: string = "";
}

// search box custom filter
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'friendFilter',
  pure: false // setting pure to false enables the pipe to re-run on every change detection cycle
})
export class FriendFilterPipe implements PipeTransform {
  transform(friends: Friend[], searchText: string): Friend[] {
    if (!friends || !searchText) {
      return friends;
    }

    searchText = searchText.toLowerCase();
    return friends.filter(friend =>
      friend.firstName.toLowerCase().includes(searchText) ||
      friend.lastName.toLowerCase().includes(searchText)
    );
  }
}

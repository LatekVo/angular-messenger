import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PersonModel } from "../../shared/models/personModel";
import { HttpClient } from "@angular/common/http";
import { PersonNameOrSurnamePipe } from "../../shared/pipes/person-name-or-surname.pipe";
import {ChatModel} from "../../shared/models/chatModel";

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit {

  friendList: PersonModel[] = []
  chatList: ChatModel[] = []

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // todo: profile pictures: will be hosted on a static get server, with all images being [id].png, this will allow us to add an change images for anything that could be a db object, since ids are unique globally
    // fixme: temporarily hardcoded
    this.chatList = [
      // placeholder values for testing
      {name: "Bob Drew", id: "13231", pfpSourceUrl: "/assets/placeholder_pfp.png"},
      {name: "Ale Moin", id: "51266", pfpSourceUrl: "/assets/placeholder_pfp.png"},
      {name: "Lew Berg", id: "91427", pfpSourceUrl: "/assets/placeholder_pfp.png"}
    ]

    this.friendList = [
      // placeholder values for testing
      {username: "Bob Drew", id: "61223", pfpSourceUrl: "/assets/placeholder_pfp.png"},
      {username: "Ale Moin", id: "52323", pfpSourceUrl: "/assets/placeholder_pfp.png"},
      {username: "Lew Berg", id: "97602", pfpSourceUrl: "/assets/placeholder_pfp.png"}
    ]

    this.fetchFriends().subscribe((rawFriendIdList) => {
      // use raw IDs to get all remaining data required
      this.friendList = rawFriendIdList.map((friendId) => {
        // immediately accessible data is set using map(), rest of the data will be requested using forEach()
        return {
          username: undefined,
          id: friendId,
          pfpSourceUrl: `${friendId}.png`
        }
      });

      this.friendList.forEach((friend, listIndex, listObject) => {
        // firstName: [downloaded]; lastName: [downloaded]; id: [id]; pfpSourceUrl: [id].png;
        // keep in mind that there will be as many of these subscriptions as there are friends
        this.http.post<string>('/api/getUsername', {id: friend.id}).subscribe((username) => {
          listObject[listIndex].username = username;
        });
      });
    })

    // name: [downloaded]; id: [id]; pfpSourceUrl: [id].png;

  }

  // TODO: add API for fetchFriendList

  fetchFriends(): Observable<string[]> {
    return this.http.get<string[]>('/api/fetchFriendList');
  }



  // we are using the ngModel to bind the input box to this var
  searchInput: string = "";
}

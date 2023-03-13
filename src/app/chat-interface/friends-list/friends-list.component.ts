import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {Friend} from "../../models/friend";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit{
  friendList: Friend[] = [
    // placeholder values for testing
    {firstName: "Bob", lastName: "Drew", pfpSourceUrl: "/assets/placeholder_pfp.png"},
    {firstName: "Ale", lastName: "Moin", pfpSourceUrl: "/assets/placeholder_pfp.png"},
    {firstName: "Lew", lastName: "Berg", pfpSourceUrl: "/assets/placeholder_pfp.png"}
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchFriends().subscribe((friendList) => {
      this.friendList = friendList;
    });
  }

  fetchFriends(): Observable<Friend[]> {
    return this.http.get<Friend[]>('/api/fetchFriendList');
  }
}

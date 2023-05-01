import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PersonModel } from "../../shared/models/personModel";
import { HttpClient } from "@angular/common/http";
import { PersonNameOrSurnamePipe } from "../../shared/pipes/person-name-or-surname.pipe";

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit {

  friendList: PersonModel[] = []

  constructor(private http: HttpClient, private personNameOrSurnamePipe: PersonNameOrSurnamePipe) {}

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

  fetchFriends(): Observable<PersonModel[]> {
    return this.http.get<PersonModel[]>('/api/fetchFriendList');
  }

  // we are using the ngModel to bind the input box to this var
  searchInput: string = "";
  protected readonly PersonNameOrSurnamePipe = PersonNameOrSurnamePipe;
}

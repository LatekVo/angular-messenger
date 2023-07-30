import { Component, OnInit } from '@angular/core';
import {map, Observable, of} from 'rxjs';
import { PersonModel } from "../../shared/models/personModel";
import { HttpClient } from "@angular/common/http";
import { PersonNameOrSurnamePipe } from "../../shared/pipes/person-name-or-surname.pipe";
import {ChatModel} from "../../shared/models/chatModel";
import {PopupHandlerService} from "../../shared/services/popup-handler.service";

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit {

  friendList: PersonModel[] = [];
  chatList: ChatModel[] = [];

  // ngModel values
  searchInput: string = "";
  newChatName: string = '';
  joinChatLink: string = '';

  constructor(private http: HttpClient, private popupService: PopupHandlerService) {}

  ngOnInit() {
    // todo: profile pictures: will be hosted on a static get server, with all images being [id].png, this will allow us to add an change images for anything that could be a db object, since ids are unique globally
    // name: [downloaded]; id: [id]; pfpSourceUrl: [id].png;

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
    });

    this.fetchChats().subscribe((rawChatIdList) => {
      console.log('chats raw IDs: ', rawChatIdList)
      this.chatList = rawChatIdList.map((chatId) => {
        return {
          chatName: undefined,
          chatId: chatId,
          pfpSourceUrl: `${chatId}.png`
        }
      });

      this.chatList.forEach((chat, listIndex, listObject) => {
        // it's weird but for some reason after chat.chatId is sent, while it's supposed to be plain string it's actually outright an object {chatId: string}
        this.http.post<{chatName: string}>('/api/getChatName', {chatId: chat.chatId}).pipe(map(body => body.chatName)).subscribe((chatName) => {
          listObject[listIndex].chatName = chatName;
        });
      });
    });
  }

  // TODO: add API for fetchFriendList

  fetchFriends(): Observable<string[]> {
    console.log('fetching users');
    return this.http.post<{friends: string[]}>('/api/fetchFriends', {}).pipe(map(body => body.friends));
  }

  fetchChats(): Observable<string[]> {
    console.log('fetching chats');
    return this.http.post<{chats: string[]}>('/api/fetchChats', {}).pipe(map(body => body.chats));
  }

  // todo: throttle chat creation, put a limit on users, perhaps max 3 new groups daily, 20 monthly, max 50. To create new ones you have to delete the old ones.
  createChat(chatName: string): void {
    this.http.post<{chatId: string}>('/api/createChat', {chatName: chatName}, {observe: "response"}).subscribe({
      next: (response) => {
        console.log(`created new chat: ${response.body?.chatId}`);
        this.popupService.dispatch('Created chat successfully!', 'ok');
      },
      error: (response) => {
        console.log(`couldn't create chat: `, response);
        this.popupService.dispatchFromResponse(response);
      }
    });
  }

  joinChat(chatLink: string): void {
    this.http.post<{chatId: string}>('/api/joinChat', {chatInvite: chatLink}, {observe: "response"}).subscribe({
      next: (response) => {
        console.log(`joined chat: ${response.body?.chatId}`);
        this.popupService.dispatch('Created chat successfully!', 'ok');
      },
      error: (response) => {
        console.log(`couldn't join chat: `, response);
        this.popupService.dispatchFromResponse(response);
      }
    });
  }
}

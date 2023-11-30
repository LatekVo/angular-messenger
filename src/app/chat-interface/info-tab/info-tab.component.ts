import { Component } from '@angular/core';
import { ChatContextService } from "../../shared/services/chat-context.service";
import { PopupHandlerService } from "../../shared/services/popup-handler.service";
import { HttpClient } from "@angular/common/http";
import { InviteLinkModel } from "../../shared/models/inviteLinkModel";
import {response} from "express";
import {PersonModel} from "../../shared/models/personModel";
import {UserContextService} from "../../shared/services/user-context.service";

@Component({
  selector: 'app-info-tab',
  templateUrl: './info-tab.component.html',
  styleUrls: ['./info-tab.component.css']
})
export class InfoTabComponent {
  inviteLinkList = [] as InviteLinkModel[];
  chatMemberList = [] as PersonModel[];

  updateInviteLinkList() {
    this.http.post<{ inviteLinkList: InviteLinkModel[] }>('/api/fetchChatInviteLinks', {chatId: this.chatContextService.storedOpenedChatId.value}).subscribe((response) => {
      this.inviteLinkList = response.inviteLinkList;
    });
  }

  updateChatMemberList() {
    this.http.post<{ chatMemberList: PersonModel[] }>('/api/fetchChatMembers', {chatId: this.chatContextService.storedOpenedChatId.value}).subscribe((response) => {
      this.chatMemberList = response.chatMemberList;
      // fill in username and pfp
      this.chatMemberList.forEach((userObject) => {
        userObject.pfpSourceUrl = `${userObject.id}.png`;
        this.http.post<{ username: string }>('/api/getUsername', {id: userObject.id}).subscribe((response) => {
          userObject.username = response.username;
        });
      });
    });
  }

  constructor(public chatContextService: ChatContextService, public userContextService: UserContextService, private popupHandlerService: PopupHandlerService, private http: HttpClient) {

    // on chat change: update invite & user list
    chatContextService.storedOpenedChatId.subscribe((newChatId) => {
      this.updateInviteLinkList();
      this.updateChatMemberList();
    });
    this.updateInviteLinkList();
    this.updateChatMemberList();
  }
  reloadServerImage() {
    // todo: temporary solution, in future i want every server image to be hooked up to an interpolated value, which is also listening to server for changes
    this.chatContextService.updateCurrentChatImageUrl();
  }

  changeServerImage(event: any) {
    // todo: reload image after 1, 2 and 3 seconds
    const image: File = event?.target?.files[0];
    if (image && this.chatContextService.storedOpenedChatId.value) {
      console.log(image);
      let formData = new FormData();
      formData.append('chatId', this.chatContextService.storedOpenedChatId.value);
      formData.append('image', image, image.name);
      this.http.post("/api/setServerImage", formData).subscribe({
        next: () => {
          this.reloadServerImage();
        },
        error: response => {
          this.popupHandlerService.dispatchFromResponse(response);
        }
      });
    }

  }

  startVoiceCall() {

  }

  inviteUserToServer() {
    // todo: implement this in future along with personal app notifications
  }

  createServerInvite() {
    this.http.post<InviteLinkModel>('/api/createChatInviteLink', {chatId: this.chatContextService.storedOpenedChatId.value}).subscribe((response) => {
      this.displayInvitePopup(response.id);
      this.updateInviteLinkList();
    });
  }

  openServerSettings() {

  }

  copyToClipboard(input: any) {
    navigator.clipboard.writeText(input).then(
      () => {
        this.popupHandlerService.dispatch(`Link copied to clipboard`, "info");
      },
      () => {
        this.popupHandlerService.dispatch(`Couldn't copy to clipboard`, "error");
      },
    );
  }

  revokeInvite(inviteId: any) {
    this.http.post('/api/removeChatInviteLink', {inviteId: inviteId}, {observe: 'response'}).subscribe({
      next: () => {
        this.updateInviteLinkList();
      },
      error: (err) => {
        this.popupHandlerService.dispatchFromResponse(err);
      }
    });
  }

  displayInvitePopup(inviteId: any) {
    this.popupHandlerService.displayInviteDetails(inviteId);
  }

  sendFriendRequest(userId: string) {
    this.http.post('/api/addFriend', {friendId: userId}, {observe: 'response'}).subscribe({
      next: () => {
        this.popupHandlerService.dispatch('Successfully sent a friend request!', "ok");
      },
      error: (err) => {
        this.popupHandlerService.dispatchFromResponse(err);
      }
    });
  }

  removeFromServer(userId: string) {
    this.http.post('/api/removeChatMember', {chatId: this.chatContextService.storedOpenedChatId.value, userId: userId}, {observe: 'response'}).subscribe({
      next: () => {
        this.updateChatMemberList();
      },
      error: (err) => {
        this.popupHandlerService.dispatchFromResponse(err);
      }
    });
  }

  displayProfileDetails() {
    // todo: placeholder, in future either just display the details or remove this functionality entirely
    this.popupHandlerService.displayUserSettings();
  }

  displayProfileSettings() {
    this.popupHandlerService.displayUserSettings();
  }

  logOut() {
    this.userContextService.logOut();
  }
}

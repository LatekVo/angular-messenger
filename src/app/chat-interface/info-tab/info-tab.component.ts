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

  changeServerPfp() {

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

  displayProfileDetails() {

  }

  displayProfileSettings() {

  }

  logOut() {
    this.userContextService.logOut();
  }
}

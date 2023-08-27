import { Component } from '@angular/core';
import { ChatContextService } from "../../shared/services/chat-context.service";
import { PopupHandlerService } from "../../shared/services/popup-handler.service";
import { MatDialogModule } from '@angular/material/dialog';
import {HttpClient} from "@angular/common/http";
import {MessageModel} from "../../shared/models/messageModel";
import {InviteLinkModel} from "../../shared/models/inviteLinkModel";

@Component({
  selector: 'app-info-tab',
  templateUrl: './info-tab.component.html',
  styleUrls: ['./info-tab.component.css']
})
export class InfoTabComponent {

  constructor(public chatContextService: ChatContextService, private popupHandlerService: PopupHandlerService, private http: HttpClient) {
    //
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

    });
  }

  openServerSettings() {

  }

  copyToClipboard(input: any) {
    const type = "text/plain";
    const blob = new Blob([input], { type });
    const data = [new ClipboardItem({ [type]: blob })];

    navigator.clipboard.write(data).then(
      () => {
        this.popupHandlerService.dispatch(`Link copied to clipboard`, "info");
      },
      () => {
        this.popupHandlerService.dispatch(`Couldn't copy to clipboard`, "error");
      },
    );
  }

  revokeInvite(input: any) {

  }

  displayInvitePopup(inviteId: any) {
    this.popupHandlerService.displayInviteDetails(inviteId);
  }
}

import { Component, Inject } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from "@angular/common/http";
import { InviteLinkModel } from "../../models/inviteLinkModel";

@Component({
  selector: 'app-invite-info',
  templateUrl: './invite-info.component.html',
  styleUrls: ['./invite-info.component.css']
})
export class InviteInfoComponent {
  // the dialogRef is only a self-reference, main api through dialog.open().
  inviteDetails: InviteLinkModel = {} as InviteLinkModel;
  inviteIssuerName: string = '';
  inviteChatName: string = '';

  private fillMissingDetails() {
    this.http.post<{ username: string }>('/api/getUsername', {id: this.inviteDetails.authorId}).subscribe({
      next: (response) => {
        this.inviteIssuerName = response.username;
      },
      error: () => {}
    });
    this.http.post<{ chatName: string }>('/api/getChatName', {chatId: this.inviteDetails.chatId}).subscribe({
      next: (response) => {
        this.inviteChatName = response.chatName;
      },
      error: () => {}
    });
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: {inviteId: string | undefined, invite: InviteLinkModel | undefined}, private http: HttpClient, public dialogRef: MatDialogRef<InviteInfoComponent>) {
    if (data.invite) {
      this.inviteDetails = data.invite;
      this.fillMissingDetails();
    } else {
      this.http.post<{ invite: InviteLinkModel }>('/api/getInviteLinkDetails', {inviteId: data.inviteId}).subscribe({
        next: (response) => {
          this.inviteDetails = response.invite;
          this.fillMissingDetails();
        },
        error: () => {}
      });
    }
  }
}

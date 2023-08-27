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
  constructor(@Inject(MAT_DIALOG_DATA) public data: {inviteId: string}, private http: HttpClient, public dialogRef: MatDialogRef<InviteInfoComponent>) {
    this.http.post<{ invite: InviteLinkModel }>('/api/getInviteLinkDetails', {inviteId: data.inviteId}).subscribe({
      next: (response) => {
        this.inviteDetails = response.invite;
      },
      error: () => {}
    });
  }
}

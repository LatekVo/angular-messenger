import { Injectable } from '@angular/core';
import { HttpResponse } from "@angular/common/http";
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationSnackBarComponent } from "../components/notification-snack-bar/notification-snack-bar.component";
import { MatDialog } from '@angular/material/dialog';
import { InviteInfoComponent } from "../components/invite-info-dialog/invite-info.component";
import { UserSettingsDialogComponent } from "../components/user-settings-dialog/user-settings-dialog.component";
import { InviteLinkModel } from "../models/inviteLinkModel";

@Injectable({
  providedIn: 'root'
})
export class PopupHandlerService {

  constructor(private snackBar: MatSnackBar, private dialog: MatDialog) { }

  dispatch(text: string, type: 'ok' | 'info' | 'error') {
    // this feature is usually called a 'snackbar' in Angular documentation.
    // Here is a link to the Ang. Mat. API: https://material.angular.io/components/snack-bar/overview

    // TODO: THIS HAS TO BE OPENED FROM A CUSTOM COMPONENT, IMPLEMENTING {TEXT, TYPE}
    this.snackBar.openFromComponent(NotificationSnackBarComponent, {data: {text: text, type: type}, duration: 2000});
  }

  dispatchFromResponse(response: HttpResponse<any>) {
    if (response.statusText) {
      if (response.status >= 100 && response.status <= 199) {
        this.dispatch(response.statusText, 'info');
      } else if (response.status >= 200 && response.status < 299) {
        this.dispatch(response.statusText, 'ok');
      } else {
        this.dispatch(response.statusText, 'error');
      }
    }
  }

  // relocated this function to global service, as it will be accessed from friends-list component as well.
  displayInviteDetails(invite: string | InviteLinkModel) {
    if (typeof invite == "string") {
      this.dialog.open(InviteInfoComponent, {
        data: { inviteId: invite }
      });
    } else {
      this.dialog.open(InviteInfoComponent, {
        data: { invite: invite }
      });
    }
  }

  displayUserSettings() {
    this.dialog.open(UserSettingsDialogComponent);
  }
}

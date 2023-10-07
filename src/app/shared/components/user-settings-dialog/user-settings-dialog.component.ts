import { Component } from '@angular/core';
import {UserContextService} from "../../services/user-context.service";
import {HttpClient} from "@angular/common/http";
import {PopupHandlerService} from "../../services/popup-handler.service";

@Component({
  selector: 'app-user-settings-dialog',
  templateUrl: './user-settings-dialog.component.html',
  styleUrls: ['./user-settings-dialog.component.css']
})
export class UserSettingsDialogComponent {
  constructor(public userContextService: UserContextService, private http: HttpClient, private popupService: PopupHandlerService) {

  }

  setUserProfilePicture(event: any) {
    const image: File = event?.target?.files[0];
    // to transmit blob files we have to use Form object
    if (image) {
      console.log(image);
      let formData = new FormData();
      formData.append('image', image, image.name);
      this.http.post("/api/setUserImage", formData).subscribe({
        next: () => {},
        error: response => {
          this.popupService.dispatchFromResponse(response);
        }
      });
    }

  }
}

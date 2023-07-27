import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar'; // transfers data from parent-service
// for more info check: https://v6.material.angular.io/components/snack-bar/overview#sharing-data-with-a-custom-snack-bar
@Component({
  selector: 'app-notification-snack-bar',
  templateUrl: './notification-snack-bar.component.html',
  styleUrls: ['./notification-snack-bar.component.css']
})
export class NotificationSnackBarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { text: string, type: 'ok' | 'info' | 'error' }) {}
}

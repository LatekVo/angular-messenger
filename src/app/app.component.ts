import { Component } from '@angular/core';
import {UserContextService} from "./shared/services/user-context.service";
import {ChatContextService} from "./shared/services/chat-context.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-messenger';

  // these two services download and manage important initialization data, they have to be loaded regardless of if their functions are needed or not
  constructor(private userContextService: UserContextService, private chatContextService: ChatContextService) {}
}

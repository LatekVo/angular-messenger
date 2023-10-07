import { Component, OnInit, ApplicationRef, NgZone } from '@angular/core';
import { MessageModel } from "../../shared/models/messageModel";
import { HttpClient } from "@angular/common/http";
import { ChatContextService } from "../../shared/services/chat-context.service";
import { PopupHandlerService } from "../../shared/services/popup-handler.service";


// todo: move all network components to a separate 'API interaction' service

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.css']
})
export class TextAreaComponent implements OnInit {
  messageList: MessageModel[] = []; // this seems unnecessary, but is an important interface between the behaviour subject and html
  constructor(private http: HttpClient, private popupService: PopupHandlerService, public chatContextService: ChatContextService, private appRef: ApplicationRef, private ngZone: NgZone) {}

  ngOnInit() {
    this.chatContextService.storedMessageList.subscribe(() => {
      // todo: this is an update-detection manual trigger to trigger reloading of ngFor, i want this implemented into a global service
      this.ngZone.run(() => {
        this.appRef.tick();
      });
      let element = document.getElementById('conversation-box');
      if (element) {
        element.scrollTop = element.scrollHeight
      }
    });

    // simply scroll down on new chat id
    this.chatContextService.storedOpenedChatId.subscribe(() => {
      let element = document.getElementById('conversation-box');
      if (element) {
        element.scrollTop = element.scrollHeight
      }
    });
  }

  messageInput: string = "";
  extractUrl(content: string) {
    // match for @image(XXX), match[1] contains URL captured by the (.*?) fragment
    let match = content.match(/@image\((.*?)\)/);
    if (match)
      return match[1];
    else
      return null;
  }

  checkIsImage(content: string) {
    // todo: if efficiency ever becomes a concern, simplyfy the line below to just check for @image (more fixes may be necessary)
    return (this.extractUrl(content) !== null);
  }

  getImageUrl(content: string) {
    // todo: add delay to this, or even better, only when referencing own image, as the img element is activated before the image is available to the server
    return this.extractUrl(content);
  }

  sendMessage() {
    this.http.post('/api/sendMessage', {content: this.messageInput, chatId: this.chatContextService.storedOpenedChatId.value}, {observe: "response"}).subscribe({
      next: () => {},
      error: response => {
        this.popupService.dispatchFromResponse(response);
      }
    });
    this.messageInput = "";
  }

  sendImage(event: any) {
    const image: File = event?.target?.files[0];
    // to transmit blob files we have to use Form object
    if (image && this.chatContextService.storedOpenedChatId.value) {
      console.log(image);
      let formData = new FormData();
      formData.append('chatId', this.chatContextService.storedOpenedChatId.value);
      formData.append('image', image, image.name);
      this.http.post("/api/sendImage", formData).subscribe({
        next: () => {},
        error: response => {
          this.popupService.dispatchFromResponse(response);
        }
      });
    }
  }
}

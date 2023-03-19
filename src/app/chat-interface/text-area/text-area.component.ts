import {Component, OnInit} from '@angular/core';
import {Message} from "../../models/message";
import {Observable} from "rxjs";
import {Friend} from "../../models/friend";
import {HttpClient} from "@angular/common/http";

// todo: move all network components to a separate 'API interaction' service

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.css']
})
export class TextAreaComponent implements OnInit {
  messageList: Message[] = []

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // template messages
    this.messageList = [
      {senderId: "123", content: "Hi!", senderName: "Joe Brakes", writtenByMe: false},
      {senderId: "221", content: "Hello", senderName: "Alex", writtenByMe: true},
      {senderId: "221", content: "Do i know you?", senderName: "Alex", writtenByMe: true},
      {senderId: "123", content: "Sure,\nyou\ndo\nknow\nme", senderName: "Joe Brakes", writtenByMe: false},
      {senderId: "123", content: "I'm Joe Brakes!", senderName: "Joe Brakes", writtenByMe: false},
    ]
  }

  /* todo: complete this after implementing the proper API
  fetchMessages(): Observable<Friend[]> {
    return this.http.get<Friend[]>('/api/fetchMessages');
  }
  */

}

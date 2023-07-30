import { Pipe, PipeTransform } from '@angular/core';
import {PersonModel} from "../models/personModel";
import {ChatModel} from "../models/chatModel";

@Pipe({
  name: 'chatName'
})
export class ChatNamePipe implements PipeTransform {
  transform(chatSet: ChatModel[], searchText: string): ChatModel[] {
    if (!chatSet || !searchText) {
      return chatSet;
    }

    searchText = searchText.toLowerCase();
    return chatSet.filter(chat =>
      chat.chatName?.toLowerCase().includes(searchText.toLowerCase())
    );
  }
}

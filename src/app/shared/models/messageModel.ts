import {BehaviorSubject} from "rxjs";

export interface MessageModel {
  id: string;
  content: string;
  senderId: string; // will probably be expressed as a unique id that will later be locally mapped to username and other details
  dateCreated: Date;
  // set this locally, while redundant, these simplify ui rendering and permission logic a lot
  // these will be sent in by the server as undefined, so they won't take up any additional space anyway

  senderName: BehaviorSubject<string> | undefined;
  writtenByMe: boolean | undefined;
}

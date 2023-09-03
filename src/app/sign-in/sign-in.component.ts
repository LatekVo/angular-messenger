import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {UserContextService} from "../shared/services/user-context.service";
import {tap} from "rxjs";
import {PopupHandlerService} from "../shared/services/popup-handler.service";
import {ChatContextService} from "../shared/services/chat-context.service"; // used for sending the forms out

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],

})
export class SignInComponent {

  showLoginForm: boolean = true;

  // both registering and logging in will be executed on the same page, I will use ngIf to switch between the two actions
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(private http: HttpClient, private userContextService: UserContextService, private popupService: PopupHandlerService, private chatContextService: ChatContextService) {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      passwordRepeat: new FormControl('', [Validators.required, Validators.minLength(8)])

    });

    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  submitRegisterForm() {
    const formData = this.registerForm.value;
    this.http.post('/api/register', formData, {observe: "response"}).pipe(
      tap({
        next: response => {
          console.log('Successful registration!');
          this.showLoginForm = true;
        },
        error: error => console.error('Error!', error)
      }))
      .subscribe ({
        next: response => {
          console.log('Successful registration!');
          this.showLoginForm = true;
        },
        error: error => console.error('Error!', error)
    });
  }

  submitLoginForm() {
    console.log(this.loginForm.value)

    const formData = this.loginForm.value;
    this.http.post('/api/login', formData).subscribe ({
      next: response => {
        console.log('Successful login!');
        this.userContextService.checkForCookies();
        this.userContextService.goToDefaultPage();
        this.chatContextService.updateChatList();
      },
      error: error => {
        console.error('Error!', error);
        this.popupService.dispatch('Invalid username or password!', 'error')
      }
    });
  }
}

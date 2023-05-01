import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // used for sending the forms out

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

  constructor(private http: HttpClient) {
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
    console.log(this.registerForm.value)

    const formData = this.registerForm.value;
    this.http.post('/api/register', formData).subscribe ({
      next: response => console.log('Success!', response),
      error: error => console.error('Error!', error)
    });
  }

  submitLoginForm() {
    console.log(this.loginForm.value)

    const formData = this.loginForm.value;
    this.http.post('/api/login', formData).subscribe ({
      next: response => console.log('Success!', response),
      error: error => console.error('Error!', error)
    });
  }
}

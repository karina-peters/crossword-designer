import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { AuthService } from "legacy/src/app/services/auth.service";

@Component({
  selector: "app-header-nav",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.scss"],
})
export class SignInComponent implements OnInit {
  public invalidPassword: boolean = false;

  public signInForm = new FormGroup({
    email: new FormControl("", Validators.email),
    password: new FormControl("", Validators.required),
  });

  public get email() {
    return this.signInForm.get("email");
  }

  public get password() {
    return this.signInForm.get("password");
  }

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {}

  public onSignIn() {
    this.authService.signIn(this.signInForm.value.email, this.signInForm.value.password).subscribe(
      () => {
        this.invalidPassword = false;
        this.router.navigateByUrl("/load");
      },
      (error: ErrorEvent) => {
        if (error.message.includes("auth/invalid-login-credentials")) {
          this.invalidPassword = true;
        } else {
          alert("Failed to authenticate: " + error.message);
        }
      },
    );
  }
}

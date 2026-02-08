import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { of, throwError } from "rxjs";

import { SignInComponent } from "./sign-in.component";
import { AuthService } from "legacy/src/app/services/auth.service";

describe("SignInComponent", () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;

  const routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);
  const authServiceSpy = jasmine.createSpyObj("AuthService", ["signIn"]);

  beforeEach(async () => {
    authServiceSpy.signIn.and.returnValue(of(undefined));

    spyOn(window, "alert");

    await TestBed.configureTestingModule({
      declarations: [SignInComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("onSignIn", () => {
    it("should re-route when sign in successful", () => {
      component.signInForm.setValue({ email: "test@email.com", password: "password" });
      fixture.detectChanges();

      component.onSignIn();

      expect(component.invalidPassword).toEqual(false);
      expect(authServiceSpy.signIn).toHaveBeenCalledWith("test@email.com", "password");
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/load");
    });

    it("should set invalidPassword to true when invalid password", () => {
      const errorMsg = "auth/invalid-login-credentials";
      authServiceSpy.signIn.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });
      component.signInForm.setValue({ email: "test@email.com", password: "wrongPassword" });
      fixture.detectChanges();

      component.onSignIn();

      expect(component.invalidPassword).toEqual(true);
      expect(authServiceSpy.signIn).toHaveBeenCalledWith("test@email.com", "wrongPassword");
      expect(window.alert).not.toHaveBeenCalled();
    });

    it("should alert failure when sign in fails", () => {
      const errorMsg = "Sign in failed";
      authServiceSpy.signIn.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });
      component.signInForm.setValue({ email: "test@email.com", password: "password" });
      fixture.detectChanges();

      component.onSignIn();

      expect(authServiceSpy.signIn).toHaveBeenCalledWith("test@email.com", "password");
      expect(window.alert).toHaveBeenCalledWith("Failed to authenticate: Sign in failed");
    });
  });
});

import { TestBed } from "@angular/core/testing";
import { User, UserInfo } from "@angular/fire/auth";

import { of, throwError } from "rxjs";

import { AuthService } from "./auth.service";
import { FirebaseService } from "./firebase.service";
import { UserDoc } from "../models/user.model";

describe("AuthService", () => {
  let service: AuthService;

  const firebaseServiceSpy = jasmine.createSpyObj("FirebaseService", ["signInUser", "signOutUser", "getCurrentUser"]);

  const testUserInfo: UserInfo = {
    displayName: "Test Name",
    email: "test@email.com",
    uid: "test-uid",
    phoneNumber: "",
    photoURL: "",
    providerId: "",
  };

  const testUser: UserDoc = {
    name: "Test Name",
    email: "test@email.com",
    id: "test-uid",
  };

  beforeEach(() => {
    firebaseServiceSpy.signInUser.and.returnValue(of(undefined));
    firebaseServiceSpy.signOutUser.and.returnValue(of(undefined));
    firebaseServiceSpy.getCurrentUser.and.returnValue(testUserInfo);

    TestBed.configureTestingModule({
      providers: [{ provide: FirebaseService, useValue: firebaseServiceSpy }],
    });
    service = TestBed.inject(AuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("signIn", () => {
    it("should do nothing when successful", () => {
      service.signIn("test@email.com", "password").subscribe(() => {
        expect(firebaseServiceSpy.signInUser).toHaveBeenCalledWith("test@email.com", "password", service.authChangeCallback);
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to sign in";
      firebaseServiceSpy.signInUser.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.signIn("test@email.com", "password").subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("signOut", () => {
    it("should do nothing when successful", () => {
      service.signOut().subscribe(() => {
        expect(firebaseServiceSpy.signOutUser).toHaveBeenCalled();
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to sign out";
      firebaseServiceSpy.signOutUser.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.signOut().subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user", () => {
      expect(service.currentUser).toEqual(testUser);
    });

    it("should return null", () => {
      firebaseServiceSpy.getCurrentUser.and.returnValue(null);

      expect(service.currentUser).toBeNull();
    });
  });

  describe("authChangeCallback", () => {
    it("should emit current user", () => {
      service.authChangeCallback({ uid: "test-callback-id" } as User);
      service.currentUserId$.subscribe((id) => {
        expect(id).toEqual("test-callback-id");
      });
    });
  });
});

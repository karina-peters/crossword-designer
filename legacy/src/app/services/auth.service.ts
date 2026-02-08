import { Injectable } from "@angular/core";
import { User, UserCredential } from "@angular/fire/auth";

import { BehaviorSubject, Observable } from "rxjs";
import { catchError } from "rxjs/operators";

import { FirebaseService } from "./firebase.service";
import { UserDoc } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public currentUserId$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

  public get currentUser(): UserDoc | null {
    const user = this.firebaseService.getCurrentUser();
    return user
      ? {
          id: user.uid,
          email: user.email,
          name: user.displayName,
        }
      : null;
  }

  constructor(private firebaseService: FirebaseService) {
    this.currentUserId$.next(this.firebaseService.getCurrentUser()?.uid);
  }

  public signIn(email: string, password: string): Observable<UserCredential | null> {
    return this.firebaseService.signInUser(email, password, this.authChangeCallback).pipe(
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  public signOut(): Observable<void> {
    return this.firebaseService.signOutUser().pipe(
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  public authChangeCallback = (user: User | null) => {
    this.currentUserId$.next(user?.uid);
  };
}

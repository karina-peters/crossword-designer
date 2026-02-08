import { Injectable } from "@angular/core";
import {
  User,
  UserCredential,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "@angular/fire/auth";
import { documentId, or, query, where } from "@angular/fire/firestore";
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  getFirestore,
  QuerySnapshot,
  QueryCompositeFilterConstraint,
} from "firebase/firestore";
import { Observable, from } from "rxjs";
import { switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class FirebaseService {
  constructor() {}

  public addDoc(path: string, data: any): Observable<DocumentReference> {
    const db = getFirestore();
    const coll = collection(db, path);

    return from(addDoc(coll, data));
  }

  public updateDoc(path: string, docId: string, data: any): Observable<void> {
    const db = getFirestore();
    const coll = collection(db, path);

    return from(updateDoc(doc(coll, docId), data));
  }

  public setDoc(path: string, docId: string, data: any): Observable<void> {
    const db = getFirestore();
    const coll = collection(db, path);

    return from(setDoc(doc(coll, docId), data));
  }

  public getDoc(path: string, docId: string): Observable<DocumentSnapshot<DocumentData>> {
    const db = getFirestore();
    const coll = collection(db, path);

    return from(getDoc(doc(coll, docId)));
  }

  public getDocsWithIds(path: string, ids: Array<string>): Observable<QuerySnapshot<DocumentData>> {
    const db = getFirestore();
    const q = query(collection(db, path), where(documentId(), "in", ids));

    return from(getDocs(q));
  }

  public getDocsWhereEquals(path: string, props: Array<{ key: string; value: any }>): Observable<QuerySnapshot<DocumentData>> {
    const db = getFirestore();
    const constraints = props.map((p) => where(p.key, "==", p.value));
    const q = query(collection(db, path), or(...constraints));

    return from(getDocs(q));
  }

  public deleteDoc(path: string, docId: string): Observable<void> {
    const db = getFirestore();
    const coll = collection(db, path);

    return from(deleteDoc(doc(coll, docId)));
  }

  public createUser(email: string, password: string, name: string): Observable<void> {
    const auth = getAuth();

    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      switchMap((cred: UserCredential) => from(updateProfile(cred.user, { displayName: name })))
    );
  }

  public signInUser(email: string, password: string, callback: (user: User | null) => void): Observable<UserCredential> {
    const auth = getAuth();
    auth.onAuthStateChanged(callback);
    auth.setPersistence(browserLocalPersistence);

    return from(signInWithEmailAndPassword(auth, email, password));
  }

  public signOutUser(): Observable<void> {
    const auth = getAuth();

    return from(signOut(auth));
  }

  public getCurrentUser(): User | null {
    return getAuth().currentUser;
  }
}

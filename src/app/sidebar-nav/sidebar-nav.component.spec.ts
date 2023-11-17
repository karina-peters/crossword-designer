import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SidebarNavComponent } from "./sidebar-nav.component";
import { Router } from "@angular/router";
import { BehaviorSubject, of, throwError } from "rxjs";
import { LoadService } from "../services/load.service";
import { AuthService } from "../services/auth.service";

describe("SidebarNavComponent", () => {
  let component: SidebarNavComponent;
  let fixture: ComponentFixture<SidebarNavComponent>;

  const routerSpy = jasmine.createSpyObj("RouterService", ["navigateByUrl"]);
  const loadServiceSpy = jasmine.createSpyObj("LoadService", ["activePuzzleId$"]);
  const authServiceSpy = jasmine.createSpyObj("AuthService", ["signOut"]);

  beforeEach(async () => {
    loadServiceSpy.activePuzzleId$ = new BehaviorSubject("");
    authServiceSpy.signOut.and.returnValue(of(undefined));

    spyOn(window, "alert");

    await TestBed.configureTestingModule({
      declarations: [SidebarNavComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: LoadService, useValue: loadServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarNavComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should set puzzle loaded to false when puzzleId empty", () => {
      loadServiceSpy.activePuzzleId$.next("");

      fixture.detectChanges();
      expect(component.puzzleLoaded).toEqual(false);
    });

    it("should set puzzle loaded to true when puzzleId", () => {
      loadServiceSpy.activePuzzleId$.next("puzzleId");

      fixture.detectChanges();
      expect(component.puzzleLoaded).toEqual(true);
    });
  });

  describe("onSignOut", () => {
    it("should do nothing when sign out successful", () => {
      component.onSignOut();

      expect(authServiceSpy.signOut).toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });

    it("should alert failure when sign out fails", () => {
      const errorMsg = "Sign out failed";
      authServiceSpy.signOut.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      component.onSignOut();

      expect(authServiceSpy.signOut).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Failed to sign out: Sign out failed");
    });
  });
});

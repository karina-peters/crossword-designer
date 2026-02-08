import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";

import { of, throwError } from "rxjs";

import { TestPuzzle } from "legacy/src/environments/environment";
import { LoadPuzzleComponent } from "./load-puzzle.component";
import { LoadService } from "legacy/src/app/services/load.service";
import { AuthService } from "legacy/src/app/services/auth.service";

describe("LoadPuzzleComponent", () => {
  let component: LoadPuzzleComponent;
  let fixture: ComponentFixture<LoadPuzzleComponent>;

  const authServiceSpy = jasmine.createSpyObj("AuthService", ["currentUser"]);
  const loadServiceSpy = jasmine.createSpyObj("LoadService", [
    "setActivePuzzle",
    "createPuzzle",
    "loadPuzzle",
    "deletePuzzle",
    "getPuzzleList",
    "getUserList",
    "updatePuzzle",
  ]);
  const routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);

  const testId = "test-id";

  beforeEach(async () => {
    loadServiceSpy.getPuzzleList.and.returnValue(
      of([
        { id: testId, ...TestPuzzle },
        { id: "not-mine", createdBy: "someone-else" },
      ]),
    );
    loadServiceSpy.getUserList.and.returnValue(of([{ id: TestPuzzle.createdBy, name: "Test User" }]));
    loadServiceSpy.createPuzzle.and.returnValue(of(undefined));
    loadServiceSpy.deletePuzzle.and.returnValue(of(undefined));
    loadServiceSpy.updatePuzzle.and.returnValue(of(undefined));
    authServiceSpy.currentUser = { id: "test-user-id" };

    spyOn(window, "alert");
    spyOn(console, "error");

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoadPuzzleComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LoadService, useValue: loadServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadPuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should build puzzle cards", () => {
      expect(component.userPuzzleCards.length).toEqual(1);
      expect(component.publicPuzzleCards.length).toEqual(1);
    });
  });

  describe("onPuzzleSelect", () => {
    it("should set active puzzle and re-route", () => {
      const testMetadata = { id: testId, name: "test", locked: false };
      component.selectPuzzle(testMetadata);

      expect(loadServiceSpy.setActivePuzzle).toHaveBeenCalledWith(testMetadata);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/answers");
    });
  });

  describe("createPuzzle", () => {
    it("should re-route when puzzle successfully created", () => {
      component.newPuzzleForm.setValue({ title: "New Puzzle", width: 10, height: 12 });

      fixture.detectChanges();
      component.createPuzzle();

      expect(loadServiceSpy.createPuzzle).toHaveBeenCalledWith("New Puzzle", 10, 12);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/answers");
    });

    it("should alert failure when puzzle creation fails", () => {
      const errorMsg = "Failed to add doc";
      loadServiceSpy.createPuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });
      component.newPuzzleForm.setValue({ title: "New Puzzle", width: 10, height: 12 });

      fixture.detectChanges();
      component.createPuzzle();

      expect(loadServiceSpy.createPuzzle).toHaveBeenCalledWith("New Puzzle", 10, 12);
      expect(window.alert).toHaveBeenCalledWith("Failed to create puzzle: Failed to add doc");
    });
  });

  describe("deletePuzzle", () => {
    it("should do nothing when puzzle deletion successful", () => {
      component.deletePuzzle(testId);

      expect(loadServiceSpy.deletePuzzle).toHaveBeenCalledWith(testId);
    });

    it("should alert failure when puzzle deletion fails", () => {
      const errorMsg = "Failed to delete doc";
      loadServiceSpy.deletePuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      component.deletePuzzle(testId);

      expect(loadServiceSpy.deletePuzzle).toHaveBeenCalledWith(testId);
      expect(window.alert).toHaveBeenCalledWith("Failed to delete puzzle: Failed to delete doc");
    });
  });

  describe("setPuzzleLock", () => {
    it("should do nothing when update successful", () => {
      component.setPuzzleLock(testId, true);

      expect(loadServiceSpy.updatePuzzle).toHaveBeenCalledWith(testId, { locked: true });
    });

    it("should alert failure when update fails", () => {
      const errorMsg = "Failed to update doc";
      loadServiceSpy.updatePuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      component.setPuzzleLock(testId, false);

      expect(loadServiceSpy.updatePuzzle).toHaveBeenCalledWith(testId, { locked: false });
      expect(window.alert).toHaveBeenCalledWith("Failed to update puzzle: Failed to update doc");
    });
  });

  describe("setPuzzleShare", () => {
    it("should do nothing when update successful", () => {
      component.setPuzzleShare(testId, false);

      expect(loadServiceSpy.updatePuzzle).toHaveBeenCalledWith(testId, { public: false });
    });

    it("should alert failure when update fails", () => {
      const errorMsg = "Failed to update doc";
      loadServiceSpy.updatePuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      component.setPuzzleShare(testId, true);

      expect(loadServiceSpy.updatePuzzle).toHaveBeenCalledWith(testId, { public: true });
      expect(window.alert).toHaveBeenCalledWith("Failed to update puzzle: Failed to update doc");
    });
  });
});

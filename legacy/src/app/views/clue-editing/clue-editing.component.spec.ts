import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormArray, ReactiveFormsModule } from "@angular/forms";

import { of, throwError } from "rxjs";

import { ClueEditingComponent } from "./clue-editing.component";
import { PuzzleService } from "legacy/src/app/services/puzzle.service";
import { Clue, ClueType } from "legacy/src/app/models/clue.model";
import { Puzzle, Square } from "legacy/src/app/models/puzzle.model";
import { EventEmitter } from "@angular/core";
import { ToolbarService } from "legacy/src/app/services/toolbar.service";

describe("ClueEditingComponent", () => {
  let component: ClueEditingComponent;
  let fixture: ComponentFixture<ClueEditingComponent>;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["puzzle", "savePuzzle", "clearPuzzle", "setClueText", "puzzleLock$"]);
  const toolbarServiceSpy = jasmine.createSpyObj("ToolbarService", ["saveEvent$", "clearEvent$", "lockEvents$"]);

  const testId = "testId";
  const testPuzzle: Puzzle = {
    id: testId,
    name: "Test",
    createdBy: "test-user-id",
    width: 2,
    height: 2,
    locked: false,
    grid: Array.from(Array(4).keys()).map((i) => new Square(i, "", -1, Math.floor(i / 2), i % 2)),
    acrossClues: [new Clue(1, "Hello, I'm an across clue!", "HI", [0, 1]), new Clue(2)],
    downClues: [new Clue(1, "Hello, I'm a down clue!", "HI", [0, 2]), new Clue(2)],
  };

  beforeEach(async () => {
    puzzleServiceSpy.puzzle = testPuzzle;
    puzzleServiceSpy.savePuzzle.and.returnValue(of(undefined));
    puzzleServiceSpy.setClueText.calls.reset();
    toolbarServiceSpy.saveEvent$ = new EventEmitter();
    toolbarServiceSpy.clearEvent$ = new EventEmitter();
    toolbarServiceSpy.lockEvent$ = new EventEmitter();

    spyOn(window, "alert");

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ClueEditingComponent],
      providers: [
        { provide: PuzzleService, useValue: puzzleServiceSpy },
        { provide: ToolbarService, useValue: toolbarServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClueEditingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should handle save toolbar event when save successful", () => {
      toolbarServiceSpy.saveEvent$.emit();

      expect(puzzleServiceSpy.savePuzzle).toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });

    it("should handle save toolbar event when save unsuccessful", () => {
      const errorMsg = "Failed to set doc";
      puzzleServiceSpy.savePuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      toolbarServiceSpy.saveEvent$.emit();

      expect(puzzleServiceSpy.savePuzzle).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Clues failed to save: Failed to set doc");
    });

    it("should handle clear toolbar event", () => {
      toolbarServiceSpy.clearEvent$.emit();

      expect(puzzleServiceSpy.clearPuzzle).toHaveBeenCalled();
    });

    it("should handle lock toolbar event", () => {
      toolbarServiceSpy.lockEvent$.emit(true);

      expect(component.cluesForm.disabled).toBeTruthy();
    });

    it("should handle unlock toolbar event", () => {
      toolbarServiceSpy.lockEvent$.emit(false);

      expect(component.cluesForm.disabled).toBeFalsy();
    });
  });

  describe("updateAcrossClue", () => {
    it("should call setClueText with new clue text", () => {
      const control = (component.cluesForm.get("across") as FormArray).at(0);
      control.patchValue("New across clue!");
      control.markAsDirty();

      component.updateAcrossClue(0);

      expect(puzzleServiceSpy.setClueText).toHaveBeenCalledWith(ClueType.Across, 1, "New across clue!");
    });

    it("should do nothing if control pristine", () => {
      const control = (component.cluesForm.get("across") as FormArray).at(0);
      control.markAsPristine();

      component.updateAcrossClue(0);

      expect(puzzleServiceSpy.setClueText).not.toHaveBeenCalled();
    });
  });

  describe("updateDownClue", () => {
    it("should call setClueText with new clue text", () => {
      const control = (component.cluesForm.get("down") as FormArray).at(0);
      control.patchValue("New down clue!");
      control.markAsDirty();

      component.updateDownClue(0);

      expect(puzzleServiceSpy.setClueText).toHaveBeenCalledWith(ClueType.Down, 1, "New down clue!");
    });

    it("should do nothing if control pristine", () => {
      const control = (component.cluesForm.get("down") as FormArray).at(0);
      control.markAsPristine();

      component.updateDownClue(0);

      expect(puzzleServiceSpy.setClueText).not.toHaveBeenCalled();
    });
  });
});

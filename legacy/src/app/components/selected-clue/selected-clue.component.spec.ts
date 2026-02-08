import { EventEmitter } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { BehaviorSubject } from "rxjs";

import { SelectedClueComponent } from "./selected-clue.component";
import { PuzzleService } from "legacy/src/app/services/puzzle.service";
import { ToolbarService } from "legacy/src/app/services/toolbar.service";

import { Clue, ClueType } from "legacy/src/app/models/clue.model";
import { Puzzle } from "legacy/src/app/models/puzzle.model";

describe("SelectedClueComponent", () => {
  let component: SelectedClueComponent;
  let fixture: ComponentFixture<SelectedClueComponent>;

  const toolbarServiceSpy = jasmine.createSpyObj("ToolbarService", ["lockEvent$"]);
  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["puzzle", "activeAcrossClue$", "activeDownClue$", "setClueText"]);

  const testAcross: Clue = {
    num: 1,
    text: "Some across clue text",
    answer: "TEST",
    squares: [0, 1, 2, 3],
  };

  const testDown: Clue = {
    num: 1,
    text: "Some down clue text",
    answer: "TESTTOO",
    squares: [0, 1, 2, 3, 4, 5, 6],
  };

  beforeEach(async () => {
    puzzleServiceSpy.puzzle = { acrossClues: [testAcross], downClues: [testDown] } as Puzzle;
    puzzleServiceSpy.activeAcrossClue$ = new BehaviorSubject(0);
    puzzleServiceSpy.activeDownClue$ = new BehaviorSubject(0);
    puzzleServiceSpy.puzzleLock$ = new BehaviorSubject(false);
    puzzleServiceSpy.setClueText.and.callFake(() => {});
    toolbarServiceSpy.lockEvent$ = new EventEmitter();

    await TestBed.configureTestingModule({
      declarations: [SelectedClueComponent],
      providers: [
        { provide: PuzzleService, useValue: puzzleServiceSpy },
        { provide: ToolbarService, useValue: toolbarServiceSpy },
      ],
      imports: [FormsModule, ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedClueComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should set value and enable clues when index != -1", () => {
      puzzleServiceSpy.activeAcrossClue$.next(0);
      puzzleServiceSpy.activeDownClue$.next(0);

      fixture.detectChanges();

      expect(component.acrossInput.disabled).toBeFalsy();
      expect(component.downInput.disabled).toBeFalsy();

      expect(component.acrossInput.value).toEqual(testAcross.text);
      expect(component.downInput.value).toEqual(testDown.text);
    });

    it("should reset and disable clues when index == -1", () => {
      puzzleServiceSpy.activeAcrossClue$.next(-1);
      puzzleServiceSpy.activeDownClue$.next(-1);

      fixture.detectChanges();

      expect(component.acrossInput.disabled).toBeTruthy();
      expect(component.downInput.disabled).toBeTruthy();

      expect(component.acrossInput.value).toBeNull();
      expect(component.downInput.value).toBeNull();
    });

    it("should handle lock toolbar event", () => {
      fixture.detectChanges();

      toolbarServiceSpy.lockEvent$.emit(true);

      expect(component.acrossInput.disabled).toBeTrue();
      expect(component.downInput.disabled).toBeTrue();
    });

    it("should handle unlock toolbar event", () => {
      fixture.detectChanges();

      toolbarServiceSpy.lockEvent$.emit(false);

      expect(component.acrossInput.disabled).toBeFalse();
      expect(component.downInput.disabled).toBeFalse();
    });
  });

  describe("saveClues", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should set clue text and mark across input as pristine", () => {
      component.acrossInput.setValue("Some new text");
      component.acrossInput.markAsDirty();

      component.saveClues();

      expect(puzzleServiceSpy.setClueText).toHaveBeenCalledWith(ClueType.Across, 1, "Some new text");
      expect(component.acrossInput.dirty).toEqual(false);
    });

    it("should set clue text and mark down input as pristine", () => {
      component.downInput.setValue("Some other new text");
      component.downInput.markAsDirty();

      component.saveClues();

      expect(puzzleServiceSpy.setClueText).toHaveBeenCalledWith(ClueType.Down, 1, "Some other new text");
      expect(component.downInput.dirty).toEqual(false);
    });
  });
});

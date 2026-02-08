import { EventEmitter } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { of, throwError } from "rxjs";

import { PuzzleEditingComponent } from "./puzzle-editing.component";
import { PuzzleService } from "legacy/src/app/services/puzzle.service";
import { ToolbarService } from "legacy/src/app/services/toolbar.service";

import { Puzzle, Square } from "legacy/src/app/models/puzzle.model";

describe("PuzzleEditingComponent", () => {
  let component: PuzzleEditingComponent;
  let fixture: ComponentFixture<PuzzleEditingComponent>;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["puzzle", "savePuzzle", "clearPuzzle"]);
  const toolbarServiceSpy = jasmine.createSpyObj("ToolbarService", ["saveEvent$", "clearEvent$"]);

  const testId = "testId";

  const testPuzzle: Puzzle = {
    id: testId,
    name: "Test",
    createdBy: "test-user-id",
    width: 4,
    height: 5,
    locked: false,
    grid: Array.from(Array(20).keys()).map((i) => new Square(i, "", -1, Math.floor(i / 4), i % 4)),
    acrossClues: [],
    downClues: [],
  };

  beforeEach(async () => {
    puzzleServiceSpy.puzzle = testPuzzle;
    puzzleServiceSpy.savePuzzle.and.returnValue(of(undefined));
    toolbarServiceSpy.saveEvent$ = new EventEmitter();
    toolbarServiceSpy.clearEvent$ = new EventEmitter();

    spyOn(window, "alert");
    spyOn(console, "error");

    await TestBed.configureTestingModule({
      declarations: [PuzzleEditingComponent],
      providers: [
        { provide: PuzzleService, useValue: puzzleServiceSpy },
        { provide: ToolbarService, useValue: toolbarServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleEditingComponent);
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
      expect(window.alert).toHaveBeenCalledWith("Puzzle failed to save: Failed to set doc");
    });

    it("should handle clear toolbar event", () => {
      toolbarServiceSpy.clearEvent$.emit();

      expect(puzzleServiceSpy.clearPuzzle).toHaveBeenCalled();
    });
  });
});

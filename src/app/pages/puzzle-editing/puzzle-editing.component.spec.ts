import { ComponentFixture, TestBed } from "@angular/core/testing";

import { of, throwError } from "rxjs";

import { EditMode, HighlightMode } from "src/app/components/grid/grid.component";
import { PuzzleEditingComponent } from "./puzzle-editing.component";
import { PuzzleService } from "src/app/services/puzzle.service";
import { Puzzle, Square } from "src/app/models/puzzle.model";

describe("PuzzleEditingComponent", () => {
  let component: PuzzleEditingComponent;
  let fixture: ComponentFixture<PuzzleEditingComponent>;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["puzzle", "savePuzzle", "clearPuzzle"]);

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

    spyOn(window, "alert");
    spyOn(console, "error");

    await TestBed.configureTestingModule({
      declarations: [PuzzleEditingComponent],
      providers: [{ provide: PuzzleService, useValue: puzzleServiceSpy }],
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

  describe("onUpdateConfig", () => {
    it("should emit new puzzle configuration", () => {
      spyOn(component.gridConfig$, "next");

      component.answersHidden = true;
      component.editMode = EditMode.Circle;
      component.highlightMode = HighlightMode.Down;
      component.onUpdateConfig();

      expect(component.gridConfig$.next).toHaveBeenCalledWith({
        readonly: false,
        answersHidden: true,
        editMode: EditMode.Circle,
        highlightMode: HighlightMode.Down,
      });
    });
  });

  describe("onSave", () => {
    it("should do nothing when savePuzzle success", () => {
      component.onSave();

      expect(puzzleServiceSpy.savePuzzle).toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });

    it("should alert failure when savePuzzle throws error", () => {
      const errorMsg = "Failed to set doc";
      puzzleServiceSpy.savePuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      component.onSave();

      expect(puzzleServiceSpy.savePuzzle).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Puzzle failed to save: Failed to set doc");
    });
  });

  describe("onClear", () => {
    it("should call clearPuzzle", () => {
      component.onClear();

      expect(puzzleServiceSpy.clearPuzzle).toHaveBeenCalled();
    });
  });
});

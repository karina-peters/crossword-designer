import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PuzzleReviewComponent } from "./puzzle-review.component";
import { PuzzleService } from "legacy/src/app/services/puzzle.service";
import { Puzzle, Square } from "legacy/src/app/models/puzzle.model";

describe("PuzzleReviewComponent", () => {
  let component: PuzzleReviewComponent;
  let fixture: ComponentFixture<PuzzleReviewComponent>;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["puzzle"]);

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

    spyOn(window, "alert");
    spyOn(console, "error");

    await TestBed.configureTestingModule({
      declarations: [PuzzleReviewComponent],
      providers: [{ provide: PuzzleService, useValue: puzzleServiceSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

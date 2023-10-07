import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PuzzleStatsComponent } from "./puzzle-stats.component";
import { Clue, Puzzle, PuzzleService, Square, SquareType } from "../services/puzzle.service";

describe("PuzzleStatsComponent", () => {
  let component: PuzzleStatsComponent;
  let fixture: ComponentFixture<PuzzleStatsComponent>;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["puzzle", "getFirstLetterIndex", "getReflectIndex"]);

  const testPuzzle: Puzzle = {
    id: "test-id",
    name: "Test",
    width: 4,
    height: 4,
    grid: Array.from(Array(16).keys()).map((i) => new Square(i, "", -1, Math.floor(i / 4) + 1, (i % 4) + 1)),
    acrossClues: Array.from(Array(4).keys()).map((i) => new Clue(i + 1, "", "    ", [i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 3])),
    downClues: Array.from(Array(4).keys()).map((i) => new Clue(i + 1, "", "    ", [i, i + 4, i + 8, i + 12])),
  };

  const testPuzzle2: Puzzle = {
    id: "test-id-2",
    name: "Test 2",
    width: 2,
    height: 2,
    grid: [
      new Square(0, "I", 1, 1, 1, SquareType.Letter),
      new Square(1, "", -1, -1, -1, SquareType.Spacer),
      new Square(2, "", -1, -1, -1, SquareType.Spacer),
      new Square(3, "I", 2, 2, 2, SquareType.Letter),
    ],
    acrossClues: [new Clue(1, "", "I", [0]), new Clue(2, "", "I", [3])],
    downClues: [new Clue(1, "", "I", [0]), new Clue(2, "", "I", [3])],
  };

  beforeEach(async () => {
    puzzleServiceSpy.getFirstLetterIndex.and.returnValue(0);
    puzzleServiceSpy.getReflectIndex.and.callFake((i: number) => 3 - i);

    await TestBed.configureTestingModule({
      declarations: [PuzzleStatsComponent],
      providers: [{ provide: PuzzleService, useValue: puzzleServiceSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleStatsComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should calculate stats for empty puzzle", () => {
      puzzleServiceSpy.puzzle = testPuzzle;
      fixture.detectChanges();

      expect(component.metricCards.find((c) => c.id == "symmetrical")?.value).toEqual(true);
      expect(component.metricCards.find((c) => c.id == "connected")?.value).toEqual(true);
      expect(component.metricCards.find((c) => c.id == "no-duplicate-words")?.value).toEqual(true);
      expect(component.metricCards.find((c) => c.id == "minimum-word-length")?.value).toEqual(4);
      expect(component.metricCards.find((c) => c.id == "average-word-length")?.value).toEqual(4);
    });

    it("should calculate stats for disconnected puzzle", () => {
      puzzleServiceSpy.puzzle = testPuzzle2;
      fixture.detectChanges();

      expect(component.metricCards.find((c) => c.id == "symmetrical")?.value).toEqual(true);
      expect(component.metricCards.find((c) => c.id == "connected")?.value).toEqual(false);
      expect(component.metricCards.find((c) => c.id == "no-duplicate-words")?.value).toEqual(false);
      expect(component.metricCards.find((c) => c.id == "minimum-word-length")?.value).toEqual(1);
      expect(component.metricCards.find((c) => c.id == "average-word-length")?.value).toEqual(1);
    });
  });
});

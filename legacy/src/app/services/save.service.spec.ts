import { TestBed } from "@angular/core/testing";

import { of, throwError } from "rxjs";

import { SaveService } from "./save.service";
import { FirebaseService } from "./firebase.service";
import { PuzzleDoc } from "legacy/src/app/models/puzzle.model";
import { AnswerDoc } from "legacy/src/app/models/answer.model";

describe("SaveService", () => {
  let service: SaveService;

  const firebaseServiceSpy = jasmine.createSpyObj("FirebaseService", ["setDoc"]);

  const testId = "testId";
  const puzzleDoc = { locked: false } as PuzzleDoc;
  const lockedPuzzleDoc = { locked: true } as PuzzleDoc;
  const answerDoc = { answers: ["test answer"] } as AnswerDoc;

  beforeEach(() => {
    firebaseServiceSpy.setDoc.withArgs("puzzle", testId, puzzleDoc).and.returnValue(of(undefined));
    firebaseServiceSpy.setDoc.withArgs("answers", testId, answerDoc).and.returnValue(of(undefined));
    firebaseServiceSpy.setDoc.calls.reset();

    TestBed.configureTestingModule({
      providers: [{ provide: FirebaseService, useValue: firebaseServiceSpy }],
    });
    service = TestBed.inject(SaveService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("savePuzzle", () => {
    it("should do nothing when successful", () => {
      service.savePuzzle(testId, puzzleDoc).subscribe(() => {
        expect(firebaseServiceSpy.setDoc).toHaveBeenCalledWith("puzzle", testId, puzzleDoc);
      });
    });

    it("should not save when puzzle locked", () => {
      service.savePuzzle(testId, lockedPuzzleDoc).subscribe(() => {
        expect(firebaseServiceSpy.setDoc).not.toHaveBeenCalled();
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to set doc";

      firebaseServiceSpy.setDoc.withArgs("puzzle", testId, puzzleDoc).and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.savePuzzle(testId, puzzleDoc).subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        },
      );
    });
  });

  describe("saveAnswers", () => {
    it("should do nothing when successful", () => {
      service.saveAnswerBank(testId, answerDoc).subscribe(() => {
        expect(firebaseServiceSpy.setDoc).toHaveBeenCalledWith("answers", testId, answerDoc);
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to set doc";

      firebaseServiceSpy.setDoc.withArgs("answers", testId, answerDoc).and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.saveAnswerBank(testId, answerDoc).subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        },
      );
    });
  });
});

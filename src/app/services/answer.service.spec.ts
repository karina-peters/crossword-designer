import { TestBed, fakeAsync } from "@angular/core/testing";

import { AnswerDoc, AnswerService } from "./answer.service";
import { BehaviorSubject, of, throwError } from "rxjs";
import { SaveService } from "./save.service";
import { LoadService } from "./load.service";

describe("AnswerService", () => {
  let service: AnswerService;

  const loadServiceSpy = jasmine.createSpyObj("LoadService", ["getAnswers", "activePuzzleId$"]);
  const saveServiceSpy = jasmine.createSpyObj("SaveService", ["saveAnswers"]);

  const testId1 = "test-id-1";
  const testId2 = "test-id-2";

  const testAnswerDoc1 = {
    answers: ["TEST"],
    themeAnswers: { THEMETEST: [1] },
  };

  const testAnswerDoc2 = {
    answers: ["HELLO", "GOODBYE", "TEST"],
    themeAnswers: { THEME: [0, 2], ANSWER: [] },
  };

  beforeEach(() => {
    loadServiceSpy.activePuzzleId$ = new BehaviorSubject<string>(testId1);
    loadServiceSpy.getAnswers.withArgs(testId1).and.returnValue(of(new Object({ id: testId1, ...testAnswerDoc1 }) as AnswerDoc));
    loadServiceSpy.getAnswers.withArgs(testId2).and.returnValue(of(new Object({ id: testId2, ...testAnswerDoc2 }) as AnswerDoc));
    saveServiceSpy.saveAnswers.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        { provide: LoadService, useValue: loadServiceSpy },
        { provide: SaveService, useValue: saveServiceSpy },
      ],
    });

    service = TestBed.inject(AnswerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("constructor", () => {
    it("should get answers with next puzzle id", () => {
      loadServiceSpy.activePuzzleId$.next(testId2);
      loadServiceSpy.activePuzzleId$.subscribe(() => {
        expect(loadServiceSpy.getAnswers).toHaveBeenCalledWith(testId2);
      });
    });
  });

  describe("activateAnswers", () => {
    it("add should populate answers with answer doc data", () => {
      service.activateAnswers(new Object({ id: testId2, ...testAnswerDoc2 }));

      expect(service.answerBank.answers.length).toEqual(3);
      expect(service.answerBank.answers[0]).toEqual("HELLO");
      expect(service.answerBank.themeAnswers.size).toEqual(2);
      expect(service.answerBank.themeAnswers.has("THEME")).toEqual(true);
    });
  });

  describe("addAnswer", () => {
    it("add answer to themeAnswers when true", () => {
      const count = service.answerBank.themeAnswers.size;
      service.addAnswer("some theme answer", true);

      expect(service.answerBank.themeAnswers.size).toEqual(count + 1);
      expect(service.answerBank.themeAnswers.has("SOMETHEMEANSWER")).toEqual(true);
    });

    it("add answer to answers when false", () => {
      const count = service.answerBank.answers.length;
      service.addAnswer("some answer", false);

      expect(service.answerBank.answers.length).toEqual(count + 1);
      expect(service.answerBank.answers.includes("SOMEANSWER")).toEqual(true);
    });
  });

  describe("removeAnswer", () => {
    it("should remove answer from themeAnswers when true", () => {
      const count = service.answerBank.themeAnswers.size;
      service.removeAnswer("themetest", true);

      expect(service.answerBank.themeAnswers.size).toEqual(count - 1);
      expect(service.answerBank.themeAnswers.has("THEMETEST")).toEqual(false);
    });

    it("should remove answer from answers when false", () => {
      const count = service.answerBank.answers.length;
      service.removeAnswer("TEST", false);

      expect(service.answerBank.answers.length).toEqual(count - 1);
      expect(service.answerBank.answers.includes("TEST")).toEqual(false);
    });
  });

  describe("toggleCircle", () => {
    it("should remove circle if exists", fakeAsync(() => {
      service.toggleCircle("themetest", 1);

      expect(service.answerBank.themeAnswers.get("THEMETEST")?.includes(1)).toEqual(false);
    }));

    it("should add circle if doesn't exist", () => {
      service.toggleCircle("themetest", 2);

      expect(service.answerBank.themeAnswers.get("THEMETEST")?.includes(2)).toEqual(true);
    });
  });

  describe("clearAnswers", () => {
    it("should clear answer bank", () => {
      service.clearAnswers();

      expect(service.answerBank.id).toEqual(testId1);
      expect(service.answerBank.themeAnswers.size).toEqual(0);
      expect(service.answerBank.answers.length).toEqual(0);
    });
  });

  describe("saveAnswers", () => {
    it("should save answers successfully", () => {
      service.saveAnswers().subscribe(() => {
        expect(saveServiceSpy.saveAnswers).toHaveBeenCalledWith(testId1, testAnswerDoc1);
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to set doc";
      saveServiceSpy.saveAnswers.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.saveAnswers().subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });
});

import { EventEmitter } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";

import { of, throwError } from "rxjs";

import { AnswerDraftingComponent } from "./answer-drafting.component";
import { AnswerService } from "legacy/src/app/services/answer.service";
import { ToolbarService } from "legacy/src/app/services/toolbar.service";

import { AnswerBank } from "legacy/src/app/models/answer.model";

describe("AnswerDraftingComponent", () => {
  let component: AnswerDraftingComponent;
  let fixture: ComponentFixture<AnswerDraftingComponent>;

  const toolbarServiceSpy = jasmine.createSpyObj("ToolbarService", ["saveEvent$", "clearEvent$", "sortReverseEvent$", "filterEvent$"]);
  const answerServiceSpy = jasmine.createSpyObj("AnswerService", [
    "answerBank",
    "loadAnswers",
    "addAnswer",
    "removeAnswer",
    "toggleCircle",
    "saveAnswers",
    "clearAnswers",
  ]);

  const testId = "testId";

  const testAnswerBank: AnswerBank = {
    id: testId,
    answers: ["HELLO", "GOODBYE", "TEST"],
    themeAnswers: new Map<string, Array<number>>(Object.entries({ THEME: [0, 2], ANSWER: [] })),
  };

  beforeEach(async () => {
    answerServiceSpy.answerBank = testAnswerBank;
    answerServiceSpy.saveAnswers.and.returnValue(of(undefined));
    toolbarServiceSpy.saveEvent$ = new EventEmitter();
    toolbarServiceSpy.clearEvent$ = new EventEmitter();
    toolbarServiceSpy.sortReverseEvent$ = new EventEmitter();
    toolbarServiceSpy.filterEvent$ = new EventEmitter();

    spyOn(window, "alert");
    spyOn(console, "error");

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AnswerDraftingComponent],
      providers: [
        { provide: AnswerService, useValue: answerServiceSpy },
        { provide: ToolbarService, useValue: toolbarServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerDraftingComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should handle save toolbar event when save successful", () => {
      toolbarServiceSpy.saveEvent$.emit();

      expect(answerServiceSpy.saveAnswers).toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });

    it("should handle save toolbar event when save unsuccessful", () => {
      const errorMsg = "Failed to set doc";
      answerServiceSpy.saveAnswers.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      toolbarServiceSpy.saveEvent$.emit();

      expect(answerServiceSpy.saveAnswers).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Answers failed to save: Failed to set doc");
    });

    it("should handle clear toolbar event", () => {
      toolbarServiceSpy.clearEvent$.emit();

      expect(answerServiceSpy.clearAnswers).toHaveBeenCalled();
    });

    it("should handle sort toolbar event", () => {
      component.sortReverse = false;

      toolbarServiceSpy.sortReverseEvent$.emit();

      expect(component.sortReverse).toBeTruthy();
    });

    it("should handle filter toolbar event", () => {
      const filter = { length: 3, contains: "A" };
      component.filter = { length: null, contains: null };

      toolbarServiceSpy.filterEvent$.emit(filter);

      expect(component.filter).toEqual(filter);
    });
  });

  describe("addAnswer", () => {
    it("should call addAnswer with true and reset form", () => {
      component.newThemeAnswerForm.setValue({
        answer: "test theme answer",
      });

      fixture.detectChanges();
      component.addAnswer(true);

      expect(answerServiceSpy.addAnswer).toHaveBeenCalledWith("TESTTHEMEANSWER", true);
      expect(component.newThemeAnswerForm.value.answer).toBeNull();
    });

    it("should call addAnswer with false and reset form", () => {
      component.newAnswerForm.setValue({
        answer: "test answer",
      });

      fixture.detectChanges();
      component.addAnswer(false);

      expect(answerServiceSpy.addAnswer).toHaveBeenCalledWith("TESTANSWER", false);
      expect(component.newAnswerForm.value.answer).toBeNull();
    });
  });

  describe("removeAnswer", () => {
    it("should call removeAnswer with true", () => {
      component.removeAnswer("TESTANSWER", true);

      expect(answerServiceSpy.removeAnswer).toHaveBeenCalledWith("TESTANSWER", true);
    });

    it("should call removeAnswer with false", () => {
      component.removeAnswer("TESTANSWER", false);

      expect(answerServiceSpy.removeAnswer).toHaveBeenCalledWith("TESTANSWER", false);
    });
  });

  describe("toggleCircle", () => {
    it("should call toggleCircle", () => {
      component.toggleCircle("testKey", 0);

      expect(answerServiceSpy.toggleCircle).toHaveBeenCalledWith("testKey", 0);
    });
  });
});

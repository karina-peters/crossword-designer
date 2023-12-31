import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import { AnswerService } from "src/app/services/answer.service";
import { PuzzleService } from "src/app/services/puzzle.service";

@Component({
  selector: "app-answer-drafting",
  templateUrl: "./answer-drafting.component.html",
  styleUrls: ["./answer-drafting.component.scss"],
})
export class AnswerDraftingComponent implements OnInit {
  public get themeAnswers(): Map<string, Array<number>> {
    return this.answerService.answerBank.themeAnswers;
  }

  public get answers(): Array<string> {
    return this.answerService.answerBank.answers;
  }

  public get locked(): boolean {
    return this.puzzleService.puzzle.locked;
  }

  public newThemeAnswerForm = new FormGroup({
    answer: new FormControl(""),
  });

  public newAnswerForm = new FormGroup({
    answer: new FormControl(""),
  });

  constructor(private answerService: AnswerService, private puzzleService: PuzzleService) {}

  ngOnInit(): void {}

  public addAnswer(isTheme: boolean) {
    if (isTheme) {
      const answer = this.newThemeAnswerForm.value.answer?.replace(/ /g, "").toUpperCase();
      this.answerService.addAnswer(answer, true);
      this.newThemeAnswerForm.reset();
    } else {
      const answer = this.newAnswerForm.value.answer?.replace(/ /g, "").toUpperCase();
      this.answerService.addAnswer(answer, false);
      this.newAnswerForm.reset();
    }
  }

  public removeAnswer(key: string, isTheme: boolean) {
    this.answerService.removeAnswer(key, isTheme);
  }

  public toggleCircle(key: string, index: number) {
    this.answerService.toggleCircle(key, index);
  }

  public onClear(): void {
    this.answerService.clearAnswers();
  }

  public onSave(): void {
    this.answerService.saveAnswers().subscribe(
      () => {},
      (err: ErrorEvent) => {
        alert("Answers failed to save: " + err.message);
      }
    );
  }
}

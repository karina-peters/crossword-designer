import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import { AnswerService } from "legacy/src/app/services/answer.service";
import { ToolbarService } from "legacy/src/app/services/toolbar.service";

import { Filter } from "legacy/src/app/models/toolbar.model";

@Component({
  selector: "app-answer-drafting",
  templateUrl: "./answer-drafting.component.html",
  styleUrls: ["./answer-drafting.component.scss"],
})
export class AnswerDraftingComponent implements OnInit {
  // TODO: move to pipes
  public get themeAnswers(): Array<[string, Array<number>]> {
    return [...this.answerService.answerBank.themeAnswers]
      .filter((t) => {
        return (
          (this.filter.length == undefined || this.filter.length == t[0].length) &&
          (this.filter.contains == undefined || t[0].includes(this.filter.contains.toUpperCase() || ""))
        );
      })
      .sort((a, b) => (this.sortReverse ? b[0].length - a[0].length : a[0].length - b[0].length));
  }

  public get answers(): Array<string> {
    return this.answerService.answerBank.answers
      .filter((a) => {
        return (
          (this.filter.length == undefined || this.filter.length == a.length) &&
          (this.filter.contains == undefined || a.includes(this.filter.contains.toUpperCase() || ""))
        );
      })
      .sort((a, b) => (this.sortReverse ? b.length - a.length : a.length - b.length));
  }

  public newThemeAnswerForm = new FormGroup({
    answer: new FormControl(""),
  });

  public newAnswerForm = new FormGroup({
    answer: new FormControl(""),
  });

  public filter: Filter = { length: null, contains: null };
  public sortReverse: boolean = false;

  constructor(
    private answerService: AnswerService,
    private toolbarService: ToolbarService,
  ) {}

  ngOnInit(): void {
    this.handleToolbarEvents();
  }

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

  private onSave(): void {
    this.answerService.saveAnswers().subscribe(
      () => {},
      (err: ErrorEvent) => {
        alert("Answers failed to save: " + err.message);
      },
    );
  }

  private onEditModeChange(): void {
    // TODO
  }

  private onClear(): void {
    this.answerService.clearAnswers();
  }

  private handleToolbarEvents(): void {
    const toolbar = this.toolbarService;
    toolbar.saveEvent$.subscribe(() => this.onSave());
    toolbar.clearEvent$.subscribe(() => this.onClear());

    toolbar.sortReverseEvent$.subscribe(() => (this.sortReverse = !this.sortReverse));
    toolbar.filterEvent$.subscribe((filter: Filter) => (this.filter = filter));
  }
}

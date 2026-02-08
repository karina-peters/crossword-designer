import { Component, OnInit } from "@angular/core";
import { AnswerService } from "legacy/src/app/services/answer.service";

@Component({
  selector: "app-answer-bank",
  templateUrl: "./answer-bank.component.html",
  styleUrls: ["./answer-bank.component.scss"],
})
export class AnswerBankComponent implements OnInit {
  public get answers(): Array<string> {
    return this.answerService.answerBank.answers;
  }

  public get themeAnswers(): Array<string> {
    return Array.from(this.answerService.answerBank.themeAnswers.keys());
  }

  constructor(private answerService: AnswerService) {}

  ngOnInit(): void {}
}

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DocumentData } from "@angular/fire/firestore";

import { catchError, switchMap } from "rxjs/operators";

import { LoadService } from "./load.service";
import { SaveService } from "./save.service";

import { AnswerDoc, AnswerBank } from "../models/answer.model";
import { PuzzleMetadata } from "../models/puzzle.model";

@Injectable({
  providedIn: "root",
})
export class AnswerService {
  public get answerBank(): AnswerBank {
    return this._answerBank;
  }

  private _answerBank: AnswerBank = new AnswerBank();

  constructor(private loadService: LoadService, private saveService: SaveService) {
    this.loadService.activePuzzle$
      .pipe(switchMap((metadata: PuzzleMetadata) => this.loadService.getAnswerBank(metadata.id)))
      .subscribe((answersDoc: AnswerDoc) => {
        if (answersDoc) {
          this.activateAnswers(answersDoc);
        }
      });
  }

  /**
   * Activates answer bank with the provided answer data
   * @param docData answer data from the database
   */
  public activateAnswers(docData: DocumentData): void {
    this._answerBank = new AnswerBank(docData.id, docData.themeAnswers, docData.answers);
  }

  /**
   * Adds answer to the answer bank
   * @param text answer text
   * @param isTheme whether or not the answer is a theme answer
   */
  public addAnswer(text: string, isTheme: boolean) {
    if (text) {
      let answer = text.replace(/ /g, "").toUpperCase();

      if (isTheme) {
        this._answerBank.themeAnswers.set(answer, []);
      } else {
        this._answerBank.answers.push(answer);
      }
    }
  }

  /**
   * Removes answer from the answer bank
   * @param key answer key
   * @param isTheme whether or not the answer is a theme answer
   */
  public removeAnswer(key: string, isTheme: boolean) {
    if (isTheme) {
      this._answerBank.themeAnswers.delete(key.toUpperCase());
    } else {
      const index = this._answerBank.answers.findIndex((a) => a == key.toUpperCase());
      this._answerBank.answers.splice(index, 1);
    }
  }

  /**
   * Toggles circle for the provided theme answer index
   * @param key answer key
   * @param index answer circle index
   */
  public toggleCircle(key: string, index: number) {
    let circles = this._answerBank.themeAnswers.get(key.toUpperCase());

    if (circles) {
      let pos = circles.findIndex((i) => i == index);

      if (pos != -1) {
        circles.splice(pos, 1);
      } else {
        circles.push(index);
      }

      this._answerBank.themeAnswers.set(key.toUpperCase(), circles);
    }
  }

  /**
   * Clears answer bank
   */
  public clearAnswers(): void {
    this._answerBank = new AnswerBank(this._answerBank.id);
  }

  /**
   * Saves answer bank to the database
   * @returns an Observable
   */
  public saveAnswers(): Observable<void> {
    let answers = {
      themeAnswers: Object.fromEntries(this._answerBank.themeAnswers.entries()),
      answers: this._answerBank.answers,
    };

    return this.saveService.saveAnswerBank(this._answerBank.id, answers).pipe(
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }
}

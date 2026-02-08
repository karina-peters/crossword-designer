/**
 * Answer data as it appears in the database
 */
export interface AnswerDoc {
  id: string;
  themeAnswers: Object;
  answers: Array<string>;
}

export class AnswerBank {
  id: string;
  themeAnswers: Map<string, Array<number>>;
  answers: Array<string>;

  constructor(id: string = "", themeAnswers: Object = {}, answers: Array<string> = []) {
    this.id = id;
    this.themeAnswers = new Map<string, Array<number>>(Object.entries(themeAnswers));
    this.answers = answers;
  }
}

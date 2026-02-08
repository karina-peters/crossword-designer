export class Clue {
  num: number;
  text: string;
  answer: string;
  squares: Array<number>;

  constructor(num: number = -1, text: string = "", answer: string = "", squares: Array<number> = []) {
    this.num = num;
    this.text = text;
    this.answer = answer;
    this.squares = squares;
  }
}

export enum ClueType {
  Across,
  Down,
}

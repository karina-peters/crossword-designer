import { Injectable } from "@angular/core";
import { BehaviorSubject, from, Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { SaveService } from "./save.service";

export interface PuzzleDoc {
  id: string;
  name: string;
  width: number;
  height: number;
  answers: Array<string>;
  spacers: Array<number>;
  circles: Array<number>;
  shades: Array<number>;
  "across-clues": Array<string>;
  "down-clues": Array<string>;
}

export class Puzzle {
  id: string;
  name: string;
  grid: Array<Square>;
  width: number;
  height: number;
  acrossClues: Array<Clue>;
  downClues: Array<Clue>;

  constructor(
    id: string = "",
    name: string = "",
    grid: Array<Square> = [],
    width: number = 0,
    height: number = 0,
    acrossClues: Array<Clue> = [],
    downClues: Array<Clue> = []
  ) {
    this.id = id;
    this.name = name;
    this.grid = grid;
    this.width = width;
    this.height = height;
    this.acrossClues = acrossClues;
    this.downClues = downClues;
  }
}

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

export class Square {
  index: number;
  value: string;
  type: SquareType;
  overlay: OverlayType;
  boxNum: number;
  downClueNum: number;
  acrossClueNum: number;

  constructor(
    index: number = -1,
    value: string = " ",
    boxNum: number = -1,
    acrossClueNum: number = -1,
    downClueNum: number = -1,
    type: SquareType = SquareType.Letter,
    overlay: OverlayType = OverlayType.None
  ) {
    this.index = index;
    this.value = value;
    this.boxNum = boxNum;
    this.acrossClueNum = acrossClueNum;
    this.downClueNum = downClueNum;
    this.type = type;
    this.overlay = overlay;
  }
}

export enum SquareType {
  Letter,
  Spacer,
}

export enum OverlayType {
  None,
  Circle,
  Shade,
}

@Injectable({
  providedIn: "root",
})
export class PuzzleService {
  public get puzzle(): Puzzle {
    return this._puzzle;
  }

  public activeAcrossClue$: BehaviorSubject<number> = new BehaviorSubject(0);
  public activeDownClue$: BehaviorSubject<number> = new BehaviorSubject(0);

  private _puzzle: Puzzle = new Puzzle();
  constructor(private saveService: SaveService) {}

  /**
   * Activates puzzle with the provided puzzle data
   * @param docData puzzle data from the database
   */
  public activatePuzzle(docData: PuzzleDoc) {
    this._puzzle = new Puzzle(
      docData.id,
      docData.name,
      this.buildGrid(docData as PuzzleDoc),
      docData.width,
      docData.height,
      this.buildAcrossClues(docData as PuzzleDoc),
      this.buildDownClues(docData as PuzzleDoc)
    );

    this.numberPuzzle(this._puzzle);
    this.selectSquare(this.getFirstLetterIndex());
  }

  /**
   * Saves the active puzzle to the database
   * @returns and Observable
   */
  public savePuzzle(): Observable<void> {
    let puzzle: PuzzleDoc = {
      id: this._puzzle.id,
      name: this._puzzle.name,
      width: this._puzzle.width,
      height: this._puzzle.height,
      answers: this._puzzle.grid.filter((square: Square) => square.type == SquareType.Letter).map((square: Square) => square.value),
      spacers: this._puzzle.grid.filter((square: Square) => square.type == SquareType.Spacer).map((square: Square) => square.index),
      circles: this._puzzle.grid.filter((square: Square) => square.overlay == OverlayType.Circle).map((square: Square) => square.index),
      shades: this._puzzle.grid.filter((square: Square) => square.overlay == OverlayType.Shade).map((square: Square) => square.index),
      "across-clues": this._puzzle.acrossClues.map((clue: Clue) => clue.text),
      "down-clues": this._puzzle.downClues.map((clue: Clue) => clue.text),
    };

    return this.saveService.savePuzzle(puzzle).pipe(
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  /**
   * Clears all squares and renumbers the puzzle
   */
  public clearPuzzle(): void {
    for (let i = 0; i < this._puzzle.height * this._puzzle.width; ++i) {
      this._puzzle.grid[i] = new Square(i);
    }

    this._puzzle.acrossClues = [];
    this._puzzle.downClues = [];
    this.numberPuzzle(this._puzzle);

    this.activeAcrossClue$.next(0);
    this.activeDownClue$.next(0);
  }

  /**
   * Updates the active Across and Down clues to those for the square at the provided index
   * @param index square index
   */
  public selectSquare(index: number) {
    this.activeAcrossClue$.next(this.getAcrossClueIndex(index));
    this.activeDownClue$.next(this.getDownClueIndex(index));
  }

  /**
   * Toggles the square at the provided index to Spacer if Letter, and vice versa
   * @param index square index
   */
  public toggleSquareType(index: number): void {
    let square = this._puzzle.grid[index];
    let newType = square.type == SquareType.Letter ? SquareType.Spacer : SquareType.Letter;

    this.updateClueLists(index, newType);
    this.setSquareType(index, newType);
    this.numberPuzzle(this._puzzle);

    this.activeAcrossClue$.next(this.getAcrossClueIndex(index));
    this.activeDownClue$.next(this.getDownClueIndex(index));
  }

  /**
   * Toggles the the square overlay at the provided index to the provided overaly type if None, and vice versa
   * @param index square index
   * @param type
   */
  public toggleSquareOverlay(index: number, type: OverlayType): void {
    let square = this._puzzle.grid[index];

    if (square.type == SquareType.Letter) {
      square.overlay = square.overlay == type ? OverlayType.None : type;
    }
  }

  /**
   * Sets the square at the provided index to the provided value
   * @param index square index
   * @param value new square value
   */
  public setSquareValue(index: number, value: string): void {
    const acrossIndex = this.getAcrossClueIndex(index);
    const downIndex = this.getDownClueIndex(index);

    let square = this._puzzle.grid[index];
    let acrossClue = this._puzzle.acrossClues[acrossIndex];
    let downClue = this._puzzle.downClues[downIndex];

    // Update puzzle grid
    square.value = value.toUpperCase();

    // Update across clue answer
    const acrossPos = acrossClue.squares.findIndex((i: number) => i == square.index);
    acrossClue.answer = acrossClue.answer.substring(0, acrossPos) + square.value + acrossClue.answer.substring(acrossPos + 1);
    this.activeAcrossClue$.next(acrossIndex);

    // Update down clue answer
    const downPos = downClue.squares.findIndex((i: number) => i == square.index);
    downClue.answer = downClue.answer.substring(0, downPos) + square.value + downClue.answer.substring(downPos + 1);
    this.activeDownClue$.next(downIndex);
  }

  /**
   * Sets the across or down clue for the square at the provided index to the provided text
   * @param type the clue type (Across or Down)
   * @param index square index
   * @param text new clue text
   */
  public setClueText(type: ClueType, index: number, text: string) {
    let clues = type == ClueType.Across ? this._puzzle.acrossClues : this._puzzle.downClues;
    let clue = clues.find((clue) => clue.num == index);

    if (clue) {
      clue.text = text;
    }
  }

  public getRowNum(index: number): number {
    return Math.floor(index / this._puzzle.width);
  }

  public getColNum(index: number): number {
    return index % this._puzzle.width;
  }

  public getAcrossClueIndex(index: number): number {
    let square = this._puzzle.grid[index];
    let clueIndex = this._puzzle.acrossClues.findIndex((a) => square.acrossClueNum == a.num);

    return clueIndex;
  }

  public getDownClueIndex(index: number): number {
    let square = this._puzzle.grid[index];
    let clueIndex = this._puzzle.downClues.findIndex((d) => square.downClueNum == d.num);

    return clueIndex;
  }

  public getReflectIndex(index: number): number {
    return this._puzzle.width * this._puzzle.height - 1 - index;
  }

  /**
   * Gets the index of the first letter square in the puzzle
   * @returns the index of the first letter square
   */
  public getFirstLetterIndex(): number {
    const puzzle = this._puzzle;
    let index = 0;

    while (index < puzzle.width * puzzle.height && puzzle.grid[index].type != SquareType.Letter) {
      ++index;
    }

    return index;
  }

  /**
   * Gets the index of the square following the provided index
   * @param index square index
   * @param vertical whether or not the search direction is down
   * @param skipSpacers whether or not to skip spacers
   * @returns the next square index
   */
  public getNextIndex(index: number, vertical: boolean = false, skipSpacers: boolean = false): number {
    let next = index;
    let step = vertical ? this._puzzle.width : 1;

    next = (next + step) % (this._puzzle.width * this._puzzle.height);

    if (skipSpacers) {
      while (this._puzzle.grid[next].type == SquareType.Spacer) {
        next = (next + step) % (this._puzzle.width * this._puzzle.height);
      }
    }

    return next;
  }

  /**
   * Gets the index of the square preceding the provided index
   * @param index square index
   * @param vertical whether or not the search direction is up
   * @param skipSpacers whether or not to skip spacers
   * @returns the previous square index
   */
  public getPrevIndex(index: number, vertical: boolean = false, skipSpacers: boolean = false): number {
    let prev = index;
    let step = vertical ? this._puzzle.width : 1;

    prev = (this._puzzle.width * this._puzzle.height + prev - step) % (this._puzzle.width * this._puzzle.height);

    if (skipSpacers) {
      while (this._puzzle.grid[prev].type == SquareType.Spacer) {
        prev = (this._puzzle.width * this._puzzle.height + prev - step) % (this._puzzle.width * this._puzzle.height);
      }
    }

    return prev;
  }

  /**
   * Gets the clue number immediately preceding the square with the provided index
   * @param index square index
   * @returns the clue number
   */
  public getPrevClueNum(index: number): number {
    while (index > 0) {
      if (this._puzzle.grid[index].boxNum != -1) {
        return this._puzzle.grid[index].boxNum;
      }

      index--;
    }

    return 1;
  }

  /**
   * Determines whether or not the spacer at the provided index creates an across answer
   * @param index Spacer square index
   * @returns the across clue number if true, -1 otherwise
   */
  public createsAcrossNumber(index: number): number {
    let square = this._puzzle.grid[index];
    let nextSquare = this._puzzle.grid[index + 1];

    if (square.type == SquareType.Spacer && this.getColNum(index) != this._puzzle.width - 1 && nextSquare.type == SquareType.Letter) {
      return nextSquare.acrossClueNum;
    }

    return -1;
  }

  /**
   * Determines whether or not the spacer at the provided index creates a down answer
   * @param index Spacer square index
   * @returns the down clue number if true, -1 otherwise
   */
  public createsDownNumber(index: number): number {
    let square = this._puzzle.grid[index];
    let nextSquare = this._puzzle.grid[index + this._puzzle.width];

    if (square.type == SquareType.Spacer && this.getRowNum(index) != this._puzzle.height - 1 && nextSquare.type == SquareType.Letter) {
      return nextSquare.downClueNum;
    }

    return -1;
  }

  /**
   * Determines whether or not the spacer at the provided index terminates an across answer
   * @param index Spacer square index
   * @returns the across clue number if true, -1 otherwise
   */
  public terminatesAcrossNumber(index: number): number {
    let square = this._puzzle.grid[index];
    let prevSquare = this._puzzle.grid[index - 1];

    if (square.type == SquareType.Spacer && this.getColNum(index) != 0 && prevSquare.type == SquareType.Letter) {
      return prevSquare.acrossClueNum;
    }

    return -1;
  }

  /**
   * Determines whether or not the spacer at the provided index terminates a down answer
   * @param index Spacer square index
   * @returns the down clue number if true, -1 otherwise
   */
  public terminatesDownNumber(index: number): number {
    let square = this._puzzle.grid[index];
    let prevSquare = this._puzzle.grid[index - this._puzzle.width];

    if (square.type == SquareType.Spacer && this.getRowNum(index) != 0 && prevSquare.type == SquareType.Letter) {
      return prevSquare.downClueNum;
    }

    return -1;
  }

  /**
   * Determines whether or not the letter square at the provided index starts an across answer
   * @param index Letter square index
   * @returns true or false
   */
  public startsAcross(index: number): boolean {
    let square = this._puzzle.grid[index];
    let prevSquare = this._puzzle.grid[index - 1];

    if (square.type == SquareType.Letter && (this.getColNum(index) == 0 || prevSquare.type == SquareType.Spacer)) {
      return true;
    }

    return false;
  }

  /**
   * Determines whether or not the letter square at the provided index starts a down answer
   * @param index Letter square index
   * @returns true or false
   */
  public startsDown(index: number): boolean {
    let square = this._puzzle.grid[index];
    let prevSquare = this._puzzle.grid[index - this._puzzle.width];

    if (square.type == SquareType.Letter && (this.getRowNum(index) == 0 || prevSquare.type == SquareType.Spacer)) {
      return true;
    }

    return false;
  }

  /**
   * Determines whether or not the letter square at the provided index ends an across answer
   * @param index Letter square index
   * @returns true or false
   */
  public endsAcross(index: number): boolean {
    let square = this._puzzle.grid[index];
    let nextSquare = this._puzzle.grid[index + 1];

    if (square.type == SquareType.Letter && (this.getColNum(index) == this._puzzle.width - 1 || nextSquare.type == SquareType.Spacer)) {
      return true;
    }

    return false;
  }

  /**
   * Determines whether or not the letter square at the provided index ends a down answer
   * @param index Letter square index
   * @returns true or false
   */
  public endsDown(index: number): boolean {
    let square = this._puzzle.grid[index];
    let nextSquare = this._puzzle.grid[index + this._puzzle.width];

    if (square.type == SquareType.Letter && (this.getRowNum(index) == this._puzzle.height - 1 || nextSquare.type == SquareType.Spacer)) {
      return true;
    }

    return false;
  }

  public isPuzzleStart(index: number): boolean {
    return index <= 0;
  }

  public isPuzzleEnd(index: number): boolean {
    return index >= this._puzzle.width * this._puzzle.height - 1;
  }

  private setSquareType(index: number, type: SquareType) {
    let square = this._puzzle.grid[index];
    let reflectSquare = this._puzzle.grid[this.getReflectIndex(index)];

    square.type = reflectSquare.type = type;
    square.value = reflectSquare.value = type == SquareType.Letter ? " " : "";
    square.boxNum = reflectSquare.boxNum = -1;
  }

  private numberPuzzle(puzzle: Puzzle, start: number = 0): void {
    let num = 1;
    let acrossCount = 0;
    let downCount = 0;
    let size = puzzle.height * puzzle.width;

    let across: { num: number; ans: string; pos: number; squares: Array<number> } = { num: 1, ans: "", pos: 0, squares: [] };
    let down: Array<{ num: number; ans: string; pos: number; squares: Array<number> }> = Array.from({ length: puzzle.width }, () => {
      return { num: 1, ans: "", pos: 0, squares: [] };
    });

    for (let i = start; i < size; ++i) {
      let square = puzzle.grid[i];
      let colNum = this.getColNum(square.index);

      // Set Spacer
      if (square.type == SquareType.Spacer) {
        square.boxNum = -1;
        square.acrossClueNum = -1;
        square.downClueNum = -1;
        continue;
      }

      // Set Letter
      if (this.startsAcross(square.index) || this.startsDown(square.index)) {
        if (this.startsAcross(square.index)) {
          across.num = num;
          across.pos = acrossCount++;
        }

        if (this.startsDown(square.index)) {
          down[colNum].num = num;
          down[colNum].pos = downCount++;
        }

        square.boxNum = num++;
      } else {
        square.boxNum = -1;
      }

      // Track across clue data
      square.acrossClueNum = across.num;
      across.ans += square.value;
      across.squares.push(square.index);

      // Track down clue data
      square.downClueNum = down[colNum].num;
      down[colNum].ans += square.value;
      down[colNum].squares.push(square.index);

      // Associate answers with clues
      if (this.endsAcross(square.index)) {
        this.addOrUpdateClue(puzzle.acrossClues, across.pos, square.acrossClueNum, across.ans, across.squares);
        across.ans = "";
        across.squares = [];
      }

      if (this.endsDown(square.index)) {
        this.addOrUpdateClue(puzzle.downClues, down[colNum].pos, square.downClueNum, down[colNum].ans, down[colNum].squares);
        down[colNum].ans = "";
        down[colNum].squares = [];
      }
    }

    // Ensure down clues are in order
    puzzle.downClues.sort((a: Clue, b: Clue) => a.num - b.num);
  }

  private addOrUpdateClue(clues: Array<Clue>, pos: number, clueNum: number, answer: string, squares: Array<number>): void {
    let clue = clues[pos];

    if (clue) {
      clue.num = clueNum;
      clue.answer = answer;
      clue.squares = squares;
    } else {
      const buffer = Array.from({ length: pos - clues.length }, () => new Clue());
      clues.splice(pos, 0, ...buffer, new Clue(clueNum, "", answer, squares));
    }
  }

  private updateClueLists(updatedIndex: number, newType: SquareType): void {
    let updatedSquare = this._puzzle.grid[updatedIndex];
    let reflectSquare = this._puzzle.grid[this.getReflectIndex(updatedIndex)];

    let addClues = (square: Square) => {
      if (newType == SquareType.Spacer) {
        let acrossPos = this._puzzle.acrossClues.findIndex((clue: Clue) => clue.num == square.acrossClueNum);
        let downPos = this._puzzle.downClues.findIndex((clue: Clue) => clue.num == square.downClueNum);

        // Reset clue text for existing clues
        this._puzzle.acrossClues[acrossPos].text = "";
        this._puzzle.downClues[downPos].text = "";

        if (!this.endsAcross(square.index)) {
          if (this.startsAcross(square.index)) {
            // Remove old across clue
            this._puzzle.acrossClues.splice(acrossPos, 1);
          }

          // Add new across clue
          this._puzzle.acrossClues.splice(acrossPos + 1, 0, new Clue());
        }

        if (!this.endsDown(square.index)) {
          if (this.startsDown(square.index)) {
            // Remove old down clue
            this._puzzle.downClues.splice(downPos, 1);
          }

          // Add new down clue
          let prevClueNum = this.getPrevClueNum(square.index + this._puzzle.width);
          downPos = this._puzzle.downClues.findIndex((clue: Clue) => clue.num > prevClueNum);
          this._puzzle.downClues.splice(downPos, 0, new Clue());
        }
      } else {
        let createdAcross = this.createsAcrossNumber(square.index);
        let createdDown = this.createsDownNumber(square.index);

        if (createdAcross != -1) {
          let acrossPos = this._puzzle.acrossClues.findIndex((clue: Clue) => clue.num == createdAcross);
          let terminatedAcross = this.terminatesAcrossNumber(square.index);

          // Remove old across clue
          this._puzzle.acrossClues.splice(acrossPos, 1);

          if (terminatedAcross == -1) {
            // Add new across clue
            this._puzzle.acrossClues.splice(acrossPos, 0, new Clue());
          } else {
            // Reset clue text for existing across clue
            acrossPos = this._puzzle.acrossClues.findIndex((clue: Clue) => clue.num == terminatedAcross);
            this._puzzle.acrossClues[acrossPos].text = "";
          }
        }

        if (createdDown != -1) {
          let downPos = this._puzzle.downClues.findIndex((clue: Clue) => clue.num == createdDown);
          let terminatedDown = this.terminatesDownNumber(square.index);

          // Remove old down clue
          this._puzzle.downClues.splice(downPos, 1);

          if (terminatedDown == -1) {
            // Add new down clue
            let prevClueNum = this.getPrevClueNum(square.index);
            downPos = this._puzzle.downClues.findIndex((clue: Clue) => clue.num > prevClueNum);
            this._puzzle.downClues.splice(downPos, 0, new Clue());
          } else {
            // Reset clue text for existing down clue
            downPos = this._puzzle.downClues.findIndex((clue: Clue) => clue.num == terminatedDown);
            this._puzzle.downClues[downPos].text = "";
          }
        }
      }
    };

    addClues(updatedSquare);
    addClues(reflectSquare);
  }

  private buildGrid(puzzle: PuzzleDoc): Array<Square> {
    let answersPos = 0;
    let grid = [];

    for (let i = 0; i < puzzle.width * puzzle.height; i++) {
      let square = new Square(i);

      if (puzzle.spacers.includes(i)) {
        square.type = SquareType.Spacer;
        square.value = "";
      } else {
        if (puzzle.circles.includes(i)) {
          square.overlay = OverlayType.Circle;
        }

        if (puzzle.shades.includes(i)) {
          square.overlay = OverlayType.Shade;
        }

        square.value = puzzle.answers[answersPos++].toUpperCase();
      }

      grid.push(square);
    }

    return grid;
  }

  private buildAcrossClues(puzzle: PuzzleDoc): Array<Clue> {
    let clues: Array<Clue> = [];

    puzzle["across-clues"].map((clueText: string) => {
      clues.push(new Clue(0, clueText, ""));
    });

    return clues;
  }

  private buildDownClues(puzzle: PuzzleDoc): Array<Clue> {
    let clues: Array<Clue> = [];

    puzzle["down-clues"].map((clueText: string) => {
      clues.push(new Clue(0, clueText, ""));
    });

    return clues;
  }
}

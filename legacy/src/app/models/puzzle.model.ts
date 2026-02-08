import { Clue } from "./clue.model";

/**
 * Puzzle data as it appears in the database
 */
export interface PuzzleDoc {
  id: string;
  name: string;
  createdBy: string;
  lastEdited: Date;
  width: number;
  height: number;
  locked: boolean;
  public: boolean;
  answers: Array<string>;
  spacers: Array<number>;
  circles: Array<number>;
  shades: Array<number>;
  "across-clues": Array<string>;
  "down-clues": Array<string>;
}

export interface PuzzleMetadata {
  id: string;
  name: string;
  locked: boolean;
}

export class Puzzle {
  id: string;
  name: string;
  createdBy: string;
  width: number;
  height: number;
  locked: boolean;
  grid: Array<Square>;
  acrossClues: Array<Clue>;
  downClues: Array<Clue>;

  constructor(
    id: string = "",
    name: string = "",
    createdBy: string = "",
    width: number = 0,
    height: number = 0,
    locked: boolean = false,
    grid: Array<Square> = [],
    acrossClues: Array<Clue> = [],
    downClues: Array<Clue> = []
  ) {
    this.id = id;
    this.name = name;
    this.createdBy = createdBy;
    this.locked = locked;
    this.width = width;
    this.height = height;
    this.grid = grid;
    this.acrossClues = acrossClues;
    this.downClues = downClues;
  }
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

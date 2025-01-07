import { Component, HostListener, Input, OnInit } from "@angular/core";

import { PuzzleService } from "src/app/services/puzzle.service";
import { ToolbarService } from "src/app/services/toolbar.service";

import { OverlayType, Square, SquareType } from "src/app/models/puzzle.model";
import { EditMode, ViewMode } from "src/app/models/toolbar.model";

@Component({
  selector: "app-grid",
  templateUrl: "./grid.component.html",
  styleUrls: ["./grid.component.scss"],
})
export class GridComponent implements OnInit {
  @Input() readonly: boolean = false;

  public squareHeight: number = 30;
  public selectedIndex: number = -1;
  public answersHidden: boolean = false;

  public get numRows(): number {
    return this.puzzleService.puzzle.height;
  }

  public get numCols(): number {
    return this.puzzleService.puzzle.width;
  }

  public get puzzleGrid(): Array<Square> {
    return this.puzzleService.puzzle.grid;
  }

  constructor(private puzzleService: PuzzleService, private toolbarService: ToolbarService) {}

  ngOnInit(): void {
    this.handleToolbarEvents();

    if (this.readonly) {
      this.selectedIndex = -1;
      this.answersHidden = true;
    } else if (this.selectedIndex == -1) {
      this.selectedIndex = this.puzzleService.getFirstLetterIndex();
    }
  }

  public onClickSquare(index: number, overrideMode?: EditMode) {
    let square = this.puzzleGrid[index];
    let editMode = overrideMode ? overrideMode : this.toolbarService.getCurrentEditMode();
    this.selectSquare(index);

    if (editMode == EditMode.Spacer) {
      this.puzzleService.toggleSquareType(square.index);
    } else if (editMode == EditMode.Circle) {
      this.puzzleService.toggleSquareOverlay(square.index, OverlayType.Circle);
    } else if (editMode == EditMode.Shade) {
      this.puzzleService.toggleSquareOverlay(square.index, OverlayType.Shade);
    }
  }

  @HostListener("window:keydown", ["$event"])
  public onKeyDown(event: KeyboardEvent) {
    let square = this.puzzleGrid[this.selectedIndex];

    if (this.isArrowKey(event.key)) {
      this.selectSquare(this.getNextIndex(square.index, event.key));
    } else if (event.key == "Enter") {
      if (this.toolbarService.getCurrentEditMode() == EditMode.Value) {
        this.onClickSquare(square.index, EditMode.Spacer);
        this.selectNextSquare(square.index);
      } else {
        this.onClickSquare(square.index);
      }
    } else if (event.key == "Backspace" && square.type == SquareType.Letter) {
      if (square.value == " ") {
        this.selectPrevSquare(square.index);
        this.puzzleGrid[this.selectedIndex].value = " ";
      } else {
        this.puzzleService.setSquareValue(square.index, " ");
      }
    } else if (this.isAlphaChar(event.key) && square.type == SquareType.Letter) {
      this.puzzleService.setSquareValue(square.index, event.key);
      this.selectNextSquare(square.index);
    }

    // Prevent duplicate events when grid is in focus
    event.stopPropagation();
  }

  public getPuzzleRow(index: number): Array<Square> {
    let rowStart = index - (index % this.numCols);

    return this.puzzleGrid.slice(rowStart, rowStart + this.numCols);
  }

  /**
   * Determines whether or not the provided square should be highlighted in the current highlight and edit modes
   * @param square square to highlight
   * @returns true if square should be highlighted, false otherwise
   */
  public isHighlighted(square: Square): boolean {
    const viewMode = this.toolbarService.getCurrentViewMode();

    if (this.selectedIndex == -1 || this.puzzleGrid[this.selectedIndex].type == SquareType.Spacer) {
      return false;
    } else if (viewMode == ViewMode.Across) {
      return square.acrossClueNum == this.puzzleGrid[this.selectedIndex].acrossClueNum;
    } else if (viewMode == ViewMode.Down) {
      return square.downClueNum == this.puzzleGrid[this.selectedIndex].downClueNum;
    } else {
      return (
        square.acrossClueNum == this.puzzleGrid[this.selectedIndex].acrossClueNum ||
        square.downClueNum == this.puzzleGrid[this.selectedIndex].downClueNum
      );
    }
  }

  private selectNextSquare(index: number): void {
    const viewMode = this.toolbarService.getCurrentViewMode();

    if (!this.puzzleService.isPuzzleEnd(index)) {
      if (viewMode == ViewMode.Across) {
        this.selectSquare(this.getNextIndex(index, "ArrowRight"));
      } else if (viewMode == ViewMode.Down) {
        this.selectSquare(this.getNextIndex(index, "ArrowDown"));
      }
    }
  }

  private selectPrevSquare(index: number): void {
    const viewMode = this.toolbarService.getCurrentViewMode();

    if (!this.puzzleService.isPuzzleStart(index)) {
      if (viewMode == ViewMode.Across) {
        this.selectSquare(this.getNextIndex(index, "ArrowLeft"));
      } else if (viewMode == ViewMode.Down) {
        this.selectSquare(this.getNextIndex(index, "ArrowUp"));
      }
    }
  }

  private selectSquare(index: number): void {
    this.selectedIndex = index;
    this.puzzleService.selectSquare(index);
  }

  private getNextIndex(index: number, key: string): number {
    let skipSpacers = this.toolbarService.getCurrentEditMode() != EditMode.Spacer;
    let vertical = key == "ArrowDown" || key == "ArrowUp";

    if (key == "ArrowDown" || key == "ArrowRight") {
      return this.puzzleService.getNextIndex(index, vertical, skipSpacers);
    } else if (key == "ArrowUp" || key == "ArrowLeft") {
      return this.puzzleService.getPrevIndex(index, vertical, skipSpacers);
    }

    return index;
  }

  private isAlphaChar(text: string): boolean {
    let char = text.toUpperCase();
    return char.length == 1 && char >= "A" && char <= "Z";
  }

  private isArrowKey(key: string): boolean {
    return ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(key);
  }

  private handleToolbarEvents(): void {
    this.toolbarService.showHideEvent$.subscribe(() => (this.answersHidden = !this.answersHidden));
  }
}

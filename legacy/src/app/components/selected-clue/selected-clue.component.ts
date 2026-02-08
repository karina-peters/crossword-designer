import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";

import { PuzzleService } from "legacy/src/app/services/puzzle.service";
import { ToolbarService } from "legacy/src/app/services/toolbar.service";

import { Clue, ClueType } from "legacy/src/app/models/clue.model";

@Component({
  selector: "app-selected-clue",
  templateUrl: "./selected-clue.component.html",
  styleUrls: ["./selected-clue.component.scss"],
})
export class SelectedClueComponent implements OnInit {
  public locked: boolean = true;
  public acrossInput: FormControl = new FormControl("");
  public downInput: FormControl = new FormControl("");

  public acrossClue: Clue = new Clue();
  public downClue: Clue = new Clue();

  constructor(
    private puzzleService: PuzzleService,
    private toolbarService: ToolbarService,
  ) {}

  ngOnInit(): void {
    this.handleToolbarEvents();
    this.enableInputs(this.puzzleService.puzzle.locked);

    this.puzzleService.activeAcrossClue$.subscribe((index: number) => {
      if (index != -1) {
        this.acrossClue = this.puzzleService.puzzle.acrossClues[index];
        this.acrossInput.setValue(this.acrossClue.text);
      } else {
        this.acrossClue = new Clue();
        this.acrossInput.reset();
        this.acrossInput.disable();
      }
    });

    this.puzzleService.activeDownClue$.subscribe((index: number) => {
      if (index != -1) {
        this.downClue = this.puzzleService.puzzle.downClues[index];
        this.downInput.setValue(this.downClue.text);
      } else {
        this.downClue = new Clue();
        this.downInput.reset();
        this.downInput.disable();
      }
    });
  }

  public saveClues(): void {
    if (this.acrossInput.dirty) {
      this.puzzleService.setClueText(ClueType.Across, this.acrossClue.num, this.acrossInput.value);
      this.acrossInput.markAsPristine();
    }

    if (this.downInput.dirty) {
      this.puzzleService.setClueText(ClueType.Down, this.downClue.num, this.downInput.value);
      this.downInput.markAsPristine();
    }
  }

  private handleToolbarEvents(): void {
    this.toolbarService.lockEvent$.subscribe((lock: boolean) => this.enableInputs(lock));
  }

  private enableInputs(locked: boolean) {
    if (locked) {
      this.acrossInput.disable();
      this.downInput.disable();
    } else {
      this.acrossInput.enable();
      this.downInput.enable();
    }
  }
}

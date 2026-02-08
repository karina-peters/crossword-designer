import { Component, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";

import { PuzzleService } from "legacy/src/app/services/puzzle.service";
import { ToolbarService } from "legacy/src/app/services/toolbar.service";

import { Clue, ClueType } from "legacy/src/app/models/clue.model";

@Component({
  selector: "app-clue-editing",
  templateUrl: "./clue-editing.component.html",
  styleUrls: ["./clue-editing.component.scss"],
})
export class ClueEditingComponent implements OnInit {
  public cluesForm: FormGroup = new FormGroup({
    across: new FormArray([]),
    down: new FormArray([]),
  });

  public get acrossClues(): Array<Clue> {
    return this.puzzleService.puzzle.acrossClues;
  }

  public get downClues(): Array<Clue> {
    return this.puzzleService.puzzle.downClues;
  }

  constructor(
    private puzzleService: PuzzleService,
    private toolbarService: ToolbarService,
  ) {}

  ngOnInit(): void {
    this.cluesForm = new FormGroup({
      across: new FormArray(this.puzzleService.puzzle.acrossClues.map((clue) => new FormControl(clue.text))),
      down: new FormArray(this.puzzleService.puzzle.downClues.map((clue) => new FormControl(clue.text))),
    });

    this.puzzleService.puzzle.locked ? this.cluesForm.disable() : this.cluesForm.enable();
    this.handleToolbarEvents();
  }

  public updateAcrossClue(index: number): void {
    const control = (this.cluesForm.get("across") as FormArray).at(index);

    if (control.dirty) {
      let clue = this.puzzleService.puzzle.acrossClues[index];
      let text = this.cluesForm.value.across[index];

      this.puzzleService.setClueText(ClueType.Across, clue.num, text);
      control.markAsPristine();
    }
  }

  public updateDownClue(index: number): void {
    const control = (this.cluesForm.get("down") as FormArray).at(index);

    if (control.dirty) {
      let clue = this.puzzleService.puzzle.downClues[index];
      let text = this.cluesForm.value.down[index];

      this.puzzleService.setClueText(ClueType.Down, clue.num, text);
      control.markAsPristine();
    }
  }

  private onSave(): void {
    this.puzzleService.savePuzzle().subscribe(
      () => {},
      (err: ErrorEvent) => {
        alert("Clues failed to save: " + err.message);
      },
    );
  }

  private onClear(): void {
    this.puzzleService.clearPuzzle();
  }

  private handleToolbarEvents(): void {
    const toolbar = this.toolbarService;
    toolbar.saveEvent$.subscribe(() => this.onSave());
    toolbar.clearEvent$.subscribe(() => this.onClear());

    toolbar.lockEvent$.subscribe((lock: boolean) => {
      lock ? this.cluesForm.disable() : this.cluesForm.enable();
    });
  }
}

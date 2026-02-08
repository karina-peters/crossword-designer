import { Component, OnInit } from "@angular/core";

import { PuzzleService } from "legacy/src/app/services/puzzle.service";
import { ToolbarService } from "legacy/src/app/services/toolbar.service";

@Component({
  selector: "app-puzzle-editing",
  templateUrl: "./puzzle-editing.component.html",
  styleUrls: ["./puzzle-editing.component.scss"],
})
export class PuzzleEditingComponent implements OnInit {
  public puzzleLoaded: boolean = false;

  constructor(
    private puzzleService: PuzzleService,
    private toolbarService: ToolbarService,
  ) {}

  ngOnInit(): void {
    this.handleToolbarEvents();
  }

  private onSave(): void {
    this.puzzleService.savePuzzle().subscribe(
      () => {},
      (err: ErrorEvent) => {
        alert("Puzzle failed to save: " + err.message);
      },
    );
  }

  private onClear(): void {
    this.puzzleService.clearPuzzle();
  }

  private handleToolbarEvents(): void {
    this.toolbarService.clearEvent$.subscribe(() => this.onClear());
    this.toolbarService.saveEvent$.subscribe(() => this.onSave());
  }
}

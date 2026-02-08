import { Component, OnInit } from "@angular/core";

import { PuzzleService } from "legacy/src/app/services/puzzle.service";

import { Clue } from "legacy/src/app/models/clue.model";

@Component({
  selector: "app-puzzle-review",
  templateUrl: "./puzzle-review.component.html",
  styleUrls: ["./puzzle-review.component.scss"],
})
export class PuzzleReviewComponent implements OnInit {
  get acrossClues(): Array<Clue> {
    return this.puzzleService.puzzle.acrossClues;
  }

  get downClues(): Array<Clue> {
    return this.puzzleService.puzzle.downClues;
  }

  get title(): string {
    return this.puzzleService.puzzle.name;
  }

  constructor(private puzzleService: PuzzleService) {}

  ngOnInit(): void {}
}

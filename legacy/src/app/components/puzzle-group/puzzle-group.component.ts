import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { CardConfig, PuzzleCard } from "legacy/src/app/models/card.model";
import { PuzzleMetadata } from "legacy/src/app/models/puzzle.model";

@Component({
  selector: "app-puzzle-group",
  templateUrl: "./puzzle-group.component.html",
  styleUrls: ["./puzzle-group.component.scss"],
})
export class PuzzleGroupComponent implements OnInit {
  @Input() puzzles: Array<PuzzleCard> = [];
  @Input() config: CardConfig = { readonly: false, showOwner: false };

  @Output() selectEvent: EventEmitter<PuzzleMetadata> = new EventEmitter();
  @Output() deleteEvent: EventEmitter<string> = new EventEmitter();
  @Output() lockEvent: EventEmitter<{ id: string; value: boolean }> = new EventEmitter();
  @Output() shareEvent: EventEmitter<{ id: string; value: boolean }> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    this.puzzles.sort((a, b) => b.lastEdited.valueOf() - a.lastEdited.valueOf());
  }

  public onPuzzleSelect(index: number): void {
    const puzzle = this.puzzles[index];

    this.selectEvent.emit({ id: puzzle.id, name: puzzle.name, locked: puzzle.locked });
  }

  public onPuzzleLock($event: Event, index: number): void {
    const puzzle = this.puzzles[index];
    puzzle.locked = !puzzle.locked;

    $event.stopPropagation();
    this.lockEvent.emit({ id: puzzle.id, value: puzzle.locked });
  }

  public onPuzzleShare($event: Event, index: number): void {
    const puzzle = this.puzzles[index];
    puzzle.public = !puzzle.public;

    $event.stopPropagation();
    this.shareEvent.emit({ id: puzzle.id, value: puzzle.public });
  }

  public onPuzzleDelete($event: Event, index: number): void {
    const puzzle = this.puzzles[index];
    this.puzzles.filter((p) => p.id != puzzle.id);

    $event.stopPropagation();
    this.deleteEvent.emit(puzzle.id);
  }
}

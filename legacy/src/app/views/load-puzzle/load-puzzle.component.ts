import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

import { map, switchMap } from "rxjs/operators";

import { AuthService } from "legacy/src/app/services/auth.service";
import { LoadService } from "legacy/src/app/services/load.service";

import { PuzzleCard } from "legacy/src/app/models/card.model";
import { PuzzleDoc, PuzzleMetadata } from "legacy/src/app/models/puzzle.model";
import { UserDoc } from "legacy/src/app/models/user.model";

@Component({
  selector: "app-load-puzzle",
  templateUrl: "./load-puzzle.component.html",
  styleUrls: ["./load-puzzle.component.scss"],
})
export class LoadPuzzleComponent implements OnInit {
  public puzzleList: Array<PuzzleDoc> = [];
  public userPuzzleCards: Array<PuzzleCard> = [];
  public publicPuzzleCards: Array<PuzzleCard> = [];
  public listLoaded: boolean = false;

  public newPuzzleForm = new FormGroup({
    title: new FormControl(""),
    width: new FormControl(""),
    height: new FormControl(""),
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadService: LoadService,
  ) {}

  ngOnInit(): void {
    this.loadService
      .getPuzzleList()
      .pipe(
        map((puzzles: Array<PuzzleDoc>) => {
          this.puzzleList = puzzles;
          return puzzles.map((p) => p.createdBy);
        }),
        switchMap((userIds: Array<string>) => this.loadService.getUserList(userIds)),
      )
      .subscribe((users: Array<UserDoc>) => {
        this.buildPuzzleCards(users);
        this.listLoaded = true;
      });
  }

  public createPuzzle(): void {
    this.loadService
      .createPuzzle(this.newPuzzleForm.value.title, this.newPuzzleForm.value.width, this.newPuzzleForm.value.height)
      .subscribe(
        () => this.router.navigateByUrl("/answers"),
        (err: ErrorEvent) => {
          alert("Failed to create puzzle: " + err.message);
        },
      );
  }

  public selectPuzzle(metadata: PuzzleMetadata): void {
    this.loadService.setActivePuzzle(metadata);
    this.router.navigateByUrl("/answers");
  }

  public deletePuzzle(id: string): void {
    this.loadService.deletePuzzle(id).subscribe(
      () => {},
      (err: ErrorEvent) => {
        alert("Failed to delete puzzle: " + err.message);
      },
    );
  }

  public setPuzzleLock(id: string, value: boolean): void {
    this.loadService.updatePuzzle(id, { locked: value }).subscribe(
      () => {},
      (err: ErrorEvent) => {
        alert("Failed to update puzzle: " + err.message);
      },
    );
  }

  public setPuzzleShare(id: string, value: boolean): void {
    this.loadService.updatePuzzle(id, { public: value }).subscribe(
      () => {},
      (err: ErrorEvent) => {
        alert("Failed to update puzzle: " + err.message);
      },
    );
  }

  private buildPuzzleCards(users: Array<UserDoc>): void {
    this.puzzleList.forEach((puzzle: PuzzleDoc) => {
      const creator = users.find((u) => (u.id = puzzle.createdBy));
      const card = {
        id: puzzle.id,
        name: puzzle.name,
        owner: creator?.name ? creator.name : "",
        lastEdited: puzzle.lastEdited,
        width: puzzle.width,
        height: puzzle.height,
        locked: puzzle.locked,
        public: puzzle.public,
      };

      if (puzzle.createdBy == this.authService.currentUser?.id) {
        this.userPuzzleCards.push(card);
      } else {
        this.publicPuzzleCards.push(card);
      }
    });
  }
}

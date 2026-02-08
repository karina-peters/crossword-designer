import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { NavigationStart, Router } from "@angular/router";

import { filter } from "rxjs/operators";

import { LoadService } from "legacy/src/app/services/load.service";
import { ToolbarService } from "legacy/src/app/services/toolbar.service";

import { EditMode, ViewMode } from "legacy/src/app/models/toolbar.model";
import { PuzzleMetadata } from "legacy/src/app/models/puzzle.model";

export enum ActiveRoute {
  Unknown,
  AnswerDrafting,
  PuzzleEditing,
  ClueEditing,
}

@Component({
  selector: "app-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
})
export class ToolbarComponent implements OnInit {
  public activeRoute: ActiveRoute = ActiveRoute.Unknown;
  public nameInput: FormControl = new FormControl("");
  public locked: boolean = true;
  public editMode: number = EditMode.Value;
  public viewMode: number = ViewMode.Across;
  public answersHidden: boolean = false;
  public sortReverse: boolean = false;
  public filtersOn: boolean = false;
  public lengthInput: FormControl = new FormControl();
  public containsInput: FormControl = new FormControl();

  constructor(
    private router: Router,
    private toolbarService: ToolbarService,
    private loadService: LoadService,
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(filter((e) => e instanceof NavigationStart)).subscribe((e) => {
      this.activeRoute = this.getRouteFromUrl((e as NavigationStart).url);
      this.editMode = this.activeRoute == ActiveRoute.AnswerDrafting ? 2 : 0;
    });

    this.loadService.activePuzzle$.subscribe((metadata: PuzzleMetadata) => {
      this.locked = metadata.locked;

      this.nameInput.setValue(metadata.name);
      this.locked ? this.nameInput.disable() : this.nameInput.enable();
    });
  }

  public onNameChange(): void {
    if (this.nameInput.dirty) {
      this.loadService.updatePuzzle(this.loadService.activePuzzle$.value.id, { name: this.nameInput.value });
      this.toolbarService.setName(this.nameInput.value);
    }
  }

  public onLock(override?: boolean): void {
    this.locked = override != undefined ? override : !this.locked;
    this.locked ? this.nameInput.disable() : this.nameInput.enable();

    this.loadService.updatePuzzle(this.loadService.activePuzzle$.value.id, { locked: this.locked });
    this.toolbarService.setLock(this.locked);
  }

  public onEditModeChange(mode: number): void {
    this.editMode = mode;
    this.toolbarService.setEditMode(mode);
  }

  public onViewModeChange(mode: number): void {
    this.viewMode = mode;
    this.toolbarService.setViewMode(mode);
  }

  public onSave(): void {
    this.toolbarService.save();
  }

  public onClear(): void {
    this.toolbarService.clear();
  }

  public onShowHide(): void {
    this.answersHidden = !this.answersHidden;
    this.toolbarService.showHide();
  }

  public onSort(): void {
    this.sortReverse = !this.sortReverse;
    this.toolbarService.sortReverse();
  }

  public onFilterChange(): void {
    if (this.lengthInput.dirty || this.containsInput.dirty) {
      this.filtersOn = true;
      this.toolbarService.setFilter({ length: this.lengthInput.value, contains: this.containsInput.value });
    }
  }

  public onFilterClear(): void {
    this.filtersOn = false;

    this.lengthInput.reset();
    this.containsInput.reset();
    this.toolbarService.setFilter({ length: null, contains: null });
  }

  // TODO: move somewhere else
  private getRouteFromUrl(url: string): ActiveRoute {
    switch (url) {
      case "/answers":
        return ActiveRoute.AnswerDrafting;
      case "/puzzle":
        return ActiveRoute.PuzzleEditing;
      case "/clues":
        return ActiveRoute.ClueEditing;
      default:
        return ActiveRoute.Unknown;
    }
  }
}

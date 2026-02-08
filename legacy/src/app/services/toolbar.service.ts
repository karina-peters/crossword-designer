import { EventEmitter, Injectable } from "@angular/core";
import { EditMode, Filter, ViewMode } from "../models/toolbar.model";

@Injectable({
  providedIn: "root",
})
export class ToolbarService {
  public nameEvent$: EventEmitter<string> = new EventEmitter();
  public lockEvent$: EventEmitter<boolean> = new EventEmitter();
  public saveEvent$: EventEmitter<undefined> = new EventEmitter();
  public clearEvent$: EventEmitter<undefined> = new EventEmitter();
  public showHideEvent$: EventEmitter<undefined> = new EventEmitter();
  public sortReverseEvent$: EventEmitter<undefined> = new EventEmitter();
  public filterEvent$: EventEmitter<Filter> = new EventEmitter();

  private editMode: EditMode = EditMode.Value;
  private viewMode: ViewMode = ViewMode.Across;

  constructor() {}

  public getCurrentEditMode(): EditMode {
    return this.editMode;
  }

  public getCurrentViewMode(): ViewMode {
    return this.viewMode;
  }

  public setEditMode(mode: EditMode): void {
    this.editMode = mode;
  }

  public setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  public setName(name: string): void {
    this.nameEvent$.emit(name);
  }

  public setLock(lock: boolean): void {
    this.lockEvent$.emit(lock);
  }

  public save(): void {
    this.saveEvent$.emit();
  }

  public clear(): void {
    this.clearEvent$.emit();
  }

  public showHide(): void {
    this.showHideEvent$.emit();
  }

  public sortReverse(): void {
    this.sortReverseEvent$.emit();
  }

  public setFilter(filter: Filter): void {
    this.filterEvent$.emit(filter);
  }
}

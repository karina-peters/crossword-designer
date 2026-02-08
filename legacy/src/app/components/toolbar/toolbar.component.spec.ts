import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NavigationStart, Router } from "@angular/router";

import { BehaviorSubject, Observable, of } from "rxjs";

import { ActiveRoute, ToolbarComponent } from "./toolbar.component";
import { LoadService } from "legacy/src/app/services/load.service";
import { ToolbarService } from "legacy/src/app/services/toolbar.service";

import { EditMode } from "legacy/src/app/models/toolbar.model";
import { PuzzleMetadata } from "legacy/src/app/models/puzzle.model";

describe("ToolbarComponent", () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  const routerSpy = jasmine.createSpyObj("Router", ["events"]);
  const loadServiceSpy = jasmine.createSpyObj("LoadService", ["activePuzzle$", "updatePuzzle"]);
  const toolbarServiceSpy = jasmine.createSpyObj("ToolbarService", [
    "setName",
    "setEditMode",
    "setViewMode",
    "setLock",
    "save",
    "clear",
    "showHide",
    "sortReverse",
    "setFilter",
  ]);

  beforeEach(async () => {
    routerSpy.events = new Observable<NavigationStart>();
    toolbarServiceSpy.setName.calls.reset();
    toolbarServiceSpy.setFilter.calls.reset();
    loadServiceSpy.updatePuzzle.calls.reset();
    loadServiceSpy.activePuzzle$ = new BehaviorSubject<PuzzleMetadata>({ id: "testId", name: "", locked: false });

    await TestBed.configureTestingModule({
      declarations: [ToolbarComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ToolbarService, useValue: toolbarServiceSpy },
        { provide: LoadService, useValue: loadServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should set active route and edit mode for Answer Drafting", () => {
      routerSpy.events = of(new NavigationStart(0, "/answers"));

      fixture.detectChanges();

      expect(component.activeRoute).toEqual(ActiveRoute.AnswerDrafting);
      expect(component.editMode).toEqual(EditMode.Circle);
    });

    it("should set active route and edit mode for Puzzle Editing", () => {
      routerSpy.events = of(new NavigationStart(0, "/puzzle"));

      fixture.detectChanges();

      expect(component.activeRoute).toEqual(ActiveRoute.PuzzleEditing);
      expect(component.editMode).toEqual(EditMode.Value);
    });

    it("should disable name if puzzle locked", () => {
      loadServiceSpy.activePuzzle$.next({ id: "testId", name: "", locked: true });

      fixture.detectChanges();

      expect(component.locked).toBeTrue();
      expect(component.nameInput.disabled).toBeTrue();
    });
  });

  describe("onNameChange", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should do nothing when input pristine", () => {
      component.nameInput.markAsPristine();

      component.onNameChange();

      expect(loadServiceSpy.updatePuzzle).not.toHaveBeenCalled();
      expect(toolbarServiceSpy.setName).not.toHaveBeenCalled();
    });

    it("should set update name and emit name event when input dirty", () => {
      component.nameInput.setValue("New name");
      component.nameInput.markAsDirty();

      component.onNameChange();

      expect(loadServiceSpy.updatePuzzle).toHaveBeenCalledWith("testId", { name: "New name" });
      expect(toolbarServiceSpy.setName).toHaveBeenCalledWith("New name");
    });
  });

  describe("onLock", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should set lock and emit lock event", () => {
      component.locked = false;
      component.onLock();

      expect(component.locked).toEqual(true);
      expect(loadServiceSpy.updatePuzzle).toHaveBeenCalledWith("testId", { locked: true });
      expect(toolbarServiceSpy.setLock).toHaveBeenCalledWith(true);
    });

    it("should set lock with override and emit lock event", () => {
      component.locked = false;
      component.onLock(false);

      expect(component.locked).toEqual(false);
      expect(loadServiceSpy.updatePuzzle).toHaveBeenCalledWith("testId", { locked: false });
      expect(toolbarServiceSpy.setLock).toHaveBeenCalledWith(false);
    });
  });

  describe("onEditModeChange", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should set edit mode and emit edit mode change", () => {
      const mode = 1;

      component.onEditModeChange(mode);

      expect(component.editMode).toEqual(mode);
      expect(toolbarServiceSpy.setEditMode).toHaveBeenCalledWith(mode);
    });
  });

  describe("onViewModeChange", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should set view mode and emit view mode change", () => {
      const mode = 2;

      component.onViewModeChange(mode);

      expect(component.viewMode).toEqual(mode);
      expect(toolbarServiceSpy.setViewMode).toHaveBeenCalledWith(mode);
    });
  });

  describe("onSave", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should emit save event", () => {
      component.onSave();

      expect(toolbarServiceSpy.save).toHaveBeenCalled();
    });
  });

  describe("onClear", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should emit save event", () => {
      component.onClear();

      expect(toolbarServiceSpy.clear).toHaveBeenCalled();
    });
  });

  describe("onShowHide", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should toggle hidden and emit show hide event", () => {
      component.onShowHide();

      expect(component.answersHidden).toEqual(true);
      expect(toolbarServiceSpy.showHide).toHaveBeenCalled();
    });
  });

  describe("onSort", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should toggle sort reverse and emit sort event", () => {
      component.onSort();

      expect(component.sortReverse).toEqual(true);
      expect(toolbarServiceSpy.sortReverse).toHaveBeenCalled();
    });
  });

  describe("onFilterChange", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should do nothing when inputs pristine", () => {
      component.lengthInput.markAsPristine();
      component.containsInput.markAsPristine();

      component.onFilterChange();

      expect(toolbarServiceSpy.setFilter).not.toHaveBeenCalled();
    });

    it("should set filters on and emit filter event when length dirty", () => {
      component.lengthInput.setValue(3);
      component.lengthInput.markAsDirty();
      component.containsInput.markAsPristine();

      component.onFilterChange();

      expect(toolbarServiceSpy.setFilter).toHaveBeenCalledWith({ length: 3, contains: null });
    });

    it("should set filters on and emit filter event when contains dirty", () => {
      component.containsInput.setValue("A");
      component.containsInput.markAsDirty();
      component.lengthInput.markAsPristine();

      component.onFilterChange();

      expect(toolbarServiceSpy.setFilter).toHaveBeenCalledWith({ length: null, contains: "A" });
    });
  });

  describe("onFilterClear", () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it("should set filters off, reset inputs, and emit filter event", () => {
      spyOn(component.lengthInput, "reset");
      spyOn(component.containsInput, "reset");
      component.lengthInput.setValue(3);
      component.containsInput.setValue("A");

      component.onFilterClear();

      expect(component.filtersOn).toEqual(false);
      expect(component.lengthInput.reset).toHaveBeenCalled();
      expect(component.containsInput.reset).toHaveBeenCalled();
      expect(toolbarServiceSpy.setFilter).toHaveBeenCalledWith({ length: null, contains: null });
    });
  });
});

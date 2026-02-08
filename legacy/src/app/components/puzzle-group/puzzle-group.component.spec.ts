import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PuzzleGroupComponent } from "./puzzle-group.component";
import { PuzzleCard } from "legacy/src/app/models/card.model";
import { DebugElement } from "@angular/core";
import { By } from "@angular/platform-browser";

describe("PuzzleGroupComponent", () => {
  let component: PuzzleGroupComponent;
  let fixture: ComponentFixture<PuzzleGroupComponent>;
  let cardEls: Array<DebugElement>;
  let lockEls: Array<DebugElement>;
  let shareEls: Array<DebugElement>;
  let deleteEls: Array<DebugElement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PuzzleGroupComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleGroupComponent);
    component = fixture.componentInstance;

    component.puzzles = [
      { id: "puzzle2", lastEdited: new Date(2002, 2, 2), locked: true, public: false } as PuzzleCard,
      { id: "puzzle3", lastEdited: new Date(2001, 1, 1), locked: true, public: false } as PuzzleCard,
      { id: "puzzle1", lastEdited: new Date(2003, 3, 3), locked: true, public: false } as PuzzleCard,
    ];

    fixture.detectChanges();
    cardEls = fixture.debugElement.queryAll(By.css(".card"));
    lockEls = fixture.debugElement.queryAll(By.css(".lock-item"));
    shareEls = fixture.debugElement.queryAll(By.css(".share-item"));
    deleteEls = fixture.debugElement.queryAll(By.css(".delete-item"));
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should order puzzles by date", () => {
      expect(component.puzzles[0].id).toEqual("puzzle1");
      expect(component.puzzles[1].id).toEqual("puzzle2");
      expect(component.puzzles[2].id).toEqual("puzzle3");
    });
  });

  describe("onPuzzleSelect", () => {
    it("should emit selected puzzle", () => {
      const index = 0;
      const puzzle = component.puzzles[index];
      spyOn(component.selectEvent, "emit");
      cardEls[index].triggerEventHandler("click", undefined);

      fixture.detectChanges();

      expect(component.selectEvent.emit).toHaveBeenCalledWith({ id: puzzle.id, name: puzzle.name, locked: puzzle.locked });
    });
  });

  describe("onPuzzleLock", () => {
    it("should emit selected puzzle id", () => {
      const index = 1;
      spyOn(component.lockEvent, "emit");
      lockEls[index].triggerEventHandler("click", { stopPropagation: () => {} } as Event);

      fixture.detectChanges();

      expect(component.lockEvent.emit).toHaveBeenCalledWith({ id: component.puzzles[index].id, value: false });
    });
  });

  describe("onPuzzleShare", () => {
    it("should emit selected puzzle id", () => {
      const index = 2;
      spyOn(component.shareEvent, "emit");
      shareEls[index].triggerEventHandler("click", { stopPropagation: () => {} } as Event);

      fixture.detectChanges();

      expect(component.shareEvent.emit).toHaveBeenCalledWith({ id: component.puzzles[index].id, value: true });
    });
  });

  describe("onPuzzleDelete", () => {
    it("should emit selected puzzle id", () => {
      const index = 0;
      spyOn(component.deleteEvent, "emit");
      deleteEls[index].triggerEventHandler("click", { stopPropagation: () => {} } as Event);

      fixture.detectChanges();

      expect(component.deleteEvent.emit).toHaveBeenCalledWith(component.puzzles[index].id);
    });
  });
});

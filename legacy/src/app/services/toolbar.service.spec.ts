import { TestBed } from "@angular/core/testing";

import { ToolbarService } from "./toolbar.service";

import { EditMode, ViewMode } from "../models/toolbar.model";

describe("ToolbarService", () => {
  let service: ToolbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolbarService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should set and get edit mode", () => {
    service.setEditMode(EditMode.Circle);

    expect(service.getCurrentEditMode()).toEqual(EditMode.Circle);
  });

  it("should set and get view mode", () => {
    service.setViewMode(ViewMode.Intersect);

    expect(service.getCurrentViewMode()).toEqual(ViewMode.Intersect);
  });

  it("should emit name event", () => {
    spyOn(service.nameEvent$, "emit");

    service.setName("New name");

    expect(service.nameEvent$.emit).toHaveBeenCalledWith("New name");
  });

  it("should emit lock event", () => {
    spyOn(service.lockEvent$, "emit");

    service.setLock(false);

    expect(service.lockEvent$.emit).toHaveBeenCalledWith(false);
  });

  it("should emit save event", () => {
    spyOn(service.saveEvent$, "emit");

    service.save();

    expect(service.saveEvent$.emit).toHaveBeenCalledWith();
  });

  it("should emit clear event", () => {
    spyOn(service.clearEvent$, "emit");

    service.clear();

    expect(service.clearEvent$.emit).toHaveBeenCalledWith();
  });

  it("should emit show hide event", () => {
    spyOn(service.showHideEvent$, "emit");

    service.showHide();

    expect(service.showHideEvent$.emit).toHaveBeenCalledWith();
  });

  it("should emit sort reverse event", () => {
    spyOn(service.sortReverseEvent$, "emit");

    service.sortReverse();

    expect(service.sortReverseEvent$.emit).toHaveBeenCalledWith();
  });

  it("should emit filter event", () => {
    spyOn(service.filterEvent$, "emit");

    service.setFilter({ length: 3, contains: "A" });

    expect(service.filterEvent$.emit).toHaveBeenCalledWith({ length: 3, contains: "A" });
  });
});

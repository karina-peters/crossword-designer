import { EventEmitter } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { BehaviorSubject, of, throwError } from "rxjs";

import { TestPuzzle } from "legacy/src/environments/environment";

import { LoadService } from "./load.service";
import { PuzzleService } from "./puzzle.service";
import { SaveService } from "./save.service";
import { ToolbarService } from "./toolbar.service";

import { Clue, ClueType } from "../models/clue.model";
import { PuzzleDoc, Square, SquareType, OverlayType, PuzzleMetadata } from "../models/puzzle.model";

describe("PuzzleService", () => {
  const testId = "test-id";
  const testPuzzleDoc = { id: testId, ...TestPuzzle } as PuzzleDoc;

  let service: PuzzleService;

  const loadServiceSpy = jasmine.createSpyObj("LoadService", ["getPuzzle", "activePuzzle$"]);
  const saveServiceSpy = jasmine.createSpyObj("SaveService", ["savePuzzle"]);
  const toolbarServiceSpy = jasmine.createSpyObj("ToolbarService", ["nameEvent$", "lockEvent$"]);

  beforeEach(() => {
    loadServiceSpy.activePuzzle$ = new BehaviorSubject<PuzzleMetadata>({ id: testId, name: "", locked: false });
    loadServiceSpy.activePuzzlePatch$ = new BehaviorSubject<Partial<PuzzleDoc>>({});
    loadServiceSpy.getPuzzle.and.returnValue(of(testPuzzleDoc));
    saveServiceSpy.savePuzzle.and.returnValue(of(undefined));
    toolbarServiceSpy.nameEvent$ = new EventEmitter();
    toolbarServiceSpy.lockEvent$ = new EventEmitter();

    TestBed.configureTestingModule({
      providers: [
        { provide: LoadService, useValue: loadServiceSpy },
        { provide: SaveService, useValue: saveServiceSpy },
        { provide: ToolbarService, useValue: toolbarServiceSpy },
      ],
    });

    service = TestBed.inject(PuzzleService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("constructor", () => {
    it("should get puzzle with next puzzle id", () => {
      loadServiceSpy.activePuzzle$.next({ id: "test2", name: "", locked: false });
      loadServiceSpy.activePuzzle$.subscribe(() => {
        expect(loadServiceSpy.getPuzzle).toHaveBeenCalledWith("test2");
      });
    });

    it("should patch puzzle with new data", () => {
      const patch = { locked: true };

      loadServiceSpy.activePuzzlePatch$.next(patch);
      loadServiceSpy.activePuzzlePatch$.subscribe(() => {
        expect(service.puzzle.locked).toEqual(true);
      });
    });

    it("should set name on toolbar event", () => {
      toolbarServiceSpy.nameEvent$.emit("New name");

      expect(service.puzzle.name).toEqual("New name");
    });

    it("should set lock on toolbar event", () => {
      toolbarServiceSpy.lockEvent$.emit(true);

      expect(service.puzzle.locked).toBeTrue();
    });
  });

  describe("activatePuzzle", () => {
    it("should return true number squares when successful", () => {
      expect(service.puzzle.grid[0]).toEqual(new Square(0, "Y", 1, 1, 1));
      expect(service.puzzle.grid[198]).toEqual(new Square(198, "U", -1, 63, 50));
      expect(service.puzzle.grid[223]).toEqual(new Square(223, "", -1, -1, -1, SquareType.Spacer));
      expect(service.puzzle.grid[440]).toEqual(new Square(440, "X", -1, 128, 122));
    });

    it("should return true and associate clues when successful", () => {
      expect(service.puzzle.acrossClues[0]).toEqual(new Clue(1, "It's not that simple", "YESANDNO", [0, 1, 2, 3, 4, 5, 6, 7]));
      expect(service.puzzle.downClues[0]).toEqual(new Clue(1, "Sharp bark", "YIP", [0, 21, 42]));

      expect(service.puzzle.acrossClues[5]).toEqual(new Clue(21, "Reading can be found on it", "THAMES", [36, 37, 38, 39, 40, 41]));
      expect(service.puzzle.downClues[18]).toEqual(new Clue(22, "Mouthing off", "SASS", [41, 62, 83, 104]));

      expect(service.puzzle.acrossClues[10]).toEqual(new Clue(28, "Pirate fodder, once", "BLANKCDS", [76, 77, 78, 79, 80, 81, 82, 83]));
      expect(service.puzzle.downClues[20]).toEqual(new Clue(29, "", "LAY", [77, 98, 119]));

      expect(service.puzzle.acrossClues[21]).toEqual(new Clue(50, "", "ASSETS", [156, 157, 158, 159, 160, 161]));
      expect(service.puzzle.downClues[34]).toEqual(new Clue(50, "", "ATUL", [156, 177, 198, 219]));

      expect(service.puzzle.acrossClues[60]).toEqual(new Clue(128, "", "TOTHEMAX", [433, 434, 435, 436, 437, 438, 439, 440]));
      expect(service.puzzle.downClues[78]).toEqual(new Clue(122, "", "SEX", [398, 419, 440]));
    });
  });

  describe("savePuzzle", () => {
    it("should return true when successful", () => {
      service.savePuzzle().subscribe(() => {
        expect(saveServiceSpy.savePuzzle).toHaveBeenCalled();
      });
    });

    it("should throw error when setDoc unsuccessful", () => {
      const errorMsg = "Failed to set doc";
      saveServiceSpy.savePuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.savePuzzle().subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        },
      );
    });
  });

  describe("clearPuzzle", () => {
    it("should clear puzzle", () => {
      expect(service.puzzle.grid[0]).toEqual(new Square(0, "Y", 1, 1, 1));
      expect(service.puzzle.grid[8]).toEqual(new Square(8, "", -1, -1, -1, SquareType.Spacer));
      expect(service.puzzle.acrossClues[0]).toEqual(new Clue(1, "It's not that simple", "YESANDNO", [0, 1, 2, 3, 4, 5, 6, 7]));

      service.clearPuzzle();

      expect(service.puzzle.grid[0]).toEqual(new Square(0, " ", 1, 1, 1));
      expect(service.puzzle.grid[8]).toEqual(new Square(8, " ", 9, 1, 9));

      service.activeAcrossClue$.subscribe((clueIndex) => {
        const clue = service.puzzle.acrossClues[clueIndex];

        expect(clue.num).toEqual(1);
        expect(clue.answer).toEqual(Array(21).fill(" ").join(""));
      });

      service.activeDownClue$.subscribe((clueIndex) => {
        const clue = service.puzzle.downClues[clueIndex];

        expect(clue.num).toEqual(1);
        expect(clue.answer).toEqual(Array(21).fill(" ").join(""));
      });
    });
  });

  describe("selectSquare", () => {
    it("should select letter square", () => {
      service.selectSquare(3);

      service.activeAcrossClue$.subscribe((clueIndex) => {
        expect(service.puzzle.acrossClues[clueIndex]).toEqual(new Clue(1, "It's not that simple", "YESANDNO", [0, 1, 2, 3, 4, 5, 6, 7]));
      });

      service.activeDownClue$.subscribe((clueIndex) => {
        expect(service.puzzle.downClues[clueIndex]).toEqual(new Clue(4, "Draw", "ATTRACT", [3, 24, 45, 66, 87, 108, 129]));
      });
    });

    it("should select spacer square", () => {
      service.selectSquare(432);

      service.activeAcrossClue$.subscribe((clueIndex) => {
        expect(clueIndex).toEqual(-1);
      });

      service.activeDownClue$.subscribe((clueIndex) => {
        expect(clueIndex).toEqual(-1);
      });
    });
  });

  describe("toggleSquareType", () => {
    it("should create new across clues and displace down clue when toggling Letter to Spacer", () => {
      service.toggleSquareType(3);

      expect(service.puzzle.grid[3]).toEqual(new Square(3, "", -1, -1, -1, SquareType.Spacer));
      expect(service.puzzle.acrossClues[0]).toEqual(new Clue(1, "", "YES", [0, 1, 2]));
      expect(service.puzzle.acrossClues[1]).toEqual(new Clue(4, "", "NDNO", [4, 5, 6, 7]));
      expect(service.puzzle.downClues[17]).toEqual(new Clue(19, "", "TTRACT", [24, 45, 66, 87, 108, 129]));

      expect(service.puzzle.acrossClues.length).toEqual(63);
      expect(service.puzzle.downClues.length).toEqual(79);
    });

    it("should create new across clues and new down clues when toggling Letter to Spacer", () => {
      service.toggleSquareType(80);

      expect(service.puzzle.grid[80]).toEqual(new Square(80, "", -1, -1, -1, SquareType.Spacer));
      expect(service.puzzle.acrossClues[10]).toEqual(new Clue(28, "", "BLAN", [76, 77, 78, 79]));
      expect(service.puzzle.acrossClues[11]).toEqual(new Clue(30, "", "CDS", [81, 82, 83]));
      expect(service.puzzle.downClues[15]).toEqual(new Clue(16, "", "TAL", [17, 38, 59]));
      expect(service.puzzle.downClues[24]).toEqual(new Clue(37, "", "INCIRCLES", [101, 122, 143, 164, 185, 206, 227, 248, 269]));

      expect(service.puzzle.acrossClues.length).toEqual(63);
      expect(service.puzzle.downClues.length).toEqual(81);
    });

    it("should not create new down or across clue when toggling Letter to Spacer", () => {
      service.toggleSquareType(104);

      expect(service.puzzle.grid[104]).toEqual(new Square(104, "", -1, -1, -1, SquareType.Spacer));
      expect(service.puzzle.acrossClues[13]).toEqual(new Clue(35, "", "ARTIST", [98, 99, 100, 101, 102, 103]));
      expect(service.puzzle.downClues[18]).toEqual(new Clue(22, "", "SAS", [41, 62, 83]));

      expect(service.puzzle.acrossClues.length).toEqual(61);
      expect(service.puzzle.downClues.length).toEqual(79);
    });

    it("should remove across clues when toggling Spacer to Letter", () => {
      service.toggleSquareType(29);

      expect(service.puzzle.grid[29]).toEqual(new Square(29, " ", 20, 19, 20));
      expect(service.puzzle.acrossClues[3]).toEqual(
        new Clue(19, "", "IDITAROD ITPRO", [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]),
      );
      expect(service.puzzle.downClues[18]).toEqual(new Clue(20, "", " NOTED", [29, 50, 71, 92, 113, 134]));

      expect(service.puzzle.acrossClues.length).toEqual(59);
      expect(service.puzzle.downClues.length).toEqual(79);
    });

    it("should remove down clue when toggling Spacer to Letter", () => {
      service.toggleSquareType(86);

      expect(service.puzzle.grid[86]).toEqual(new Square(86, " ", 30, 30, 3));
      expect(service.puzzle.acrossClues[11]).toEqual(new Clue(30, "", " AIDE", [86, 87, 88, 89, 90]));
      expect(service.puzzle.downClues[2]).toEqual(new Clue(3, "", "SIRE ESTER", [2, 23, 44, 65, 86, 107, 128, 149, 170, 191]));

      expect(service.puzzle.acrossClues.length).toEqual(61);
      expect(service.puzzle.downClues.length).toEqual(77);
    });
  });

  describe("toggleSquareOverlay", () => {
    it("should add overlay", () => {
      service.toggleSquareOverlay(0, OverlayType.Circle);

      expect(service.puzzle.grid[0]).toEqual(new Square(0, "Y", 1, 1, 1, SquareType.Letter, OverlayType.Circle));
    });

    it("should remove overlay", () => {
      service.toggleSquareOverlay(26, OverlayType.Circle);

      expect(service.puzzle.grid[26]).toEqual(new Square(26, "R", -1, 19, 6, SquareType.Letter, OverlayType.None));
    });
  });

  describe("setClueText", () => {
    it("should set across clue text", () => {
      service.setClueText(ClueType.Across, 1, "TEST");

      expect(service.puzzle.acrossClues[0].text).toEqual("TEST");
    });

    it("should set down clue text", () => {
      service.setClueText(ClueType.Down, 9, "TEST");

      expect(service.puzzle.downClues[8].text).toEqual("TEST");
    });
  });

  describe("setSquareValue", () => {
    it("should set square value to new letter", () => {
      service.setSquareValue(23, "x");

      expect(service.puzzle.grid[23].value).toEqual("X");

      service.activeAcrossClue$.subscribe((clueIndex) => {
        expect(service.puzzle.acrossClues[clueIndex].answer).toEqual("IDXTAROD");
      });

      service.activeDownClue$.subscribe((clueIndex) => {
        expect(service.puzzle.downClues[clueIndex].answer).toEqual("SXRE");
      });
    });

    it("should set square value to space", () => {
      service.setSquareValue(440, " ");

      expect(service.puzzle.grid[440].value).toEqual(" ");

      service.activeAcrossClue$.subscribe((clueIndex) => {
        expect(service.puzzle.acrossClues[clueIndex].answer).toEqual("TOTHEMA ");
      });

      service.activeDownClue$.subscribe((clueIndex) => {
        expect(service.puzzle.downClues[clueIndex].answer).toEqual("SE ");
      });
    });
  });

  describe("getNextIndex", () => {
    it("should select first square to the right when vertical false and skipSpacers false", () => {
      expect(service.getNextIndex(0, false, false)).toBe(1);
      expect(service.getNextIndex(431, false, false)).toBe(432);
    });

    it("should select first number square to the right when vertical false and skipSpacers true", () => {
      expect(service.getNextIndex(66, false, true)).toBe(70);
      expect(service.getNextIndex(370, false, true)).toBe(374);
    });

    it("should select first number square in next row when on right edge, vertical false and skipSpacers true", () => {
      expect(service.getNextIndex(19, false, true)).toBe(21);
      expect(service.getNextIndex(83, false, true)).toBe(87);
    });

    it("should select first square below when vertical true and skipSpacers false", () => {
      expect(service.getNextIndex(24, true, false)).toBe(45);
      expect(service.getNextIndex(390, true, false)).toBe(411);
    });

    it("should select first number square below when vertical true and skipSpacers true", () => {
      expect(service.getNextIndex(65, true, true)).toBe(107);
      expect(service.getNextIndex(5, true, true)).toBe(26);
    });

    it("should select first number square in the current column when on bottom edge, vertical true and skipSpacers true", () => {
      expect(service.getNextIndex(434, true, true)).toBe(77);
      expect(service.getNextIndex(440, true, true)).toBe(41);
    });
  });

  describe("getPrevIndex", () => {
    it("should select first square to the left when vertical false and skipSpacers false", () => {
      expect(service.getPrevIndex(1, false, false)).toBe(0);
      expect(service.getPrevIndex(432, false, false)).toBe(431);
    });

    it("should select first number square to the left when vertical false and skipSpacers true", () => {
      expect(service.getPrevIndex(70, false, true)).toBe(66);
      expect(service.getPrevIndex(374, false, true)).toBe(370);
    });

    it("should select first number square in previous row when on left edge, vertical false and skipSpacers true", () => {
      expect(service.getPrevIndex(21, false, true)).toBe(19);
      expect(service.getPrevIndex(87, false, true)).toBe(83);
    });

    it("should select first square above when vertical true and skipSpacers false", () => {
      expect(service.getPrevIndex(45, true, false)).toBe(24);
      expect(service.getPrevIndex(411, true, false)).toBe(390);
    });

    it("should select first number square above when vertical true and skipSpacers true", () => {
      expect(service.getPrevIndex(107, true, true)).toBe(65);
      expect(service.getPrevIndex(26, true, true)).toBe(5);
    });

    it("should select last number square in the current column when on top edge, vertical true and skipSpacers true", () => {
      expect(service.getPrevIndex(77, true, true)).toBe(434);
      expect(service.getPrevIndex(41, true, true)).toBe(440);
    });
  });

  describe("startsAcross", () => {
    it("should return true when spacer to the left", () => {
      expect(service.startsAcross(9)).toBe(true);
      expect(service.startsAcross(412)).toBe(true);
    });

    it("should return return clue when on left puzzle edge", () => {
      expect(service.startsAcross(105)).toBe(true);
      expect(service.startsAcross(399)).toBe(true);
    });

    it("should return false when spacer", () => {
      expect(service.startsAcross(67)).toBe(false);
      expect(service.startsAcross(356)).toBe(false);
    });

    it("should return false when not across start", () => {
      expect(service.startsAcross(24)).toBe(false);
      expect(service.startsAcross(376)).toBe(false);
    });
  });

  describe("startsDown", () => {
    it("should return true when spacer above", () => {
      expect(service.startsDown(50)).toBe(true);
      expect(service.startsDown(394)).toBe(true);
    });

    it("should return true when on top puzzle edge", () => {
      expect(service.startsDown(4)).toBe(true);
      expect(service.startsDown(19)).toBe(true);
    });

    it("should return false when spacer", () => {
      expect(service.startsDown(317)).toBe(false);
      expect(service.startsDown(420)).toBe(false);
    });

    it("should return false when not down start", () => {
      expect(service.startsDown(158)).toBe(false);
      expect(service.startsDown(433)).toBe(false);
    });
  });

  describe("endsAcross", () => {
    it("should return true when spacer to the right", () => {
      expect(service.endsAcross(7)).toBe(true);
      expect(service.endsAcross(431)).toBe(true);
    });

    it("should return true when on right puzzle edge", () => {
      expect(service.endsAcross(167)).toBe(true);
      expect(service.endsAcross(440)).toBe(true);
    });

    it("should return false when spacer", () => {
      expect(service.endsAcross(63)).toBe(false);
      expect(service.endsAcross(432)).toBe(false);
    });

    it("should return false when not across end", () => {
      expect(service.endsAcross(0)).toBe(false);
      expect(service.endsAcross(416)).toBe(false);
    });
  });

  describe("endsDown", () => {
    it("should return true when spacer below", () => {
      expect(service.endsDown(42)).toBe(true);
      expect(service.endsDown(334)).toBe(true);
    });

    it("should return true when on bottom puzzle edge", () => {
      expect(service.endsDown(421)).toBe(true);
      expect(service.endsDown(439)).toBe(true);
    });

    it("should return false when spacer", () => {
      expect(service.endsDown(63)).toBe(false);
      expect(service.endsDown(432)).toBe(false);
    });

    it("should return false when not down end", () => {
      expect(service.endsDown(3)).toBe(false);
      expect(service.endsDown(389)).toBe(false);
    });
  });

  describe("isPuzzleStart", () => {
    it("should return true when index == 0", () => {
      expect(service.isPuzzleStart(0)).toBe(true);
    });

    it("should return false when index > 0", () => {
      expect(service.isPuzzleStart(1)).toBe(false);
      expect(service.isPuzzleStart(440)).toBe(false);
    });
  });

  describe("isPuzzleEnd", () => {
    it("should return true when index == number of squares", () => {
      expect(service.isPuzzleEnd(440)).toBe(true);
    });

    it("should return false when index < number of squares", () => {
      expect(service.isPuzzleEnd(0)).toBe(false);
      expect(service.isPuzzleEnd(339)).toBe(false);
    });
  });
});

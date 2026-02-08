import { Component, OnInit } from "@angular/core";

import { PuzzleService } from "legacy/src/app/services/puzzle.service";
import { Clue } from "legacy/src/app/models/clue.model";
import { SquareType } from "legacy/src/app/models/puzzle.model";
import { MetricCard, MetricStatus, MetricType } from "legacy/src/app/models/card.model";

interface Metric {
  name: string;
  value: any;
  type: MetricType;
  progress?: number;
  status?: MetricStatus;
}

@Component({
  selector: "app-puzzle-stats",
  templateUrl: "./puzzle-stats.component.html",
  styleUrls: ["./puzzle-stats.component.scss"],
})
export class PuzzleStatsComponent implements OnInit {
  public metrics: Array<Metric> = [];
  public metricCards: Array<MetricCard> = [];

  constructor(private puzzleService: PuzzleService) {}

  ngOnInit(): void {
    if (this.puzzleService.puzzle) {
      this.calcGridMetrics();
      this.calcWordMetrics();

      this.buildMetricCards();
    }
  }

  private calcGridMetrics(): void {
    const puzzle = this.puzzleService.puzzle;
    let symmetrical = true;
    let spacerCount = 0;

    this.calcConnectivity();
    puzzle.grid.forEach((square) => {
      if (square.type == SquareType.Spacer) {
        const reflect = puzzle.grid[this.puzzleService.getReflectIndex(square.index)];
        if (reflect.type != SquareType.Spacer) {
          symmetrical = false;
        }

        spacerCount++;
      }
    });

    const spacerFreq = spacerCount / puzzle.grid.length;

    this.metrics.push({ name: "Symmetrical", value: symmetrical, type: MetricType.Check });
    this.metrics.push({
      name: "White Square Frequency",
      value: 1 - spacerFreq,
      type: MetricType.Percent,
      progress: 1 - spacerFreq,
      status: spacerFreq > 0.5 ? MetricStatus.Danger : spacerFreq > 0.2 ? MetricStatus.Warning : MetricStatus.Success,
    });
  }

  private calcWordMetrics(): void {
    const puzzle = this.puzzleService.puzzle;

    let duplicateCount = 0;
    let wordLengthSum = 0;
    let minWordLength = 100;
    let words: Array<string> = [];

    puzzle.acrossClues.concat(puzzle.downClues).forEach((clue: Clue) => {
      wordLengthSum += clue.squares.length;

      if (clue.answer.trim().length != 0) {
        if (!words.includes(clue.answer)) {
          words.push(clue.answer);
        } else {
          duplicateCount++;
        }
      }

      if (clue.squares.length < minWordLength) {
        minWordLength = clue.answer.length;
      }
    });

    const avgWordLength = wordLengthSum / (puzzle.acrossClues.length + puzzle.downClues.length);
    const puzzleMinDim = Math.min(puzzle.width, puzzle.height);
    const puzzleMaxDim = Math.max(puzzle.width, puzzle.height);

    this.metrics.push({
      name: "No Duplicate Words",
      value: duplicateCount == 0,
      type: MetricType.Check,
    });
    this.metrics.push({
      name: "Minimum Word Length",
      value: minWordLength,
      type: MetricType.Number,
      progress: minWordLength / puzzleMinDim,
      status: minWordLength < 2 ? MetricStatus.Danger : minWordLength < 3 ? MetricStatus.Warning : MetricStatus.Success,
    });
    this.metrics.push({
      name: "Average Word Length",
      value: avgWordLength,
      type: MetricType.Number,
      progress: avgWordLength / puzzleMaxDim,
      status:
        avgWordLength < 0.1 * puzzleMaxDim
          ? MetricStatus.Danger
          : avgWordLength < 0.2 * puzzleMaxDim
            ? MetricStatus.Warning
            : MetricStatus.Success,
    });
  }

  private calcConnectivity(): void {
    const puzzle = this.puzzleService.puzzle;
    const connected = this.connected([this.puzzleService.getFirstLetterIndex()], []);
    const letters = puzzle.grid.filter((s) => s.type == SquareType.Letter);

    this.metrics.push({ name: "Connected", value: connected.length == letters.length, type: MetricType.Check });
  }

  /**
   * Behold a beautiful recursive function! Thanks EECS 281
   * @param indeces indeces to check
   * @param touched connected indeces
   * @returns connected indeces
   */
  private connected(indeces: Array<number>, touched: Array<number>): Array<number> {
    if (indeces.length == 0) {
      return touched;
    } else {
      const puzzle = this.puzzleService.puzzle;

      let acrossSquares = puzzle.acrossClues.find((c) => puzzle.grid[indeces[0]].acrossClueNum == c.num)?.squares || [];
      let downSquares = puzzle.downClues.find((c) => puzzle.grid[indeces[0]].downClueNum == c.num)?.squares || [];
      let allSquares = acrossSquares.concat(downSquares);

      indeces = indeces.concat(allSquares.filter((s) => !indeces.includes(s) && !touched.includes(s)));
      touched = touched.concat(indeces.filter((s) => !touched.includes(s)));

      indeces.shift();

      return this.connected(indeces, touched);
    }
  }

  private buildMetricCards(): void {
    this.metricCards = this.metrics.map((metric: Metric) => {
      return {
        id: metric.name.toLowerCase().split(" ").join("-"),
        title: metric.name,
        metricType: metric.type,
        value: metric.value,
        progress: metric.progress,
        status: metric.status ? metric.status : MetricStatus.None,
      };
    });
  }
}

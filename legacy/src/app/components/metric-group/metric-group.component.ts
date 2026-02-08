import { Component, Input, OnInit } from "@angular/core";

import { MetricCard } from "legacy/src/app/models/card.model";

@Component({
  selector: "app-metric-group",
  templateUrl: "./metric-group.component.html",
  styleUrls: ["./metric-group.component.scss"],
})
export class MetricGroupComponent implements OnInit {
  @Input() cards: Array<MetricCard> = [];

  constructor() {}

  ngOnInit(): void {
    this.cards.sort((a, b) => a.metricType - b.metricType);
  }
}

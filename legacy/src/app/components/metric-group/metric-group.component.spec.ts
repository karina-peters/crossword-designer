import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MetricGroupComponent } from "./metric-group.component";
import { MetricCard, MetricType } from "legacy/src/app/models/card.model";

describe("MetricGroupComponent", () => {
  let component: MetricGroupComponent;
  let fixture: ComponentFixture<MetricGroupComponent>;

  const testCards: Array<MetricCard> = [
    {
      id: "card-1",
      title: "Card 1",
      metricType: MetricType.Check,
      value: true,
    },
    {
      id: "card-2",
      title: "Card 3",
      metricType: MetricType.Number,
      value: 0,
    },
    {
      id: "card-3",
      title: "Card 3",
      metricType: MetricType.Check,
      value: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetricGroupComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricGroupComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should sort cards by metric type", () => {
      component.cards = testCards;
      fixture.detectChanges();

      expect(component.cards[0].id).toEqual("card-1");
      expect(component.cards[1].id).toEqual("card-3");
    });
  });
});

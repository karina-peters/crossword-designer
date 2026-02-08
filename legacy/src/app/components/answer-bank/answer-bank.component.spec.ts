import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnswerBankComponent } from "./answer-bank.component";

describe("AnswerBankComponent", () => {
  let component: AnswerBankComponent;
  let fixture: ComponentFixture<AnswerBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnswerBankComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PuzzleEditingComponent } from "./views/puzzle-editing/puzzle-editing.component";
import { ClueEditingComponent } from "./views/clue-editing/clue-editing.component";
import { PuzzleReviewComponent } from "./views/puzzle-review/puzzle-review.component";
import { LoadPuzzleComponent } from "./views/load-puzzle/load-puzzle.component";
import { AnswerDraftingComponent } from "./views/answer-drafting/answer-drafting.component";
import { PuzzleStatsComponent } from "./views/puzzle-stats/puzzle-stats.component";
import { SignInComponent } from "./views/sign-in/sign-in.component";

const routes: Routes = [
  { path: "", component: SignInComponent },
  { path: "load", component: LoadPuzzleComponent },
  { path: "answers", component: AnswerDraftingComponent },
  { path: "puzzle", component: PuzzleEditingComponent },
  { path: "clues", component: ClueEditingComponent },
  { path: "review", component: PuzzleReviewComponent },
  { path: "stats", component: PuzzleStatsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

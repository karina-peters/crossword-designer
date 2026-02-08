import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from "@angular/fire/analytics";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { provideAuth, getAuth } from "@angular/fire/auth";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";
import { provideFunctions, getFunctions } from "@angular/fire/functions";
import { provideStorage, getStorage } from "@angular/fire/storage";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AngularSvgIconModule } from "angular-svg-icon";

import { AnswerDraftingComponent } from "./views/answer-drafting/answer-drafting.component";
import { ClueEditingComponent } from "./views/clue-editing/clue-editing.component";
import { LoadPuzzleComponent } from "./views/load-puzzle/load-puzzle.component";
import { PuzzleEditingComponent } from "./views/puzzle-editing/puzzle-editing.component";
import { PuzzleReviewComponent } from "./views/puzzle-review/puzzle-review.component";
import { PuzzleStatsComponent } from "./views/puzzle-stats/puzzle-stats.component";
import { SignInComponent } from "./views/sign-in/sign-in.component";

import { GridComponent } from "./components/grid/grid.component";
import { MetricGroupComponent } from "./components/metric-group/metric-group.component";
import { PuzzleGroupComponent } from "./components/puzzle-group/puzzle-group.component";
import { SelectedClueComponent } from "./components/selected-clue/selected-clue.component";
import { SidebarNavComponent } from "./components/sidebar-nav/sidebar-nav.component";

import { environment } from "../environments/environment";
import { ToolbarComponent } from "./components/toolbar/toolbar.component";
import { AnswerBankComponent } from './components/answer-bank/answer-bank.component';

@NgModule({
  declarations: [
    AppComponent,
    PuzzleEditingComponent,
    SelectedClueComponent,
    ClueEditingComponent,
    SidebarNavComponent,
    PuzzleReviewComponent,
    LoadPuzzleComponent,
    AnswerDraftingComponent,
    GridComponent,
    PuzzleStatsComponent,
    MetricGroupComponent,
    SignInComponent,
    PuzzleGroupComponent,
    ToolbarComponent,
    AnswerBankComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularSvgIconModule.forRoot(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideStorage(() => getStorage()),
  ],
  providers: [ScreenTrackingService, UserTrackingService],
  bootstrap: [AppComponent],
})
export class AppModule {}

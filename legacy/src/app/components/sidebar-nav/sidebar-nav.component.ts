import { Component, ElementRef, OnInit, QueryList, ViewChildren } from "@angular/core";

import { Router } from "@angular/router";

import { LoadService } from "legacy/src/app/services/load.service";
import { AuthService } from "legacy/src/app/services/auth.service";

import { PuzzleMetadata } from "legacy/src/app/models/puzzle.model";

@Component({
  selector: "app-sidebar-nav",
  templateUrl: "./sidebar-nav.component.html",
  styleUrls: ["./sidebar-nav.component.scss"],
})
export class SidebarNavComponent implements OnInit {
  @ViewChildren("pageLink") pageLinks!: QueryList<ElementRef>;
  @ViewChildren("userButton") userButtons!: QueryList<ElementRef>;

  public puzzleLoaded: boolean = false;
  public pages: Array<any> = [];
  public buttons: Array<any> = [];

  private routes: Array<string> = ["/load", "/answers", "/puzzle", "/clues", "/review", "/stats"];

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadService: LoadService,
  ) {
    this.pages = [
      {
        index: 0,
        route: this.routes[0],
        title: "Load or Create Puzzle",
        icon: "house",
      },
      {
        index: 1,
        route: this.routes[1],
        title: "Brainstorm Answers",
        icon: "notebook",
      },
      {
        index: 2,
        route: this.routes[2],
        title: "Edit Puzzle",
        icon: `grid-empty`,
      },
      {
        index: 3,
        route: this.routes[3],
        title: "Edit Clues",
        icon: "numbered-list",
      },
      {
        index: 4,
        route: this.routes[4],
        title: "Review Puzzle",
        icon: "clipboard-check",
      },
      {
        index: 5,
        route: this.routes[5],
        title: "View Puzzle Statistics",
        icon: "bar-chart",
      },
    ];

    this.buttons = [
      {
        index: 0,
        action: this.onSettings,
        title: "Settings",
        icon: "gear",
      },
      {
        index: 1,
        action: this.onSignOut,
        title: "Sign Out",
        icon: "sign-out",
      },
    ];
  }

  ngOnInit(): void {
    this.router.navigateByUrl(this.routes[0]);

    this.loadService.activePuzzle$.subscribe((metadata: PuzzleMetadata) => {
      this.puzzleLoaded = metadata?.id ? true : false;
    });
  }

  public onSettings = () => {
    // TODO
  };

  public onSignOut = () => {
    this.authService.signOut().subscribe(
      () => {},
      (error: ErrorEvent) => {
        alert("Failed to sign out: " + error.message);
      },
    );
  };
}

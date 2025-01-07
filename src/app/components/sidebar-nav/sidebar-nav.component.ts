import { Component, OnInit } from "@angular/core";

import { Router } from "@angular/router";

import { LoadService } from "src/app/services/load.service";
import { AuthService } from "src/app/services/auth.service";

import { PuzzleMetadata } from "src/app/models/puzzle.model";

@Component({
  selector: "app-sidebar-nav",
  templateUrl: "./sidebar-nav.component.html",
  styleUrls: ["./sidebar-nav.component.scss"],
})
export class SidebarNavComponent implements OnInit {
  public puzzleLoaded: boolean = false;
  public pages: Array<any> = [];
  public buttons: Array<any> = [];

  constructor(private router: Router, private authService: AuthService, private loadService: LoadService) {
    this.pages = [
      {
        index: 0,
        route: "/load",
        title: "Load or Create Puzzle",
        icon: "house",
      },
      {
        index: 1,
        route: "/answers",
        title: "Brainstorm Answers",
        icon: "notebook",
      },
      {
        index: 2,
        route: "/puzzle",
        title: "Edit Puzzle",
        icon: `grid-empty`,
      },
      {
        index: 3,
        route: "/clues",
        title: "Edit Clues",
        icon: "numbered-list",
      },
      {
        index: 4,
        route: "/review",
        title: "Review Puzzle",
        icon: "clipboard-check",
      },
      {
        index: 5,
        route: "/stats",
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
    this.router.navigateByUrl(this.pages[0].route);

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
      }
    );
  };
}

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { SvgIconRegistryService } from "angular-svg-icon";
import { Icon, icons } from "../assets/icons";

import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  public title = "crossword-designer";
  public signedIn = false;

  constructor(private router: Router, private iconRegistryService: SvgIconRegistryService, private authService: AuthService) {}

  ngOnInit(): void {
    // Register custom icons
    icons.forEach((icon: Icon) => {
      this.iconRegistryService.addSvg(icon.name, icon.path);
    });

    this.authService.currentUserId$.subscribe((userId: string | undefined) => {
      this.signedIn = userId != undefined;

      // Re-route to sign-in page if user not signed in
      this.router.navigateByUrl("/");
    });
  }
}

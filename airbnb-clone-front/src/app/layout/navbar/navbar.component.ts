import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { DialogService } from "primeng/dynamicdialog";
import { MenuModule } from "primeng/menu";
import { ToolbarModule } from "primeng/toolbar";
import { AvatarComponent } from './avatar/avatar.component';
import { CategoryComponent } from './category/category.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    ButtonModule,
    FontAwesomeModule,
    ToolbarModule,
    MenuModule,
    CategoryComponent,
    AvatarComponent
  ],
  providers: [DialogService],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
openNewSearch() {
throw new Error('Method not implemented.');
}
openNewListing() {
throw new Error('Method not implemented.');
}

  location = "Anywhere";
  guests = "Add guests";
  dates = "Any week";
  currentMenuItems: MenuItem[] | undefined = [];

  ngOnInit(): void {
    this.fetchMenu();
  }

  private fetchMenu(): MenuItem[] {
    return [
      {
        label: "Sign up",
        styleClass: "font-bold",
      },
      {
        label: "Log in",
      }
    ]
  }

  //login = () => this.authService.login();

  //logout = () => this.authService.logout();
}

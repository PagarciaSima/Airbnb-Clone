import { Component, effect, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { MenuModule } from "primeng/menu";
import { ToolbarModule } from "primeng/toolbar";
import { AvatarComponent } from './avatar/avatar.component';
import { CategoryComponent } from './category/category.component';
import { MenuItem } from 'primeng/api';
import { ToastService } from '../toast.service';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/model/user.model';
import { PropertiesCreateComponent } from '../../landlord/properties-create/properties-create.component';

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

  toastService = inject(ToastService);
  authService = inject(AuthService);
  dialogService = inject(DialogService);

  location = "Anywhere";
  guests = "Add guests";
  dates = "Any week";
  currentMenuItems: MenuItem[] | undefined = [];
  connectedUser: User = { email: this.authService.notConnected };
  ref: DynamicDialogRef | undefined;

  constructor() {
    effect(() => {
      if (this.authService.fetchUser().status === "OK") {
        this.connectedUser = this.authService.fetchUser().value!;
        this.currentMenuItems = this.fetchMenu();
      }
    });
  }

  ngOnInit(): void {
    this.authService.fetch(false);
  }

  private fetchMenu(): MenuItem[] {
    if (this.authService.isAuthenticated()) {
      return [
        {
          label: "My properties",
          routerLink: "landlord/properties",
          visible: this.hasToBeLandlord(),
        },
        {
          label: "My booking",
          routerLink: "booking",
        },
        {
          label: "My reservation",
          routerLink: "landlord/reservation",
          visible: this.hasToBeLandlord(),
        },
        {
          label: "Log out",
          command: this.logout
        },
      ]
    } else {
      return [
        {
          label: "Sign up",
          styleClass: "font-bold",
          command: this.login
        },
        {
          label: "Log in",
          command: this.login
        }
      ];
    }
  }

  hasToBeLandlord(): boolean {
    return this.authService.hasAnyAuthority("ROLE_LANDLORD");
  }

  openNewSearch() {
    throw new Error('Method not implemented.');
  }
  
  openNewListing(): void {
    this.ref = this.dialogService.open(PropertiesCreateComponent,
      {
        width: "60%",
        header: "Airbnb your home",
        closable: true,
        focusOnShow: true,
        modal: true,
        showHeader: true
      })
  }

  login = () => this.authService.login();

  logout = () => this.authService.logout();
}

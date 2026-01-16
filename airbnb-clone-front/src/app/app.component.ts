import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { fontAwesomeIcons } from './shared/font-awesome-icons';
import { NavbarComponent } from "./layout/navbar/navbar.component";
import { FooterComponent } from "./layout/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, FontAwesomeModule, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  
  faIconLibrary: FaIconLibrary = inject(FaIconLibrary);

  ngOnInit(): void {
    this.initFontAwesomeIcons();
  }

  initFontAwesomeIcons() {
    this.faIconLibrary.addIcons(...fontAwesomeIcons);
  }
}

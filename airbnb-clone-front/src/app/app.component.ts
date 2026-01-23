import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from "primeng/toast";
import { FooterComponent } from "./layout/footer/footer.component";
import { NavbarComponent } from "./layout/navbar/navbar.component";
import { fontAwesomeIcons } from './shared/font-awesome-icons';
import { ToastService } from './layout/toast.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, FontAwesomeModule, NavbarComponent, FooterComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  
  faIconLibrary: FaIconLibrary = inject(FaIconLibrary);
  isListingView: boolean = true;
  toastService = inject(ToastService);
  messageService = inject(MessageService);

  ngOnInit(): void {
    this.initFontAwesomeIcons();
    this.listenToastService();
  }

  initFontAwesomeIcons() {
    this.faIconLibrary.addIcons(...fontAwesomeIcons);
  }

  private listenToastService(): void {
    this.toastService.sendSub.subscribe({
      next: (newMessagge) => {
        if (newMessagge && newMessagge.summary != this.toastService.INIT_STATE) {
          this.messageService.add(newMessagge);
        }
      }
    });
  }
}

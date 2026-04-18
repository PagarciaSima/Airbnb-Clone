import { Location } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams, HttpStatusCode } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { State } from '../model/state.model';
import { User } from '../model/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  http: HttpClient = inject(HttpClient);
  location: Location = inject(Location);
  notConnected: string = 'NOT_CONNECTED';
  private fetchUser$: WritableSignal<State<User>> = signal<State<User>>(State.Builder<User>().forSuccess(
    {
      email: this.notConnected
    }
  ));

  fetchUser: Signal<State<User, HttpErrorResponse>> = computed((): State<User, HttpErrorResponse> => this.fetchUser$());

  /**
   * Fetches the authenticated user from the backend and updates the fetchUser$ signal.
   * @param forceResync Whether to force resynchronization with the backend.
   */
  fetch(forceResync: boolean): void {
    this.fetchHttpUser(forceResync)
      .subscribe({
        next: user => this.fetchUser$.set(State.Builder<User>().forSuccess(user)),
        error: err => {
          if (err.status === HttpStatusCode.Unauthorized && this.isAuthenticated()) {
            this.fetchUser$.set(State.Builder<User>().forSuccess({ email: this.notConnected }));
          } else {
            this.fetchUser$.set(State.Builder<User>().forError(err));
          }
        }
      })
  }

  /**
   * Checks if the user is authenticated.
   * @returns True if the user is authenticated, false otherwise.
   */
  isAuthenticated(): boolean {
    if (this.fetchUser$().value) {
      return this.fetchUser$().value!.email !== this.notConnected;
    } else {
      return false;
    }
  }

  /**
   * Makes an HTTP request to fetch the authenticated user from the backend.
   * @param forceResync Whether to force resynchronization with the backend.
   * @returns An Observable emitting the authenticated user.
   */
  fetchHttpUser(forceResync: boolean): Observable<User> {
    const params = new HttpParams().set('forceResync', forceResync);
    return this.http.get<User>(`${environment.API_URL}/auth/get-authenticated-user`, { params })
  }

  /**
   * Checks if the authenticated user has any of the specified authorities.
   * @param authorities The authority or list of authorities to check.
   * @returns True if the user has any of the specified authorities, false otherwise.
   */
  hasAnyAuthority(authorities: string[] | string): boolean {
    if (this.fetchUser$().value!.email === this.notConnected) {
      return false;
    }
    if (!Array.isArray(authorities)) {
      authorities = [authorities];
    }
    return this.fetchUser$().value!.authorities!
      .some((authority: string) => authorities.includes(authority));
  }

  /**
   * Redirects the user to the OAuth2 login page.
   */
  login(): void {
    location.href = `${location.origin}${this.location.prepareExternalUrl("oauth2/authorization/okta")}`;
  }

  /**
   * Logs out the user by calling the backend and redirects to the logout URL.
   */
  logout(): void {
    this.http.post(`${environment.API_URL}/auth/logout`, {})
      .subscribe({
        next: (response: any) => {
          this.fetchUser$.set(
            State.Builder<User>().forSuccess({ email: this.notConnected }));
            location.href = response.logoutUrl
        }
      })
  }
}

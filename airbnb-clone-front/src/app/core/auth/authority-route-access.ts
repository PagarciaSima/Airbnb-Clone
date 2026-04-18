import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from "@angular/router";
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";
import {map} from "rxjs";
/**
 * Route guard that checks if the authenticated user has the required authorities to access a route.
 * If the user is not authenticated, redirects to the login page.
 * @param route The activated route snapshot containing route data and parameters.
 * @returns An Observable emitting true if access is granted, false otherwise.
 */
export const authorityRouteAccess: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const requiredAuthorities = route.data['authorities'];

  return authService.fetchHttpUser(false).pipe(
    map(user => {
      if (!user) {
        authService.login();
        return false;
      }
      const noRequiredAuthorities = !requiredAuthorities || requiredAuthorities.length === 0;
      return noRequiredAuthorities || authService.hasAnyAuthority(requiredAuthorities);
    })
  );
};
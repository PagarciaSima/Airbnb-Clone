import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from "@angular/router";
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";
import {map} from "rxjs";

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
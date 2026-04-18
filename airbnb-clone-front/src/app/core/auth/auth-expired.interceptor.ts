import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { tap } from "rxjs";
import { AuthService } from "./auth.service";
/**
 * HTTP interceptor that handles expired authentication tokens.
 * If a 401 Unauthorized error is received and the user is authenticated,
 * redirects the user to the login page.
 * @param req The outgoing HTTP request.
 * @param next The next HTTP handler in the chain.
 * @returns An Observable of the HTTP event stream.
 */
export const authExpired: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  return next(req).pipe(
    tap({
        error: (err: HttpErrorResponse) => {
        // Expired authentication token
        if(err.status === 401 && err.url && !err.url.includes("api/auth") && authService.isAuthenticated()) {
          authService.login();
        }
      }
    })
  )
}
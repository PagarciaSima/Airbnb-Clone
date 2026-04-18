package com.airbnb.airbn_clone_back.user.presentation;

import java.text.MessageFormat;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.airbnb.airbn_clone_back.user.application.UserService;
import com.airbnb.airbn_clone_back.user.application.dto.ReadUserDTO;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Authentication operations and current user")
public class AuthResource {

    private final UserService userService;

    private final ClientRegistration registration;

    /**
     * Constructs an AuthResource with the required dependencies.
     *
     * @param userService the user service
     * @param registration the client registration repository
     */
    public AuthResource(UserService userService, ClientRegistrationRepository registration) {
        this.userService = userService;
        this.registration = registration.findByRegistrationId("okta");
    }


    /**
     * Retrieves the authenticated user, optionally forcing a resynchronization with the IdP.
     *
     * @param user the authenticated OAuth2User
     * @param forceResync whether to force resynchronization with the IdP
     * @return ResponseEntity with the ReadUserDTO or an error status
     */
    @Operation(
        summary = "Get authenticated user",
        description = "Retrieves the currently authenticated user. Can force resynchronization with the IdP.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Authenticated user successfully retrieved",
                content = @Content(schema = @Schema(implementation = ReadUserDTO.class))
            ),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    @GetMapping("/get-authenticated-user")
    public ResponseEntity<ReadUserDTO> getAuthenticatedUser(
            @Parameter(description = "Authenticated OAuth2 user", hidden = true)
            @AuthenticationPrincipal OAuth2User user,
            @Parameter(description = "Force resynchronization with IdP")
            @RequestParam boolean forceResync) {
        if(user == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
            userService.syncWithIdp(user, forceResync);
            ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
            return new ResponseEntity<>(connectedUser, HttpStatus.OK);
        }
    }


    /**
     * Logs out the current user and returns the logout URL for the IdP.
     *
     * @param request the HTTP servlet request
     * @return ResponseEntity with a map containing the logout URL
     */
    @Operation(
        summary = "Logout",
        description = "Logs out the current user and returns the IdP logout URL.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Logout successful, URL returned",
                content = @Content(schema = @Schema(implementation = Map.class))
            )
        }
    )
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @Parameter(description = "Current HTTP request", hidden = true)
            HttpServletRequest request) {
        String issuerUri = registration.getProviderDetails().getIssuerUri();
        String originUrl = request.getHeader(HttpHeaders.ORIGIN);
        Object[] params = {issuerUri, registration.getClientId(), originUrl};
        String logoutUrl = MessageFormat.format("{0}v2/logout?client_id={1}&returnTo={2}", params);
        request.getSession().invalidate();
        return ResponseEntity.ok().body(Map.of("logoutUrl", logoutUrl));
    }
}
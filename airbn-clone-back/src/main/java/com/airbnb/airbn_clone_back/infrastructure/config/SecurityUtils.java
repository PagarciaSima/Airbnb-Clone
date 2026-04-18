package com.airbnb.airbn_clone_back.infrastructure.config;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import com.airbnb.airbn_clone_back.user.domain.Authority;
import com.airbnb.airbn_clone_back.user.domain.User;

/**
 * Utility class for security-related operations, such as mapping OAuth2 attributes,
 * extracting authorities, and checking user roles.
 */
public class SecurityUtils {

    /**
     * Constant for the tenant role authority.
     */
    public static final String ROLE_TENANT = "ROLE_TENANT";

    /**
     * Constant for the landlord role authority.
     */
    public static final String ROLE_LANDLORD = "ROLE_LANDLORD";

    /**
     * Namespace for extracting roles from claims.
     */
    public static final String CLAIMS_NAMESPACE = "https://www.codecake.fr/roles";

    /**
     * Maps OAuth2 attributes to a User domain object.
     *
     * @param attributes the OAuth2 attributes map
     * @return a User object populated with the attribute values
     */
    @SuppressWarnings("unchecked")
    public static User mapOauth2AttributesToUser(Map<String, Object> attributes) {
        User user = new User();
        String sub = String.valueOf(attributes.get("sub"));

        String username = null;

        if (attributes.get("preferred_username") != null) {
            username = ((String) attributes.get("preferred_username")).toLowerCase();
        }

        if (attributes.get("given_name") != null) {
            user.setFirstName(((String) attributes.get("given_name")));
        } else if ((attributes.get("nickname") != null)) {
            user.setFirstName(((String) attributes.get("nickname")));
        }

        if (attributes.get("family_name") != null) {
            user.setLastName(((String) attributes.get("family_name")));
        }

        if (attributes.get("email") != null) {
            user.setEmail(((String) attributes.get("email")));
        } else if (sub.contains("|") && (username != null && username.contains("@"))) {
            user.setEmail(username);
        } else {
            user.setEmail(sub);
        }

        if (attributes.get("picture") != null) {
            user.setImageUrl(((String) attributes.get("picture")));
        }

        if(attributes.get(CLAIMS_NAMESPACE) != null) {
            List<String> authoritiesRaw = (List<String>) attributes.get(CLAIMS_NAMESPACE);
            Set<Authority> authorities = authoritiesRaw.stream()
                    .map(authority -> {
                        Authority auth = new Authority();
                        auth.setName(authority);
                        return auth;
                    }).collect(Collectors.toSet());
            user.setAuthorities(authorities);
        }
        return user;
    }

    /**
     * Extracts granted authorities from a claims map.
     *
     * @param claims the claims map
     * @return a list of SimpleGrantedAuthority objects
     */
    public static List<SimpleGrantedAuthority> extractAuthorityFromClaims(Map<String, Object> claims) {
        return mapRolesToGrantedAuthorities(getRolesFromClaims(claims));
    }

    /**
     * Retrieves the roles from the claims map using the configured namespace.
     *
     * @param claims the claims map
     * @return a collection of role strings, or an empty list if none found
     */
    @SuppressWarnings("unchecked")
    private static Collection<String> getRolesFromClaims(Map<String, Object> claims) {
        Object rolesObj = claims.get(CLAIMS_NAMESPACE);
        if (rolesObj == null) {
            return List.of();
        }
        return (List<String>) rolesObj;
    }

    /**
     * Maps a collection of role strings to a list of SimpleGrantedAuthority objects.
     *
     * @param roles the collection of role strings
     * @return a list of SimpleGrantedAuthority objects, or an empty list if roles is null or empty
     */
    private static List<SimpleGrantedAuthority> mapRolesToGrantedAuthorities(Collection<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }
        return roles.stream()
            .filter(role -> role.startsWith("ROLE_"))
            .map(SimpleGrantedAuthority::new)
            .toList();
    }

    /**
     * Checks if the current authenticated user has any of the specified authorities.
     *
     * @param authorities the authorities to check
     * @return true if the user has any of the specified authorities, false otherwise
     */
    public static boolean hasCurrentUserAnyOfAuthorities(String ...authorities) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (authentication != null && getAuthorities(authentication)
                .anyMatch(authority -> Arrays.asList(authorities).contains(authority)));
    }

    /**
     * Retrieves the authorities from the given Authentication object as a stream of strings.
     *
     * @param authentication the Authentication object
     * @return a stream of authority strings
     */
    private static Stream<String> getAuthorities(Authentication authentication) {
        Collection<? extends GrantedAuthority> authorities = authentication
                instanceof JwtAuthenticationToken jwtAuthenticationToken ?
                extractAuthorityFromClaims(jwtAuthenticationToken.getToken().getClaims()) : authentication.getAuthorities();
        return authorities.stream().map(GrantedAuthority::getAuthority);
    }
}
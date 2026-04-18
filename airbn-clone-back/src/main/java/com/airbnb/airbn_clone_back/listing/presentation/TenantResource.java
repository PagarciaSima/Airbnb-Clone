package com.airbnb.airbn_clone_back.listing.presentation;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.airbnb.airbn_clone_back.listing.application.TenantService;
import com.airbnb.airbn_clone_back.listing.application.dto.DisplayCardListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.DisplayListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.SearchDTO;
import com.airbnb.airbn_clone_back.listing.domain.BookingCategory;
import com.airbnb.airbn_clone_back.sharedkernel.service.State;
import com.airbnb.airbn_clone_back.sharedkernel.service.StatusNotification;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tenant-listing")
@Tag(name = "Tenant Listing", description = "Operations for tenants on property listings")
public class TenantResource {

    private final TenantService tenantService;


    /**
     * Constructs a TenantResource with the required TenantService dependency.
     *
     * @param tenantService the tenant service
     */
    public TenantResource(TenantService tenantService) {
        this.tenantService = tenantService;
    }


    /**
     * Retrieves all listings by booking category with pagination.
     *
     * @param pageable the pagination information
     * @param category the booking category to filter by
     * @return ResponseEntity with a page of DisplayCardListingDTOs
     */
    @Operation(
        summary = "Get all listings by category",
        description = "Retrieves all listings filtered by booking category, with pagination.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Page of listings successfully retrieved",
                content = @Content(schema = @Schema(implementation = Page.class))
            )
        }
    )
    @GetMapping("/get-all-by-category")
    public ResponseEntity<Page<DisplayCardListingDTO>> findAllByBookingCategory(
            @Parameter(description = "Pagination information", hidden = true) Pageable pageable,
            @Parameter(description = "Booking category to filter by") @RequestParam BookingCategory category) {
        return ResponseEntity.ok(tenantService.getAllByCategory(pageable, category));
    }


    /**
     * Retrieves a single listing by its public ID.
     *
     * @param publicId the UUID of the listing
     * @return ResponseEntity with the DisplayListingDTO or an error
     */
    @Operation(
        summary = "Get a listing by public ID",
        description = "Retrieves a specific listing using its public UUID.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Listing successfully retrieved",
                content = @Content(schema = @Schema(implementation = DisplayListingDTO.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request or listing not found")
        }
    )
    @GetMapping("/get-one")
    public ResponseEntity<DisplayListingDTO> getOne(
            @Parameter(description = "Public UUID of the listing") @RequestParam UUID publicId) {
        State<DisplayListingDTO, String> displayListingState = tenantService.getOne(publicId);
        if (displayListingState.getStatus().equals(StatusNotification.OK)) {
            return ResponseEntity.ok(displayListingState.getValue());
        } else {
            ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, displayListingState.getError());
            return ResponseEntity.of(problemDetail).build();
        }
    }


    /**
     * Searches for listings matching the given search criteria and returns available listings with pagination.
     *
     * @param pageable the pagination information
     * @param searchDTO the search criteria
     * @return ResponseEntity with a page of available DisplayCardListingDTOs
     */
    @Operation(
        summary = "Search available listings",
        description = "Searches for listings matching the search criteria and returns available listings with pagination.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Page of available listings",
                content = @Content(schema = @Schema(implementation = Page.class))
            )
        }
    )
    @PostMapping("/search")
    public ResponseEntity<Page<DisplayCardListingDTO>> search(
            @Parameter(description = "Pagination information", hidden = true) Pageable pageable,
            @Parameter(description = "Search criteria") @Valid @RequestBody SearchDTO searchDTO) {
        return ResponseEntity.ok(tenantService.search(pageable, searchDTO));
    }
}
package com.airbnb.airbn_clone_back.booking.presentation;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
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

import com.airbnb.airbn_clone_back.booking.application.BookingService;
import com.airbnb.airbn_clone_back.booking.application.dto.BookedDateDTO;
import com.airbnb.airbn_clone_back.booking.application.dto.BookedListingDTO;
import com.airbnb.airbn_clone_back.booking.application.dto.NewBookingDTO;
import com.airbnb.airbn_clone_back.infrastructure.config.SecurityUtils;
import com.airbnb.airbn_clone_back.sharedkernel.service.State;
import com.airbnb.airbn_clone_back.sharedkernel.service.StatusNotification;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/booking")
@Tag(name = "Booking", description = "Operations for booking management")
public class BookingResource {

	private final BookingService bookingService;

	public BookingResource(BookingService bookingService) {
		this.bookingService = bookingService;
	}

	/**
	 * Creates a new booking from the provided data.
	 *
	 * @param newBookingDTO DTO with the new booking information
	 * @return ResponseEntity with true if the booking was created successfully, or an error otherwise
	 */
	@Operation(
		summary = "Create a new booking",
		description = "Creates a new booking from the provided data.",
		responses = {
			@ApiResponse(
				responseCode = "200",
				description = "Booking created successfully",
				content = @Content(schema = @Schema(implementation = Boolean.class))
			),
			@ApiResponse(responseCode = "400", description = "Validation error or bad request")
		}
	)
	@PostMapping("create")
	public ResponseEntity<Boolean> create(
			@Parameter(description = "DTO with the new booking information") @Valid @RequestBody NewBookingDTO newBookingDTO) {
		State<Void, String> createState = bookingService.create(newBookingDTO);
		if (createState.getStatus().equals(StatusNotification.ERROR)) {
			ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
					createState.getError());
			return ResponseEntity.of(problemDetail).build();
		} else {
			return ResponseEntity.ok(true);
		}
	}

	/**
	 * Checks the date availability for a specific listing.
	 *
	 * @param listingPublicId UUID of the listing to check
	 * @return ResponseEntity with the list of booked dates
	 */
	@Operation(
		summary = "Check listing date availability",
		description = "Checks the date availability for a specific listing.",
		responses = {
			@ApiResponse(
				responseCode = "200",
				description = "List of booked dates",
				content = @Content(schema = @Schema(implementation = BookedDateDTO.class))
			)
		}
	)
	@GetMapping("check-availability")
	public ResponseEntity<List<BookedDateDTO>> checkAvailability(
			@Parameter(description = "UUID of the listing to check") @RequestParam UUID listingPublicId) {
		return ResponseEntity.ok(bookingService.checkAvailability(listingPublicId));
	}

	/**
	 * Gets the list of bookings made by the current user.
	 *
	 * @return ResponseEntity with the list of bookings
	 */
	@Operation(
		summary = "Get bookings for current user",
		description = "Gets the list of bookings made by the current user.",
		responses = {
			@ApiResponse(
				responseCode = "200",
				description = "List of bookings",
				content = @Content(schema = @Schema(implementation = BookedListingDTO.class))
			)
		}
	)
	@GetMapping("get-booked-listing")
	public ResponseEntity<List<BookedListingDTO>> getBookedListing() {
		return ResponseEntity.ok(bookingService.getBookedListing());
	}

	/**
	 * Cancels a specific booking.
	 *
	 * @param bookingPublicId UUID of the booking to cancel
	 * @param listingPublicId UUID of the associated listing
	 * @param byLandlord indicates if the cancellation is performed by the landlord
	 * @return ResponseEntity with the UUID of the cancelled booking or an error
	 */
	@Operation(
		summary = "Cancel a booking",
		description = "Cancels a specific booking.",
		responses = {
			@ApiResponse(
				responseCode = "200",
				description = "Booking cancelled successfully, returns the UUID",
				content = @Content(schema = @Schema(implementation = UUID.class))
			),
			@ApiResponse(responseCode = "400", description = "Bad request or error")
		}
	)
	@DeleteMapping("cancel")
	public ResponseEntity<UUID> cancel(
			@Parameter(description = "UUID of the booking to cancel") @RequestParam UUID bookingPublicId,
			@Parameter(description = "UUID of the associated listing") @RequestParam UUID listingPublicId,
			@Parameter(description = "Indicates if the cancellation is performed by the landlord") @RequestParam boolean byLandlord) {
		State<UUID, String> cancelState = bookingService.cancel(bookingPublicId, listingPublicId, byLandlord);
		if (cancelState.getStatus().equals(StatusNotification.ERROR)) {
			ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
					cancelState.getError());
			return ResponseEntity.of(problemDetail).build();
		} else {
			return ResponseEntity.ok(bookingPublicId);
		}
	}

	/**
	 * Gets the list of bookings for the authenticated landlord.
	 *
	 * @return ResponseEntity with the list of bookings for the landlord
	 */
	@Operation(
		summary = "Get bookings for landlord",
		description = "Gets the list of bookings for the authenticated landlord.",
		responses = {
			@ApiResponse(
				responseCode = "200",
				description = "List of bookings for landlord",
				content = @Content(schema = @Schema(implementation = BookedListingDTO.class))
			)
		}
	)
	@GetMapping("get-booked-listing-for-landlord")
	@PreAuthorize("hasAnyRole('" + SecurityUtils.ROLE_LANDLORD + "')")
	public ResponseEntity<List<BookedListingDTO>> getBookedListingForLandlord() {
		return ResponseEntity.ok(bookingService.getBookedListingForLandlord());
	}
}

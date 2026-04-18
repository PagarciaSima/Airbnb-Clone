package com.airbnb.airbn_clone_back.listing.presentation;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.airbnb.airbn_clone_back.infrastructure.config.SecurityUtils;
import com.airbnb.airbn_clone_back.listing.LandlordService;
import com.airbnb.airbn_clone_back.listing.application.dto.CreatedListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.DisplayCardListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.SaveListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.sub.PictureDTO;
import com.airbnb.airbn_clone_back.sharedkernel.service.State;
import com.airbnb.airbn_clone_back.sharedkernel.service.StatusNotification;
import com.airbnb.airbn_clone_back.user.application.UserException;
import com.airbnb.airbn_clone_back.user.application.UserService;
import com.airbnb.airbn_clone_back.user.application.dto.ReadUserDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@RestController
@RequestMapping("/api/landlord-listing")
public class LandlordResource {

	private final LandlordService landlordService;

	private final Validator validator;

	private final UserService userService;

	private ObjectMapper objectMapper = new ObjectMapper();

	/**
     * Constructs a LandlordResource with the required dependencies.
     *
     * @param landlordService the landlord service
     * @param validator the validator for DTOs
     * @param userService the user service
     */
	public LandlordResource(LandlordService landlordService, Validator validator, UserService userService) {
		this.landlordService = landlordService;
		this.validator = validator;
		this.userService = userService;
	}

	/**
     * Creates a new listing for the landlord from a multipart form request.
     *
     * @param request the multipart HTTP request containing images
     * @param saveListingDTOString the JSON string for the SaveListingDTO
     * @return ResponseEntity with the created listing or validation errors
     * @throws IOException if an error occurs while reading the files
     */
	@PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<CreatedListingDTO> create(MultipartHttpServletRequest request,
			@RequestPart(name = "dto") String saveListingDTOString) throws IOException {
		List<PictureDTO> pictures = request.getFileMap().values().stream().map(mapMultipartFileToPictureDTO()).toList();

		SaveListingDTO saveListingDTO = objectMapper.readValue(saveListingDTOString, SaveListingDTO.class);
		saveListingDTO.setPictures(pictures);

		Set<ConstraintViolation<SaveListingDTO>> violations = validator.validate(saveListingDTO);
		if (!violations.isEmpty()) {
			String violationsJoined = violations.stream()
					.map(violation -> violation.getPropertyPath() + " " + violation.getMessage())
					.collect(Collectors.joining());

			ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, violationsJoined);
			return ResponseEntity.of(problemDetail).build();
		} else {
			return ResponseEntity.ok(landlordService.create(saveListingDTO));
		}
	}

	private static Function<MultipartFile, PictureDTO> mapMultipartFileToPictureDTO() {
		return multipartFile -> {
			try {
				return new PictureDTO(multipartFile.getBytes(), multipartFile.getContentType(), false);
			} catch (IOException ioe) {
				throw new UserException(
						String.format("Cannot parse multipart file: %s", multipartFile.getOriginalFilename()));
			}
		};
	}

	/**
     * Retrieves all listings for the authenticated landlord.
     *
     * @return ResponseEntity with the list of DisplayCardListingDTOs
     */
	@GetMapping(value = "/get-all")
	@PreAuthorize("hasAnyRole('" + SecurityUtils.ROLE_LANDLORD + "')")
	public ResponseEntity<List<DisplayCardListingDTO>> getAll() {
		ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
		List<DisplayCardListingDTO> allProperties = landlordService.getAllProperties(connectedUser);
		return ResponseEntity.ok(allProperties);
	}

	/**
     * Deletes a listing for the authenticated landlord by public ID.
     *
     * @param publicId the UUID of the listing to delete
     * @return ResponseEntity with the UUID of the deleted listing, or an error status
     */
	@DeleteMapping("/delete")
	@PreAuthorize("hasAnyRole('" + SecurityUtils.ROLE_LANDLORD + "')")
	public ResponseEntity<UUID> delete(@RequestParam UUID publicId) {
		ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
		State<UUID, String> deleteState = landlordService.delete(publicId, connectedUser);
		if (deleteState.getStatus().equals(StatusNotification.OK)) {
			return ResponseEntity.ok(deleteState.getValue());
		} else if (deleteState.getStatus().equals(StatusNotification.UNAUTHORIZED)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	}
}
package com.airbnb.airbn_clone_back.listing.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.airbnb.airbn_clone_back.listing.domain.BookingCategory;
import com.airbnb.airbn_clone_back.listing.domain.Listing;

public interface ListingRepository extends JpaRepository<Listing, Long> {

	/**
	 * Finds all listings for a landlord, fetching only the cover picture for each
	 * listing.
	 *
	 * @param landlordPublicId the UUID of the landlord
	 * @return a list of Listing entities with cover pictures
	 */
	@Query("SELECT listing FROM Listing listing LEFT JOIN FETCH listing.pictures picture"
			+ " WHERE listing.landlordPublicId = :landlordPublicId AND picture.isCover = true")
	List<Listing> findAllByLandlordPublicIdFetchCoverPicture(UUID landlordPublicId);

	/**
	 * Deletes a listing by its public ID and landlord public ID.
	 *
	 * @param publicId         the UUID of the listing
	 * @param landlordPublicId the UUID of the landlord
	 * @return the number of entities deleted
	 */
	long deleteByPublicIdAndLandlordPublicId(UUID publicId, UUID landlordPublicId);

	/**
	 * Finds all listings by booking category, fetching only the cover picture for
	 * each listing.
	 *
	 * @param pageable        the pagination information
	 * @param bookingCategory the booking category to filter by
	 * @return a page of Listing entities with cover pictures
	 */
	@Query("SELECT listing from Listing listing LEFT JOIN FETCH listing.pictures picture"
			+ " WHERE picture.isCover = true AND listing.bookingCategory = :bookingCategory")
	Page<Listing> findAllByBookingCategoryWithCoverOnly(Pageable pageable, BookingCategory bookingCategory);

	/**
	 * Finds all listings, fetching only the cover picture for each listing.
	 *
	 * @param pageable the pagination information
	 * @return a page of Listing entities with cover pictures
	 */
	@Query("SELECT listing from Listing listing LEFT JOIN FETCH listing.pictures picture"
			+ " WHERE picture.isCover = true")
	Page<Listing> findAllWithCoverOnly(Pageable pageable);

	/**
	 * Finds a listing by its public ID.
	 *
	 * @param publicId the UUID of the listing
	 * @return an Optional containing the Listing if found, or empty otherwise
	 */
	Optional<Listing> findByPublicId(UUID publicId);

	/**
	 * Finds all listings with public IDs in the given list.
	 *
	 * @param allListingPublicIDs the list of listing UUIDs
	 * @return a list of Listing entities
	 */
	List<Listing> findAllByPublicIdIn(List<UUID> allListingPublicIDs);

	/**
	 * Finds a listing by its public ID and landlord public ID.
	 *
	 * @param listingPublicId  the UUID of the listing
	 * @param landlordPublicId the UUID of the landlord
	 * @return an Optional containing the Listing if found, or empty otherwise
	 */
	Optional<Listing> findOneByPublicIdAndLandlordPublicId(UUID listingPublicId, UUID landlordPublicId);

	/**
	 * Finds all listings matching the given location and property details, with
	 * pagination.
	 *
	 * @param pageable  the pagination information
	 * @param location  the location to filter by
	 * @param bathrooms the number of bathrooms
	 * @param bedrooms  the number of bedrooms
	 * @param guests    the number of guests
	 * @param beds      the number of beds
	 * @return a page of Listing entities matching the criteria
	 */
	Page<Listing> findAllByLocationAndBathroomsAndBedroomsAndGuestsAndBeds(Pageable pageable, String location,
			int bathrooms, int bedrooms, int guests, int beds);
}
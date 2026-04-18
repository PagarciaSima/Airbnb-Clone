package com.airbnb.airbn_clone_back.listing.application;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airbnb.airbn_clone_back.booking.application.BookingService;
import com.airbnb.airbn_clone_back.listing.application.dto.DisplayCardListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.DisplayListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.SearchDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.sub.LandlordListingDTO;
import com.airbnb.airbn_clone_back.listing.domain.BookingCategory;
import com.airbnb.airbn_clone_back.listing.domain.Listing;
import com.airbnb.airbn_clone_back.listing.mapper.ListingMapper;
import com.airbnb.airbn_clone_back.listing.repository.ListingRepository;
import com.airbnb.airbn_clone_back.sharedkernel.service.State;
import com.airbnb.airbn_clone_back.user.application.UserService;
import com.airbnb.airbn_clone_back.user.application.dto.ReadUserDTO;

@Service
public class TenantService {

    private final ListingRepository listingRepository;

    private final ListingMapper listingMapper;

    private final UserService userService;
   
    private final BookingService bookingService;


    /**
     * Constructs a TenantService with the required dependencies.
     *
     * @param listingRepository the listing repository
     * @param listingMapper the listing mapper
     * @param userService the user service
     * @param bookingService the booking service
     */
    public TenantService(ListingRepository listingRepository, ListingMapper listingMapper, UserService userService, BookingService bookingService) {
        this.listingRepository = listingRepository;
        this.listingMapper = listingMapper;
        this.userService = userService;
        this.bookingService = bookingService;
    }

    /**
     * Retrieves all listings by booking category, or all listings if category is ALL.
     *
     * @param pageable the pagination information
     * @param category the booking category to filter by
     * @return a page of DisplayCardListingDTO objects
     */
    public Page<DisplayCardListingDTO> getAllByCategory(Pageable pageable, BookingCategory category) {
        Page<Listing> allOrBookingCategory;
        if (category == BookingCategory.ALL) {
            allOrBookingCategory = listingRepository.findAllWithCoverOnly(pageable);
        } else {
            allOrBookingCategory = listingRepository.findAllByBookingCategoryWithCoverOnly(pageable, category);
        }

        return allOrBookingCategory.map(listingMapper::listingToDisplayCardListingDTO);
    }

    /**
     * Retrieves a single listing by its public ID.
     *
     * @param publicId the UUID of the listing
     * @return a State containing the DisplayListingDTO or an error message
     */
    @Transactional(readOnly = true)
    public State<DisplayListingDTO, String> getOne(UUID publicId) {
        Optional<Listing> listingByPublicIdOpt = listingRepository.findByPublicId(publicId);

        if (listingByPublicIdOpt.isEmpty()) {
            return State.<DisplayListingDTO, String>builder()
                    .forError(String.format("Listing doesn't exist for publicId: %s", publicId));
        }

        DisplayListingDTO displayListingDTO = listingMapper.listingToDisplayListingDTO(listingByPublicIdOpt.get());

        ReadUserDTO readUserDTO = userService.getByPublicId(listingByPublicIdOpt.get().getLandlordPublicId()).orElseThrow();
        LandlordListingDTO landlordListingDTO = new LandlordListingDTO(readUserDTO.firstName(), readUserDTO.imageUrl());
        displayListingDTO.setLandlord(landlordListingDTO);

        return State.<DisplayListingDTO, String>builder().forSuccess(displayListingDTO);
    }


    /**
     * Searches for listings matching the given search criteria and filters out booked listings.
     *
     * @param pageable the pagination information
     * @param newSearch the search criteria
     * @return a page of DisplayCardListingDTO objects that are available
     */
    @Transactional(readOnly = true)
    public Page<DisplayCardListingDTO> search(Pageable pageable, SearchDTO newSearch) {

        Page<Listing> allMatchedListings = listingRepository.findAllByLocationAndBathroomsAndBedroomsAndGuestsAndBeds(
        		pageable, 
        		newSearch.location(),
                newSearch.infos().baths().value(),
                newSearch.infos().bedrooms().value(),
                newSearch.infos().guests().value(),
                newSearch.infos().beds().value()
        );

        List<UUID> listingUUIDs = allMatchedListings.stream().map(Listing::getPublicId).toList();

        List<UUID> bookingUUIDs = bookingService.getBookingMatchByListingIdsAndBookedDate(
        		listingUUIDs, newSearch.dates());

        List<DisplayCardListingDTO> listingsNotBooked = 
        		allMatchedListings.stream().filter(listing -> !bookingUUIDs.contains(listing.getPublicId()))
                .map(listingMapper::listingToDisplayCardListingDTO)
                .toList();

        return new PageImpl<>(listingsNotBooked, pageable, listingsNotBooked.size());
    }
}

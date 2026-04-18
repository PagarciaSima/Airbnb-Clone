package com.airbnb.airbn_clone_back.booking.application;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airbnb.airbn_clone_back.booking.application.dto.BookedDateDTO;
import com.airbnb.airbn_clone_back.booking.application.dto.BookedListingDTO;
import com.airbnb.airbn_clone_back.booking.application.dto.NewBookingDTO;
import com.airbnb.airbn_clone_back.booking.domain.Booking;
import com.airbnb.airbn_clone_back.booking.mapper.BookingMapper;
import com.airbnb.airbn_clone_back.booking.repository.BookingRepository;
import com.airbnb.airbn_clone_back.infrastructure.config.SecurityUtils;
import com.airbnb.airbn_clone_back.listing.LandlordService;
import com.airbnb.airbn_clone_back.listing.application.dto.DisplayCardListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.ListingCreateBookingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.vo.PriceVO;
import com.airbnb.airbn_clone_back.sharedkernel.service.State;
import com.airbnb.airbn_clone_back.user.application.UserService;
import com.airbnb.airbn_clone_back.user.application.dto.ReadUserDTO;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final UserService userService;
    private final LandlordService landlordService;

    public BookingService(BookingRepository bookingRepository, BookingMapper bookingMapper,
                          UserService userService, LandlordService landlordService) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
        this.userService = userService;
        this.landlordService = landlordService;
    }

    /**
     * Creates a new booking from the provided data.
     *
     * @param newBookingDTO DTO with the new booking information
     * @return State of the operation, with success or error message
     */
    @Transactional
    public State<Void, String> create(NewBookingDTO newBookingDTO) {
        Booking booking = bookingMapper.newBookingToBooking(newBookingDTO);

        Optional<ListingCreateBookingDTO> listingOpt = landlordService.getByListingPublicId(newBookingDTO.listingPublicId());

        if (listingOpt.isEmpty()) {
            return State.<Void, String>builder().forError("Landlord public id not found");
        }

        boolean alreadyBooked = bookingRepository.bookingExistsAtInterval(newBookingDTO.startDate(), newBookingDTO.endDate(), newBookingDTO.listingPublicId());

        if (alreadyBooked) {
            return State.<Void, String>builder().forError("One booking already exists");
        }

        ListingCreateBookingDTO listingCreateBookingDTO = listingOpt.get();

        booking.setFkListing(listingCreateBookingDTO.listingPublicId());

        ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
        booking.setFkTenant(connectedUser.publicId());
        booking.setNumberOfTravelers(1);

        long numberOfNights = ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate());
        booking.setTotalPrice((int) (numberOfNights * listingCreateBookingDTO.price().value()));

        bookingRepository.save(booking);

        return State.<Void, String>builder().forSuccess();
    }

    /**
     * Checks the date availability for a specific listing.
     *
     * @param publicId UUID of the listing to check
     * @return List of booked dates
     */
    @Transactional(readOnly = true)
    public List<BookedDateDTO> checkAvailability(UUID publicId) {
        return bookingRepository.findAllByFkListing(publicId)
                .stream().map(bookingMapper::bookingToCheckAvailability).toList();
    }

    /**
     * Gets the list of bookings made by the authenticated user.
     *
     * @return List of the user's bookings
     */
    @Transactional(readOnly = true)
    public List<BookedListingDTO> getBookedListing() {
        ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
        List<Booking> allBookings = bookingRepository.findAllByFkTenant(connectedUser.publicId());
        List<UUID> allListingPublicIDs = allBookings.stream().map(Booking::getFkListing).toList();
        List<DisplayCardListingDTO> allListings = landlordService.getCardDisplayByListingPublicId(allListingPublicIDs);
        return mapBookingToBookedListing(allBookings, allListings);
    }

    private List<BookedListingDTO> mapBookingToBookedListing(List<Booking> allBookings, List<DisplayCardListingDTO> allListings) {
        return allBookings.stream().map(booking -> {
            DisplayCardListingDTO displayCardListingDTO = allListings
                    .stream()
                    .filter(listing -> listing.publicId().equals(booking.getFkListing()))
                    .findFirst()
                    .orElseThrow();
            BookedDateDTO dates = bookingMapper.bookingToCheckAvailability(booking);
            return new BookedListingDTO(displayCardListingDTO.cover(),
                    displayCardListingDTO.location(),
                    dates, new PriceVO(booking.getTotalPrice()),
                    booking.getPublicId(), displayCardListingDTO.publicId());
        }).toList();
    }

        /**
         * Cancels a specific booking.
         *
         * @param bookingPublicId UUID of the booking to cancel
         * @param listingPublicId UUID of the associated listing
         * @param byLandlord indicates if the cancellation is performed by the landlord
         * @return State of the operation, with success or error message
         */
    @Transactional
    public State<UUID, String> cancel(UUID bookingPublicId, UUID listingPublicId, boolean byLandlord) {
        ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
        int deleteSuccess = 0;

        if (SecurityUtils.hasCurrentUserAnyOfAuthorities(SecurityUtils.ROLE_LANDLORD)
                && byLandlord) {
            deleteSuccess = handleDeletionForLandlord(bookingPublicId, listingPublicId, connectedUser, deleteSuccess);
        } else {
            deleteSuccess = bookingRepository.deleteBookingByFkTenantAndPublicId(connectedUser.publicId(), bookingPublicId);
        }

        if (deleteSuccess >= 1) {
            return State.<UUID, String>builder().forSuccess(bookingPublicId);
        } else {
            return State.<UUID, String>builder().forError("Booking not found");
        }
    }

    private int handleDeletionForLandlord(UUID bookingPublicId, UUID listingPublicId, ReadUserDTO connectedUser, int deleteSuccess) {
        Optional<DisplayCardListingDTO> listingVerificationOpt = landlordService.getByPublicIdAndLandlordPublicId(listingPublicId, connectedUser.publicId());
        if (listingVerificationOpt.isPresent()) {
            deleteSuccess = bookingRepository.deleteBookingByPublicIdAndFkListing(bookingPublicId, listingVerificationOpt.get().publicId());
        }
        return deleteSuccess;
    }

    /**
     * Gets the list of bookings for the authenticated landlord.
     *
     * @return List of bookings for the landlord's properties
     */
    @Transactional(readOnly = true)
    public List<BookedListingDTO> getBookedListingForLandlord() {
        ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
        List<DisplayCardListingDTO> allProperties = landlordService.getAllProperties(connectedUser);
        List<UUID> allPropertyPublicIds = allProperties.stream().map(DisplayCardListingDTO::publicId).toList();
        List<Booking> allBookings = bookingRepository.findAllByFkListingIn(allPropertyPublicIds);
        return mapBookingToBookedListing(allBookings, allProperties);
    }

    /**
     * Finds the listing IDs that have bookings matching a given date range.
     *
     * @param listingsId List of listing UUIDs
     * @param bookedDateDTO DTO with the date range to search
     * @return List of listing UUIDs that have bookings in that range
     */
    public List<UUID> getBookingMatchByListingIdsAndBookedDate(List<UUID> listingsId, BookedDateDTO bookedDateDTO) {
        return bookingRepository.findAllMatchWithDate(listingsId, bookedDateDTO.startDate(), bookedDateDTO.endDate())
                .stream().map(Booking::getFkListing).toList();
    }
}
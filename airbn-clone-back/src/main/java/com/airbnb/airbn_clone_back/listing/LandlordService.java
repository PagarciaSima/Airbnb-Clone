package com.airbnb.airbn_clone_back.listing;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airbnb.airbn_clone_back.listing.application.dto.CreatedListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.DisplayCardListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.ListingCreateBookingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.SaveListingDTO;
import com.airbnb.airbn_clone_back.listing.domain.Listing;
import com.airbnb.airbn_clone_back.listing.mapper.ListingMapper;
import com.airbnb.airbn_clone_back.listing.repository.ListingRepository;
import com.airbnb.airbn_clone_back.sharedkernel.service.State;
import com.airbnb.airbn_clone_back.user.application.Auth0Service;
import com.airbnb.airbn_clone_back.user.application.UserService;
import com.airbnb.airbn_clone_back.user.application.dto.ReadUserDTO;
@Service
public class LandlordService {

    private final ListingRepository listingRepository;

    private final ListingMapper listingMapper;
    private final UserService userService;
    private final Auth0Service auth0Service;
    private final PictureService pictureService;

    /**
     * Constructs a LandlordService with the required dependencies.
     *
     * @param listingRepository the listing repository
     * @param listingMapper the listing mapper
     * @param userService the user service
     * @param auth0Service the Auth0 service
     * @param pictureService the picture service
     */
    public LandlordService(ListingRepository listingRepository, ListingMapper listingMapper, UserService userService, Auth0Service auth0Service, PictureService pictureService) {
        this.listingRepository = listingRepository;
        this.listingMapper = listingMapper;
        this.userService = userService;
        this.auth0Service = auth0Service;
        this.pictureService = pictureService;
    }

    /**
     * Creates a new listing for the landlord and saves associated pictures.
     *
     * @param saveListingDTO the DTO containing listing data to save
     * @return the created listing as a CreatedListingDTO
     */
    public CreatedListingDTO create(SaveListingDTO saveListingDTO) {
        Listing newListing = listingMapper.saveListingDTOToListing(saveListingDTO);

        ReadUserDTO userConnected = userService.getAuthenticatedUserFromSecurityContext();
        newListing.setLandlordPublicId(userConnected.publicId());

        Listing savedListing = listingRepository.saveAndFlush(newListing);

        pictureService.saveAll(saveListingDTO.getPictures(), savedListing);

        auth0Service.addLandlordRoleToUser(userConnected);

        return listingMapper.listingToCreatedListingDTO(savedListing);
    }

    /**
     * Retrieves all properties for the given landlord, including cover pictures.
     *
     * @param landlord the landlord's user DTO
     * @return a list of DisplayCardListingDTOs for the landlord's properties
     */
    @Transactional(readOnly = true)
    public List<DisplayCardListingDTO> getAllProperties(ReadUserDTO landlord) {
        List<Listing> properties = listingRepository.findAllByLandlordPublicIdFetchCoverPicture(landlord.publicId());
        return listingMapper.listingToDisplayCardListingDTOs(properties);
    }

    /**
     * Deletes a listing by its public ID for the given landlord.
     *
     * @param publicId the UUID of the listing to delete
     * @param landlord the landlord's user DTO
     * @return a State indicating success or unauthorized
     */
    @Transactional
    public State<UUID, String> delete(UUID publicId, ReadUserDTO landlord) {
        long deletedSuccessfuly = listingRepository.deleteByPublicIdAndLandlordPublicId(publicId, landlord.publicId());
        if (deletedSuccessfuly > 0) {
            return State.<UUID, String>builder().forSuccess(publicId);
        } else {
            return State.<UUID, String>builder().forUnauthorized("User not authorized to delete this listing");
        }
    }

    /**
     * Retrieves a ListingCreateBookingDTO by the listing's public ID.
     *
     * @param publicId the UUID of the listing
     * @return an Optional containing the ListingCreateBookingDTO if found
     */
    public Optional<ListingCreateBookingDTO> getByListingPublicId(UUID publicId) {
        return listingRepository.findByPublicId(publicId)
        		.map(listingMapper::mapListingToListingCreateBookingDTO);
    }

    /**
     * Retrieves DisplayCardListingDTOs for a list of listing public IDs.
     *
     * @param allListingPublicIDs the list of listing UUIDs
     * @return a list of DisplayCardListingDTOs
     */
    public List<DisplayCardListingDTO> getCardDisplayByListingPublicId(List<UUID> allListingPublicIDs) {
        return listingRepository.findAllByPublicIdIn(allListingPublicIDs)
                .stream()
                .map(listingMapper::listingToDisplayCardListingDTO)
                .toList();
    }

    /**
     * Retrieves a DisplayCardListingDTO by listing public ID and landlord public ID.
     *
     * @param listingPublicId the UUID of the listing
     * @param landlordPublicId the UUID of the landlord
     * @return an Optional containing the DisplayCardListingDTO if found
     */
    @Transactional(readOnly = true)
    public Optional<DisplayCardListingDTO> getByPublicIdAndLandlordPublicId(UUID listingPublicId, UUID landlordPublicId) {
        return listingRepository.findOneByPublicIdAndLandlordPublicId(listingPublicId, landlordPublicId)
                .map(listingMapper::listingToDisplayCardListingDTO);
    }
}
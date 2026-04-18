package com.airbnb.airbn_clone_back.listing.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.airbnb.airbn_clone_back.listing.application.dto.CreatedListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.DisplayCardListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.DisplayListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.ListingCreateBookingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.SaveListingDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.vo.PriceVO;
import com.airbnb.airbn_clone_back.listing.domain.Listing;

@Mapper(componentModel = "spring", uses = {ListingPictureMapper.class})
public interface ListingMapper {


    /**
     * Maps a SaveListingDTO to a Listing entity.
     *
     * @param saveListingDTO the DTO containing listing data to save
     * @return the Listing entity
     */
    @Mapping(target = "landlordPublicId", ignore = true)
    @Mapping(target = "publicId", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "pictures", ignore = true)
    @Mapping(target = "title", source = "description.title.value")
    @Mapping(target = "description", source = "description.description.value")
    @Mapping(target = "bedrooms", source = "infos.bedrooms.value")
    @Mapping(target = "guests", source = "infos.guests.value")
    @Mapping(target = "bookingCategory", source = "category")
    @Mapping(target = "beds", source = "infos.beds.value")
    @Mapping(target = "bathrooms", source = "infos.baths.value")
    @Mapping(target = "price", source = "price.value")
    Listing saveListingDTOToListing(SaveListingDTO saveListingDTO);


    /**
     * Maps a Listing entity to a CreatedListingDTO.
     *
     * @param listing the Listing entity
     * @return the CreatedListingDTO
     */
    CreatedListingDTO listingToCreatedListingDTO(Listing listing);


    /**
     * Maps a list of Listing entities to a list of DisplayCardListingDTOs.
     *
     * @param listings the list of Listing entities
     * @return a list of DisplayCardListingDTOs
     */
    @Mapping(target = "cover", source = "pictures")
    List<DisplayCardListingDTO> listingToDisplayCardListingDTOs(List<Listing> listings);


    /**
     * Maps a Listing entity to a DisplayCardListingDTO, extracting the cover image.
     *
     * @param listing the Listing entity
     * @return the DisplayCardListingDTO
     */
    @Mapping(target = "cover", source = "pictures", qualifiedByName = "extract-cover")
    DisplayCardListingDTO listingToDisplayCardListingDTO(Listing listing);


    /**
     * Maps an integer price to a PriceVO object.
     *
     * @param price the price as an integer
     * @return the PriceVO object
     */
    default PriceVO mapPriceToPriceVO(int price) {
        return new PriceVO(price);
    }


    /**
     * Maps a Listing entity to a DisplayListingDTO.
     *
     * @param listing the Listing entity
     * @return the DisplayListingDTO
     */
    @Mapping(target = "landlord", ignore = true)
    @Mapping(target = "description.title.value", source = "title")
    @Mapping(target = "description.description.value", source = "description")
    @Mapping(target = "infos.bedrooms.value", source = "bedrooms")
    @Mapping(target = "infos.guests.value", source = "guests")
    @Mapping(target = "infos.beds.value", source = "beds")
    @Mapping(target = "infos.baths.value", source = "bathrooms")
    @Mapping(target = "category", source = "bookingCategory")
    @Mapping(target = "price.value", source = "price")
    DisplayListingDTO listingToDisplayListingDTO(Listing listing);


    /**
     * Maps a Listing entity to a ListingCreateBookingDTO.
     *
     * @param listing the Listing entity
     * @return the ListingCreateBookingDTO
     */
    @Mapping(target = "listingPublicId", source = "publicId")
    ListingCreateBookingDTO mapListingToListingCreateBookingDTO(Listing listing);
}

package com.airbnb.airbn_clone_back.listing.mapper;

import java.util.List;
import java.util.Set;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.airbnb.airbn_clone_back.listing.application.dto.sub.PictureDTO;
import com.airbnb.airbn_clone_back.listing.domain.ListingPicture;

@Mapper(componentModel = "spring")
public interface ListingPictureMapper {


    /**
     * Maps a list of PictureDTOs to a set of ListingPicture entities.
     *
     * @param pictureDTOs the list of PictureDTOs
     * @return a set of ListingPicture entities
     */
    Set<ListingPicture> pictureDTOsToListingPictures(List<PictureDTO> pictureDTOs);


    /**
     * Maps a PictureDTO to a ListingPicture entity.
     *
     * @param pictureDTO the PictureDTO
     * @return the ListingPicture entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "listing", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(target = "cover", source = "isCover")
    ListingPicture pictureDTOToListingPicture(PictureDTO pictureDTO);


    /**
     * Maps a list of ListingPicture entities to a list of PictureDTOs.
     *
     * @param listingPictures the list of ListingPicture entities
     * @return a list of PictureDTOs
     */
    List<PictureDTO> listingPictureToPictureDTO(List<ListingPicture> listingPictures);


    /**
     * Maps a ListingPicture entity to a PictureDTO.
     *
     * @param listingPicture the ListingPicture entity
     * @return the PictureDTO
     */
    @Mapping(target = "isCover", source = "cover")
    PictureDTO convertToPictureDTO(ListingPicture listingPicture);


    /**
     * Extracts the cover picture from a set of ListingPicture entities and converts it to a PictureDTO.
     *
     * @param pictures the set of ListingPicture entities
     * @return the cover PictureDTO
     * @throws java.util.NoSuchElementException if the set is empty
     */
    @Named("extract-cover")
    default PictureDTO extractCover(Set<ListingPicture> pictures) {
        return pictures.stream().findFirst().map(this::convertToPictureDTO).orElseThrow();
    }

}

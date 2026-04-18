package com.airbnb.airbn_clone_back.listing;


import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.airbnb.airbn_clone_back.listing.application.dto.sub.PictureDTO;
import com.airbnb.airbn_clone_back.listing.domain.Listing;
import com.airbnb.airbn_clone_back.listing.domain.ListingPicture;
import com.airbnb.airbn_clone_back.listing.mapper.ListingPictureMapper;
import com.airbnb.airbn_clone_back.listing.repository.ListingPictureRepository;

@Service
public class PictureService {

    private final ListingPictureRepository listingPictureRepository;

    private final ListingPictureMapper listingPictureMapper;

    /**
     * Constructs a PictureService with the required dependencies.
     *
     * @param listingPictureRepository the listing picture repository
     * @param listingPictureMapper the listing picture mapper
     */
    public PictureService(ListingPictureRepository listingPictureRepository, ListingPictureMapper listingPictureMapper) {
        this.listingPictureRepository = listingPictureRepository;
        this.listingPictureMapper = listingPictureMapper;
    }


    /**
     * Saves all pictures for a given listing, setting the first as the cover.
     *
     * @param pictures the list of PictureDTOs to save
     * @param listing the Listing entity to associate the pictures with
     * @return a list of PictureDTOs representing the saved pictures
     */
    public List<PictureDTO> saveAll(List<PictureDTO> pictures, Listing listing) {
        Set<ListingPicture> listingPictures = listingPictureMapper.pictureDTOsToListingPictures(pictures);

        boolean isFirst = true;

        for (ListingPicture listingPicture : listingPictures) {
            listingPicture.setCover(isFirst);
            listingPicture.setListing(listing);
            isFirst = false;
        }

        listingPictureRepository.saveAll(listingPictures);
        return listingPictureMapper.listingPictureToPictureDTO(listingPictures.stream().toList());
    }
}
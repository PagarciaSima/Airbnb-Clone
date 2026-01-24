package com.airbnb.airbn_clone_back.listing.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.airbnb.airbn_clone_back.listing.domain.ListingPicture;

public interface ListingPictureRepository extends JpaRepository<ListingPicture, Long> {
}

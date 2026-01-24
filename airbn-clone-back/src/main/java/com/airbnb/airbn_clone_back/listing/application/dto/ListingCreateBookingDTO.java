package com.airbnb.airbn_clone_back.listing.application.dto;

import java.util.UUID;

import com.airbnb.airbn_clone_back.listing.application.dto.vo.PriceVO;

public record ListingCreateBookingDTO(
        UUID listingPublicId, PriceVO price) {
}

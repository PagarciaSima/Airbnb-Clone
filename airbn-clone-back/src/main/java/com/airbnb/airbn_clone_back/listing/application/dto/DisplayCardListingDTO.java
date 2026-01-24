package com.airbnb.airbn_clone_back.listing.application.dto;

import java.util.UUID;

import com.airbnb.airbn_clone_back.listing.application.dto.sub.PictureDTO;
import com.airbnb.airbn_clone_back.listing.application.dto.vo.PriceVO;
import com.airbnb.airbn_clone_back.listing.domain.BookingCategory;

public record DisplayCardListingDTO(PriceVO price,
                                    String location,
                                    PictureDTO cover,
                                    BookingCategory bookingCategory,
                                    UUID publicId) {
}

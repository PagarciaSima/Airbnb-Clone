package com.airbnb.airbn_clone_back.booking.application.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record NewBookingDTO(
        @NotNull OffsetDateTime startDate,
        @NotNull OffsetDateTime endDate,
        @NotNull UUID listingPublicId) {
}

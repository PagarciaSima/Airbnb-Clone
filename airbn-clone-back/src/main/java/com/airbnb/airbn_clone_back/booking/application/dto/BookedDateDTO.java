package com.airbnb.airbn_clone_back.booking.application.dto;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotNull;

public record BookedDateDTO(
        @NotNull OffsetDateTime startDate,
        @NotNull OffsetDateTime endDate
) {
}

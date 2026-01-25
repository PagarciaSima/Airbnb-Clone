package com.airbnb.airbn_clone_back.booking.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.airbnb.airbn_clone_back.booking.application.dto.BookedDateDTO;
import com.airbnb.airbn_clone_back.booking.application.dto.NewBookingDTO;
import com.airbnb.airbn_clone_back.booking.domain.Booking;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookingMapper {

    Booking newBookingToBooking(NewBookingDTO newBookingDTO);

    BookedDateDTO bookingToCheckAvailability(Booking booking);
}

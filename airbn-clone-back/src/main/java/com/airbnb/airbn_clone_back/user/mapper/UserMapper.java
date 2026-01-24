package com.airbnb.airbn_clone_back.user.mapper;

import org.mapstruct.Mapper;

import com.airbnb.airbn_clone_back.user.domain.Authority;
import com.airbnb.airbn_clone_back.user.domain.User;
import com.airbnb.airbn_clone_back.user.dto.ReadUserDTO;

@Mapper(componentModel = "spring")
public interface UserMapper {

    ReadUserDTO readUserDTOToUser(User user);

    default String mapAuthoritiesToString(Authority authority) {
        return authority.getName();
    }

}
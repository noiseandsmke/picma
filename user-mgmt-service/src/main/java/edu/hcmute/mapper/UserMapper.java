package edu.hcmute.mapper;

import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);

    User toEntity(UserDto userDto);
}
package edu.hcmute.mapper;

import edu.hcmute.dto.User;
import edu.hcmute.dto.UserDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "zipcode", source = "attributes", qualifiedByName = "mapZipcode")
    @Mapping(target = "attributes", source = "attributes")
    @Mapping(target = "group", ignore = true)
    @Mapping(target = "password", ignore = true)
    UserDto toDto(User user);

    @Mapping(target = "attributes", source = "attributes")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "totp", constant = "false")
    @Mapping(target = "realmRoles", ignore = true)
    @Mapping(target = "clientRoles", ignore = true)
    @Mapping(target = "groups", ignore = true)
    @Mapping(target = "access", ignore = true)
    @Mapping(target = "createdTimestamp", ignore = true)
    @Mapping(target = "credentials", ignore = true)
    User toEntity(UserDto userDto);

    @Named("mapZipcode")
    default String mapZipcode(Map<String, List<String>> attributes) {
        if (attributes == null) return null;
        List<String> zips = attributes.get("zipcode");
        return (zips != null && !zips.isEmpty()) ? zips.get(0) : null;
    }

    @Named("mapAttributes")
    default Map<String, List<String>> mapAttributes(String zipcode) {
        return (zipcode == null || zipcode.isEmpty())
                ? Collections.emptyMap()
                : Map.of("zipcode", List.of(zipcode));
    }
}
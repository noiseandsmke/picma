package edu.hcmute.mapper;

import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.User;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "zipcode", source = "attributes", qualifiedByName = "mapZipcode")
    @Mapping(target = "group", ignore = true)
    UserDto toDto(User user);

    @Mapping(target = "zipcode", source = "attributes", qualifiedByName = "mapZipcode")
    @Mapping(target = "group", expression = "java(determineGroup(groupName))")
    UserDto toDtoWithGroup(User user, @Context String groupName);

    @Mapping(target = "attributes", source = "zipcode", qualifiedByName = "mapAttributes")
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
        if (attributes != null && attributes.containsKey("zipcode")) {
            List<String> zipcodes = attributes.get("zipcode");
            if (zipcodes != null && !zipcodes.isEmpty()) {
                return zipcodes.get(0);
            }
        }
        return null;
    }

    @Named("mapAttributes")
    default Map<String, List<String>> mapAttributes(String zipcode) {
        if (zipcode == null || zipcode.isEmpty()) {
            return null;
        }
        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put("zipcode", Collections.singletonList(zipcode));
        return attributes;
    }

    default String determineGroup(String groupName) {
        return groupName;
    }
}
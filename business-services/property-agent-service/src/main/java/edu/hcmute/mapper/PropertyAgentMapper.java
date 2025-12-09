package edu.hcmute.mapper;

import edu.hcmute.dto.AgentDto;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.AgentLead;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PropertyAgentMapper {
    @Mapping(target = "userInfo", ignore = true)
    @Mapping(target = "propertyInfo", ignore = true)
    AgentLeadDto toDto(AgentLead agentLead);

    @Mapping(target = "leadAction", source = "leadAction")
    AgentLead toEntity(AgentLeadDto agentLeadDto);

    AgentDto toAgentDto(UserDto userDto);
}
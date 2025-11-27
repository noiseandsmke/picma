package edu.hcmute.mapper;

import edu.hcmute.dto.AgentDto;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.dto.UserDto;
import edu.hcmute.entity.AgentLead;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PropertyAgentMapper {
    AgentLeadDto toDto(AgentLead agentLead);

    AgentLead toEntity(AgentLeadDto agentLeadDto);

    AgentDto toAgentDto(UserDto userDto);
}
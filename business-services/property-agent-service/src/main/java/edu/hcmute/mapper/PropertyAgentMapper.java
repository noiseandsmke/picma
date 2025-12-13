package edu.hcmute.mapper;

import edu.hcmute.dto.AgentLeadActionDto;
import edu.hcmute.entity.AgentLead;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PropertyAgentMapper {
    AgentLeadActionDto toDto(AgentLead agentLead);

    @Mapping(target = "leadAction", source = "leadAction")
    AgentLead toEntity(AgentLeadActionDto agentLeadActionDto);
}
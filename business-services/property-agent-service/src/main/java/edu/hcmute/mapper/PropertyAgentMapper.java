package edu.hcmute.mapper;

import edu.hcmute.dto.AgentLeadActionDto;
import edu.hcmute.entity.AgentLeadAction;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PropertyAgentMapper {
    AgentLeadActionDto toDto(AgentLeadAction entity);

    AgentLeadAction toEntity(AgentLeadActionDto dto);
}
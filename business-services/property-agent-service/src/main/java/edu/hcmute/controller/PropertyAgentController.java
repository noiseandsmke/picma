package edu.hcmute.controller;

import edu.hcmute.dto.AgentLeadActionDto;
import edu.hcmute.dto.PropertyAgentDto;
import edu.hcmute.service.PropertyAgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
public class PropertyAgentController {
    private final PropertyAgentService propertyAgentService;

    @PutMapping("/agent")
    public ResponseEntity<AgentLeadActionDto> updateLeadAction(@RequestBody AgentLeadActionDto agentLeadActionDto) {
        log.info("~~> update leadAction by Agent");
        return ResponseEntity.ok(propertyAgentService.updateLeadActionByAgent(agentLeadActionDto));
    }

    @GetMapping("/agents/zipcode")
    public ResponseEntity<List<String>> getAgentsByZipCode(@RequestHeader String zipCode) {
        log.info("~~> getting agents by zipCode: {}", zipCode);
        return ResponseEntity.ok(propertyAgentService.getAgentsByZipCode(zipCode));
    }

    @GetMapping("/agent/leads")
    public ResponseEntity<List<AgentLeadActionDto>> getAgentLeads(@RequestParam String agentId) {
        log.info("~~> getting leads for agentId: {}", agentId);
        return ResponseEntity.ok(propertyAgentService.getAgentLeads(agentId));
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<PropertyAgentDto> getAgentById(@PathVariable String agentId) {
        log.info("~~> getting agent by id: {}", agentId);
        return ResponseEntity.ok(propertyAgentService.getAgentById(agentId));
    }
}
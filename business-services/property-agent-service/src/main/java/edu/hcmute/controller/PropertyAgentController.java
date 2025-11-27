package edu.hcmute.controller;

import edu.hcmute.dto.AgentDto;
import edu.hcmute.dto.AgentLeadDto;
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
    public ResponseEntity<AgentLeadDto> updateLeadAction(@RequestBody AgentLeadDto agentLeadDto) {
        log.info("~~> update leadAction");
        return ResponseEntity.ok(propertyAgentService.updateLeadAction(agentLeadDto));
    }

    @GetMapping("/agents/zipcode")
    public ResponseEntity<List<String>> getAgentsByZipCode(@RequestHeader String zipCode) {
        log.info("~~> getting agents by zipCode: {}", zipCode);
        return ResponseEntity.ok(propertyAgentService.getAgentsByZipCode(zipCode));
    }

    @GetMapping("/agent/leads")
    public ResponseEntity<List<AgentLeadDto>> getAgentLeads(@RequestParam String agentId) {
        log.info("~~> getting leads for agentId: {}", agentId);
        return ResponseEntity.ok(propertyAgentService.getAgentLeads(agentId));
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<AgentDto> getAgentById(@PathVariable String agentId) {
        log.info("~~> getting agent by id: {}", agentId);
        return ResponseEntity.ok(propertyAgentService.getAgentById(agentId));
    }
}
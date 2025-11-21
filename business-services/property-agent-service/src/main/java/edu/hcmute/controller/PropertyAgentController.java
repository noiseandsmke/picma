package edu.hcmute.controller;

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
    public ResponseEntity<List<Integer>> getAgentsByZipCode(@RequestHeader String zipCode) {
        log.info("~~> getting agents by zipCode: {}", zipCode);
        return ResponseEntity.ok(propertyAgentService.getAgentsByZipCode(zipCode));
    }
}
package edu.hcmute.controller;

import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.service.PropertyAgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
public class PropertyAgentController {
    private final PropertyAgentService propertyAgentService;

    @PutMapping("/agent")
    public ResponseEntity<AgentLeadDto> updateLeadAction(@RequestBody AgentLeadDto agentLeadDto) {
        log.info("Update Lead Action");
        return ResponseEntity.ok(propertyAgentService.updateLeadAction(agentLeadDto));
    }
}
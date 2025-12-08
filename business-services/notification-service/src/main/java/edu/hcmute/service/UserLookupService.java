package edu.hcmute.service;

import edu.hcmute.config.UserMgmtFeignClient;
import edu.hcmute.dto.AgentInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserLookupService {
    private final UserMgmtFeignClient userMgmtFeignClient;

    public List<AgentInfo> getAgentsByZipCode(String zipCode) {
        try {
            return userMgmtFeignClient.getAgentsByZipCode(zipCode);
        } catch (Exception e) {
            log.error("Error fetching agents for zipCode {}: {}", zipCode, e.getMessage());
            return Collections.emptyList();
        }
    }
}
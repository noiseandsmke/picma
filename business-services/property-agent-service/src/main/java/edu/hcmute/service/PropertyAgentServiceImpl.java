package edu.hcmute.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.PropertyInfoFeignClient;
import edu.hcmute.repo.UserAddressRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PropertyAgentServiceImpl implements PropertyAgentService {
    private final PropertyInfoFeignClient propertyInfoFeignClient;
    private final UserAddressRepo userAddressRepo;
    private final ObjectMapper objectMapper;

    @Override
    public List<String> fetchAgentWithinZipCode(String propertyId, int leadId) {
        try {
            log.info("### Fetching agent within zip code: {} ###", propertyId);
            String propertyInfo = propertyInfoFeignClient.getPropertyInfoById(propertyId);
            JsonNode jsonObj = objectMapper.readTree(propertyInfo);
            log.info("~~> calling property-info-api to get address-info");
            log.info("~~> Property JSON response: {}", propertyInfo);

            String zipCode = extractZipCode(jsonObj);

            if (StringUtils.hasText(zipCode)) {
                List<String> agentIds = userAddressRepo.findUserIdsByZipCode(zipCode);
                log.info("ZipCode = {}", zipCode);
                log.info("### agentIds = {}", agentIds);
                return agentIds;
            } else {
                log.warn("zipCode is null or empty, cannot fetch agents");
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("Error fetching agents within zip code", e);
            throw new RuntimeException(e.getLocalizedMessage());
        }
    }

    private String extractZipCode(JsonNode jsonObj) {
        if (jsonObj.has("propertyAddressDto")) {
            JsonNode addressObj = jsonObj.get("propertyAddressDto");
            if (addressObj.has("zipCode")) {
                return addressObj.get("zipCode").asText();
            }
        }
        log.warn("propertyAddressDto or zipCode field not found in property info response");
        return null;
    }
}
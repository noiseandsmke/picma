package edu.hcmute.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.PropertyInfoFeignClient;
import edu.hcmute.entity.UserAddress;
import edu.hcmute.repo.UserAddressRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PropertyAgentServiceImpl implements PropertyAgentService {
    private final PropertyInfoFeignClient propertyInfoFeignClient;
    private final UserAddressRepo userAddressRepo;
    private final ObjectMapper objectMapper;

    @Override
    public List<String> fetchAgentWithinZipCode(String propertyId) {
        try {
            log.info("### Fetching agent within zip code: {} ###", propertyId);
            String propertyInfo = propertyInfoFeignClient.getPropertyInfoById(propertyId);
            List<String> agentIds = null;
            JsonNode jsonObj = objectMapper.readTree(propertyInfo);
            log.info("~~> calling property-info-api to get address-info");
            log.info("~~> Property JSON response: {}", propertyInfo);
            String zipCode = null;
            if (jsonObj.has("propertyAddressDto")) {
                JsonNode addressObj = jsonObj.get("propertyAddressDto");
                if (addressObj.has("zipCode")) {
                    zipCode = addressObj.get("zipCode").asText();
                    log.info("ZipCode = {}", zipCode);
                }
            } else {
                log.warn("propertyAddressDto field not found in property info response");
            }
            if (StringUtils.hasText(zipCode)) {
                agentIds = getUserIdsWithinZipCode(zipCode);
                log.info("~~> agentIds = {}", agentIds);
            } else {
                log.warn("zipCode is null or empty, cannot fetch agents");
            }
            // TODO: send notification to all agents with property lead
            return agentIds;
        } catch (Exception e) {
            log.error("### Error fetching agents within zip code ###", e);
            throw new RuntimeException(e.getLocalizedMessage());
        }
    }

    private List<String> getUserIdsWithinZipCode(String zipCode) {
        List<UserAddress> userAddresses = userAddressRepo.findByZipCode(zipCode);
        return userAddresses.stream().map(UserAddress::getUserId).toList();
    }
}
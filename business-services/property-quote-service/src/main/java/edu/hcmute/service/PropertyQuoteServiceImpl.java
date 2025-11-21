package edu.hcmute.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.hcmute.config.NotificationFeignClient;
import edu.hcmute.config.PropertyAgentFeignClient;
import edu.hcmute.config.PropertyInfoFeignClient;
import edu.hcmute.dto.NotificationRequestDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.repo.PropertyQuoteRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyQuoteServiceImpl implements PropertyQuoteService {
    private final PropertyQuoteRepo repo;
    private final ModelMapper modelMapper;
    private final PropertyInfoFeignClient propertyInfoFeignClient;
    private final PropertyAgentFeignClient propertyAgentFeignClient;
    private final NotificationFeignClient notificationFeignClient;
    private final ObjectMapper objectMapper;

    @Override
    public PropertyQuoteDto createPropertyQuote(PropertyQuoteDto propertyQuoteDto) {
        log.info("### Create PropertyQuote ###");
        log.info("PropertyQuoteDto: {}", propertyQuoteDto.toString());
        try {
            PropertyQuote propertyQuote = modelMapper.map(propertyQuoteDto, PropertyQuote.class);
            propertyQuote = repo.save(propertyQuote);
            log.info("PropertyQuote saved with id: {}", propertyQuote.getId());

            if (StringUtils.hasText(propertyQuoteDto.getPropertyInfo())) {
                String propertyId = propertyQuoteDto.getPropertyInfo();
                try {
                    String propertyJson = propertyInfoFeignClient.getPropertyInfoById(propertyId);
                    JsonNode jsonObj = objectMapper.readTree(propertyJson);

                    String zipCode = null;
                    if (jsonObj.has("propertyAddressDto")) {
                        JsonNode addressObj = jsonObj.get("propertyAddressDto");
                        if (addressObj.has("zipCode")) {
                            zipCode = addressObj.get("zipCode").asText();
                        }
                    }

                    if (StringUtils.hasText(zipCode)) {
                        List<Integer> agentIds = propertyAgentFeignClient.getAgentsByZipCode(zipCode);
                        for (Integer agentId : agentIds) {
                            NotificationRequestDto notification = NotificationRequestDto.builder()
                                    .recipientId(agentId)
                                    .title("New Property Quote Request")
                                    .message("A new quote request for property " + propertyId + " in your area (" + zipCode + "). Quote ID: " + propertyQuote.getId())
                                    .build();
                            notificationFeignClient.createNotification(notification);
                        }
                    }
                } catch (Exception e) {
                    log.error("Error processing property agent notification: {}", e.getMessage());
                }
            }
            return mapModelToDto(propertyQuote);
        } catch (Exception e) {
            log.error("Error creating PropertyQuote: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public PropertyQuoteDto getPropertyQuoteById(Integer id) {
        log.info("### Get PropertyQuote by Id ###");
        log.info("PropertyQuoteDto id: {}", id);
        PropertyQuote propertyQuote = repo.findById(id)
                .orElseThrow(() -> {
                    log.warn("No PropertyQuote found with id: {}", id);
                    return new RuntimeException("No PropertyQuote found with id: " + id);
                });
        return mapModelToDto(propertyQuote);
    }

    @Override
    public List<PropertyQuoteDto> getAllPropertyQuotes() {
        log.info("### Get All PropertyQuotes ###");
        List<PropertyQuote> propertyQuoteList = repo.findAll();
        if (propertyQuoteList.isEmpty()) {
            log.warn("No PropertyQuotes found in database");
            throw new RuntimeException("No PropertyQuotes found in database");
        }
        log.info("Found {} PropertyQuotes", propertyQuoteList.size());
        return propertyQuoteList.stream()
                .map(this::mapModelToDto)
                .toList();
    }

    private PropertyQuoteDto mapModelToDto(PropertyQuote propertyQuote) {
        return modelMapper.map(propertyQuote, PropertyQuoteDto.class);
    }
}
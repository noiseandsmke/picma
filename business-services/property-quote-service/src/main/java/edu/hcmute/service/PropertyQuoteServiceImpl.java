package edu.hcmute.service;

import edu.hcmute.config.PropertyAgentFeignClient;
import edu.hcmute.config.PropertyLeadFeignClient;
import edu.hcmute.dto.AgentLeadDto;
import edu.hcmute.dto.LeadInfoDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyQuoteRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyQuoteServiceImpl implements PropertyQuoteService {
    private final PropertyQuoteRepo propertyQuoteRepo;
    private final PropertyQuoteMapper propertyQuoteMapper;
    private final PropertyLeadFeignClient propertyLeadFeignClient;
    private final PropertyAgentFeignClient propertyAgentFeignClient;

    @Override
    @Transactional
    public PropertyQuoteDto createPropertyQuote(PropertyQuoteDto propertyQuoteDto) {
        log.info("### Create PropertyQuote for leadId = {} ###", propertyQuoteDto.leadId());
        Integer leadId = propertyQuoteDto.leadId();
        if (leadId == null) {
            throw new IllegalArgumentException("leadId is required to create a quote");
        }
        try {
            LeadInfoDto leadInfo = propertyLeadFeignClient.getLeadById(leadId);
            log.info("~~> validated lead exists: id={}, user={}", leadInfo.id(), leadInfo.userInfo());
        } catch (Exception e) {
            log.error("~~> lead not found with id: {}", leadId);
            throw new RuntimeException("Lead not found with id: " + leadId);
        }
        try {
            PropertyQuote propertyQuote = propertyQuoteMapper.toEntity(propertyQuoteDto);
            propertyQuote.setLeadId(leadId);
            if (propertyQuote.getValidUntil() == null) {
                propertyQuote.setValidUntil(LocalDate.now().plusDays(30));
            }
            propertyQuote = propertyQuoteRepo.save(propertyQuote);
            log.info("~~> PropertyQuote saved with id: {}", propertyQuote.getId());
            // Mark Agent Action as ACCEPTED (meaning Quoted)
            AgentLeadDto agentLeadDto = new AgentLeadDto(0, "ACCEPTED", propertyQuote.getAgentId(), leadId);
            propertyAgentFeignClient.updateLeadAction(agentLeadDto);
            log.info("~~> Agent lead action updated to ACCEPTED for agentId = {} and leadId = {}", propertyQuote.getAgentId(), leadId);
            return propertyQuoteMapper.toDto(propertyQuote);
        } catch (Exception e) {
            log.error("~~> error creating PropertyQuote: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create PropertyQuote: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyQuoteDto getPropertyQuoteById(Integer id) {
        log.info("### Get PropertyQuote by id = {} ###", id);
        PropertyQuote propertyQuote = propertyQuoteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("PropertyQuote not found with id: " + id));
        return propertyQuoteMapper.toDto(propertyQuote);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDto> getAllPropertyQuotes(String sort, String order) {
        log.info("### Get All PropertyQuotes ###");
        Sort.Direction direction = Sort.Direction.fromString(order);
        Sort sortBy = Sort.by(direction, sort);
        List<PropertyQuote> quotes = propertyQuoteRepo.findAll(sortBy);
        log.info("~~> found {} PropertyQuotes", quotes.size());
        return quotes.stream().map(propertyQuoteMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDto> getQuotesByLeadId(Integer leadId) {
        log.info("### Get PropertyQuotes by leadId = {} ###", leadId);
        List<PropertyQuote> quotes = propertyQuoteRepo.findByLeadId(leadId);
        log.info("~~> found {} quotes for leadId: {}", quotes.size(), leadId);
        return quotes.stream().map(propertyQuoteMapper::toDto).toList();
    }

    @Override
    @Transactional
    public PropertyQuoteDto updatePropertyQuote(Integer id, PropertyQuoteDto propertyQuoteDto) {
        log.info("### Update PropertyQuote by id = {} ###", id);
        PropertyQuote existingQuote = propertyQuoteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("PropertyQuote not found with id: " + id));
        PropertyQuote updatedQuote = propertyQuoteMapper.toEntity(propertyQuoteDto);
        updatedQuote.setId(existingQuote.getId());
        updatedQuote.setLeadId(existingQuote.getLeadId());
        updatedQuote = propertyQuoteRepo.save(updatedQuote);
        log.info("~~> PropertyQuote updated with id: {}", updatedQuote.getId());
        return propertyQuoteMapper.toDto(updatedQuote);
    }

    @Override
    @Transactional
    public void deletePropertyQuoteById(Integer id) {
        log.info("### Delete PropertyQuote by id = {} ###", id);
        if (!propertyQuoteRepo.existsById(id)) {
            throw new RuntimeException("PropertyQuote not found with id: " + id);
        }
        propertyQuoteRepo.deleteById(id);
        log.info("~~> PropertyQuote deleted with id: {}", id);
    }

    @Override
    @Transactional
    public void acceptQuote(Integer quoteId) {
        log.info("### Accept Quote id = {} ###", quoteId);
        PropertyQuote quote = propertyQuoteRepo.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("PropertyQuote not found with id: " + quoteId));
        // Update Lead Status to ACCEPTED
        log.info("~~> updating lead status to ACCEPTED for leadId: {}", quote.getLeadId());
        try {
            propertyLeadFeignClient.updateLeadStatusById(quote.getLeadId(), "ACCEPTED");
            log.info("~~> lead status updated successfully");
        } catch (Exception e) {
            log.error("~~> failed to update lead status: {}", e.getMessage());
            throw new RuntimeException("Failed to update lead status: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void rejectQuote(Integer quoteId) {
        log.info("### Reject Quote id = {} ###", quoteId);
        PropertyQuote quote = propertyQuoteRepo.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("PropertyQuote not found with id: " + quoteId));
        // Update Agent Lead Action to REJECTED
        log.info("~~> updating agent lead action to REJECTED for agent: {} lead: {}", quote.getAgentId(), quote.getLeadId());
        try {
            AgentLeadDto agentLeadDto = new AgentLeadDto(0, "REJECTED", quote.getAgentId(), quote.getLeadId());
            propertyAgentFeignClient.updateLeadAction(agentLeadDto);
            log.info("~~> agent lead action updated successfully");
        } catch (Exception e) {
            log.error("~~> failed to update agent lead action: {}", e.getMessage());
            throw new RuntimeException("Failed to update agent lead action: " + e.getMessage());
        }
    }
}
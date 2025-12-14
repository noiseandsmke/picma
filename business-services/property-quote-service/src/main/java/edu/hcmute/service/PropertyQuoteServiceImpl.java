package edu.hcmute.service;

import edu.hcmute.domain.QuoteStatus;
import edu.hcmute.dto.CreatePropertyQuoteDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.dto.UpdatePropertyQuoteDto;
import edu.hcmute.entity.Premium;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.event.schema.QuoteAcceptedEvent;
import edu.hcmute.event.schema.QuoteCreatedEvent;
import edu.hcmute.event.schema.QuoteRejectedEvent;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyQuoteRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyQuoteServiceImpl implements PropertyQuoteService {
    private static final String QUOTE_NOT_FOUND_MSG = "PropertyQuote not found with id: ";
    private static final String QUOTE_CREATED_OUT = "quoteCreated-out-0";
    private static final String QUOTE_ACCEPTED_OUT = "quoteAccepted-out-0";
    private static final String QUOTE_REJECTED_OUT = "quoteRejected-out-0";

    private final PropertyQuoteRepo propertyQuoteRepo;
    private final PropertyQuoteMapper propertyQuoteMapper;
    private final StreamBridge streamBridge;
    private final PremiumCalculationService premiumCalculationService;

    @Override
    @Transactional
    public PropertyQuoteDto createPropertyQuote(CreatePropertyQuoteDto createDto) {
        log.info("### Create PropertyQuote for leadId = {} ###", createDto.leadId());
        Integer leadId = createDto.leadId();
        if (leadId == null) {
            throw new IllegalArgumentException("leadId is required to create a quote");
        }
        try {
            PropertyQuote propertyQuote = propertyQuoteMapper.toEntity(createDto);
            propertyQuote.setLeadId(leadId);
            
            premiumCalculationService.validateCoverages(propertyQuote.getCoverages());
            
            Long calculatedSumInsured = premiumCalculationService.calculateSumInsured(propertyQuote.getCoverages());
            propertyQuote.setSumInsured(calculatedSumInsured);
            log.info("~~> Auto-calculated sumInsured: {}", calculatedSumInsured);
            
            Premium calculatedPremium = premiumCalculationService.calculatePremium(propertyQuote.getCoverages());
            propertyQuote.setPremium(calculatedPremium);
            log.info("~~> Auto-calculated premium: net={}, tax={}, total={}",
                    calculatedPremium.getNet(), calculatedPremium.getTax(), calculatedPremium.getTotal());

            if (propertyQuote.getValidUntil() == null) {
                propertyQuote.setValidUntil(LocalDate.now().plusDays(30));
            }
            if (propertyQuote.getStatus() == null) {
                propertyQuote.setStatus(QuoteStatus.ACTIVE);
            }
            propertyQuote = propertyQuoteRepo.save(propertyQuote);
            log.info("~~> PropertyQuote saved with id: {}", propertyQuote.getId());
            QuoteCreatedEvent event = new QuoteCreatedEvent(
                    propertyQuote.getId(),
                    propertyQuote.getLeadId(),
                    propertyQuote.getAgentId(),
                    (double) propertyQuote.getPremium().getTotal(),
                    LocalDateTime.now()
            );
            streamBridge.send(QUOTE_CREATED_OUT, event);
            log.info("~~> QuoteCreatedEvent published for quoteId: {}", propertyQuote.getId());
            return propertyQuoteMapper.toDto(propertyQuote);
        } catch (Exception e) {
            log.error("~~> error creating PropertyQuote: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Failed to create PropertyQuote: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyQuoteDto getPropertyQuoteById(Integer id) {
        log.info("### Get PropertyQuote by id = {} ###", id);
        PropertyQuote propertyQuote = propertyQuoteRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(QUOTE_NOT_FOUND_MSG + id));
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
    @Transactional(readOnly = true)
    public List<PropertyQuoteDto> getQuotesByAgentId(String agentId) {
        log.info("### Get PropertyQuotes by agentId = {} ###", agentId);
        List<PropertyQuote> quotes = propertyQuoteRepo.findByAgentId(agentId);
        log.info("~~> found {} quotes for agentId: {}", quotes.size(), agentId);
        return quotes.stream().map(propertyQuoteMapper::toDto).toList();
    }

    @Override
    @Transactional
    public PropertyQuoteDto updatePropertyQuote(Integer id, UpdatePropertyQuoteDto updateDto) {
        log.info("### Update PropertyQuote by id = {} ###", id);
        
        PropertyQuote existingQuote = propertyQuoteRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(QUOTE_NOT_FOUND_MSG + id));
        
        propertyQuoteMapper.updateEntity(existingQuote, updateDto);
        
        premiumCalculationService.validateCoverages(existingQuote.getCoverages());
        
        Long calculatedSumInsured = premiumCalculationService.calculateSumInsured(existingQuote.getCoverages());
        existingQuote.setSumInsured(calculatedSumInsured);
        log.info("~~> Recalculated sumInsured: {}", calculatedSumInsured);
        
        Premium calculatedPremium = premiumCalculationService.calculatePremium(existingQuote.getCoverages());
        existingQuote.setPremium(calculatedPremium);
        log.info("~~> Recalculated premium: total={}", calculatedPremium.getTotal());
        
        existingQuote = propertyQuoteRepo.save(existingQuote);
        log.info("~~> PropertyQuote updated with id: {}", existingQuote.getId());
        
        return propertyQuoteMapper.toDto(existingQuote);
    }

    @Override
    @Transactional
    public void deletePropertyQuoteById(Integer id) {
        log.info("### Delete PropertyQuote by id = {} ###", id);
        if (!propertyQuoteRepo.existsById(id)) {
            throw new IllegalArgumentException(QUOTE_NOT_FOUND_MSG + id);
        }
        propertyQuoteRepo.deleteById(id);
        log.info("~~> PropertyQuote deleted with id: {}", id);
    }

    @Override
    @Transactional
    public void acceptQuote(Integer quoteId) {
        log.info("### Accept Quote id = {} ###", quoteId);
        PropertyQuote targetQuote = propertyQuoteRepo.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException(QUOTE_NOT_FOUND_MSG + quoteId));
        targetQuote.setStatus(QuoteStatus.ACCEPTED);
        propertyQuoteRepo.save(targetQuote);
        log.info("~~> Quote status updated to ACCEPTED for quoteId: {}", quoteId);
        QuoteAcceptedEvent acceptedEvent = new QuoteAcceptedEvent(
                targetQuote.getId(),
                targetQuote.getLeadId(),
                targetQuote.getAgentId(),
                LocalDateTime.now()
        );
        streamBridge.send(QUOTE_ACCEPTED_OUT, acceptedEvent);
        log.info("~~> QuoteAcceptedEvent published for quoteId: {}", quoteId);
        List<PropertyQuote> allQuotes = propertyQuoteRepo.findByLeadId(targetQuote.getLeadId());
        for (PropertyQuote quote : allQuotes) {
            if (!quote.getId().equals(quoteId) && quote.getStatus() == QuoteStatus.ACTIVE) {
                quote.setStatus(QuoteStatus.REJECTED);
                propertyQuoteRepo.save(quote);
                log.info("~~> Automatically REJECTED other quoteId: {}", quote.getId());
                QuoteRejectedEvent rejectedEvent = new QuoteRejectedEvent(
                        quote.getId(),
                        quote.getLeadId(),
                        quote.getAgentId(),
                        LocalDateTime.now()
                );
                streamBridge.send(QUOTE_REJECTED_OUT, rejectedEvent);
                log.info("~~> QuoteRejectedEvent published for auto-rejected quoteId: {}", quote.getId());
            }
        }
    }

    @Override
    @Transactional
    public void rejectQuote(Integer quoteId) {
        log.info("### Reject Quote id = {} ###", quoteId);
        PropertyQuote quote = propertyQuoteRepo.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException(QUOTE_NOT_FOUND_MSG + quoteId));
        quote.setStatus(QuoteStatus.REJECTED);
        propertyQuoteRepo.save(quote);
        log.info("~~> Quote status updated to REJECTED for quoteId: {}", quoteId);
        QuoteRejectedEvent event = new QuoteRejectedEvent(
                quote.getId(),
                quote.getLeadId(),
                quote.getAgentId(),
                LocalDateTime.now()
        );
        streamBridge.send(QUOTE_REJECTED_OUT, event);
        log.info("~~> QuoteRejectedEvent published for quoteId: {}", quoteId);
    }
}
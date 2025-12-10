package edu.hcmute.service;

import edu.hcmute.dto.PropertyQuoteDto;
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

    @Override
    @Transactional
    public PropertyQuoteDto createPropertyQuote(PropertyQuoteDto propertyQuoteDto) {
        log.info("### Create PropertyQuote for leadId = {} ###", propertyQuoteDto.leadId());
        Integer leadId = propertyQuoteDto.leadId();
        if (leadId == null) {
            throw new IllegalArgumentException("leadId is required to create a quote");
        }
        try {
            PropertyQuote propertyQuote = propertyQuoteMapper.toEntity(propertyQuoteDto);
            propertyQuote.setLeadId(leadId);
            if (propertyQuote.getValidUntil() == null) {
                propertyQuote.setValidUntil(LocalDate.now().plusDays(30));
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
    public PropertyQuoteDto updatePropertyQuote(Integer id, PropertyQuoteDto propertyQuoteDto) {
        log.info("### Update PropertyQuote by id = {} ###", id);
        PropertyQuote existingQuote = propertyQuoteRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(QUOTE_NOT_FOUND_MSG + id));
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
            throw new IllegalArgumentException(QUOTE_NOT_FOUND_MSG + id);
        }
        propertyQuoteRepo.deleteById(id);
        log.info("~~> PropertyQuote deleted with id: {}", id);
    }

    @Override
    @Transactional
    public void acceptQuote(Integer quoteId) {
        log.info("### Accept Quote id = {} ###", quoteId);
        PropertyQuote quote = propertyQuoteRepo.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException(QUOTE_NOT_FOUND_MSG + quoteId));
        QuoteAcceptedEvent event = new QuoteAcceptedEvent(
                quote.getId(),
                quote.getLeadId(),
                quote.getAgentId(),
                LocalDateTime.now()
        );
        streamBridge.send(QUOTE_ACCEPTED_OUT, event);
        log.info("~~> QuoteAcceptedEvent published for quoteId: {}", quoteId);
    }

    @Override
    @Transactional
    public void rejectQuote(Integer quoteId) {
        log.info("### Reject Quote id = {} ###", quoteId);
        PropertyQuote quote = propertyQuoteRepo.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException(QUOTE_NOT_FOUND_MSG + quoteId));
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
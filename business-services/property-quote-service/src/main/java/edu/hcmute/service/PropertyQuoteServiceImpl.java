package edu.hcmute.service;

import edu.hcmute.client.PropertyLeadFeignClient;
import edu.hcmute.domain.QuoteStatus;
import edu.hcmute.dto.CreateQuoteDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.dto.QuoteTrendDto;
import edu.hcmute.dto.UpdateQuoteDto;
import edu.hcmute.entity.Premium;
import edu.hcmute.entity.PropertyQuote;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PropertyQuoteRepo;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyQuoteServiceImpl implements PropertyQuoteService {
    private static final String QUOTE_NOT_FOUND = "PropertyQuote not found with id: ";
    private final PropertyQuoteRepo propertyQuoteRepo;
    private final PropertyQuoteMapper propertyQuoteMapper;
    private final PremiumCalculationService premiumCalculationService;
    private final PropertyLeadFeignClient propertyLeadFeignClient;

    @Override
    @Transactional
    public PropertyQuoteDto createPropertyQuote(CreateQuoteDto createDto) {
        log.info("### Create propertyQuote for leadId = {} ###", createDto.leadId());
        Integer leadId = createDto.leadId();
        if (leadId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "leadId is required to create a quote");
        }
        try {
            propertyLeadFeignClient.getLeadById(leadId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lead with id " + leadId + " does not exist.");
        }
        List<PropertyQuote> existingQuotes = propertyQuoteRepo.findByLeadId(leadId);
        boolean hasAcceptedQuote = existingQuotes.stream()
                .anyMatch(q -> q.getStatus() == QuoteStatus.ACCEPTED);
        if (hasAcceptedQuote) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot create new quote: Lead already has an accepted quote.");
        }
        boolean agentHasActiveQuote = existingQuotes.stream()
                .anyMatch(q -> q.getAgentId().equals(createDto.agentId()) && q.getStatus() == QuoteStatus.NEW);
        if (agentHasActiveQuote) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Agent " + createDto.agentId() + " already has a NEW quote for lead " + leadId + ". Please update the existing quote instead.");
        }
        PropertyQuote propertyQuote = propertyQuoteMapper.toEntity(createDto);
        propertyQuote.setLeadId(leadId);
        propertyQuote.setCreateDate(LocalDate.now());
        premiumCalculationService.validateQuoteCoverages(propertyQuote.getCoverages());
        Premium calculatedPremium = premiumCalculationService.calculatePremium(propertyQuote.getCoverages());
        propertyQuote.setPremium(calculatedPremium);
        log.info("~~> auto-calculated premium: net={}, tax={}, total={}",
                calculatedPremium.getNet(), calculatedPremium.getTax(), calculatedPremium.getTotal());
        if (propertyQuote.getStatus() == null) {
            propertyQuote.setStatus(QuoteStatus.NEW);
        }
        propertyQuote = propertyQuoteRepo.save(propertyQuote);
        log.info("~~> propertyQuote saved with id: {}", propertyQuote.getId());
        try {
            propertyLeadFeignClient.updateLeadStatus(leadId, "IN_REVIEW");
            log.info("~~> updated lead status to IN_REVIEW for leadId: {}", leadId);
        } catch (Exception e) {
            log.error("~~> failed to update lead status for leadId: {}", leadId, e);
        }
        return propertyQuoteMapper.toDto(propertyQuote);
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyQuoteDto getPropertyQuoteById(Integer id) {
        log.info("### Get propertyQuote by id = {} ###", id);
        PropertyQuote propertyQuote = propertyQuoteRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, QUOTE_NOT_FOUND + id));
        return propertyQuoteMapper.toDto(propertyQuote);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDto> getAllPropertyQuotes(String sortBy, String sortDirection, String status, String agentId) {
        log.info("### Get all propertyQuotes sorted by {} {} with status filter {} and agentId filter {} ###", sortBy, sortDirection, status, agentId);
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Sort sort = Sort.by(direction, sortBy);
        Specification<PropertyQuote> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(status)) {
                try {
                    QuoteStatus quoteStatus = QuoteStatus.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("status"), quoteStatus));
                } catch (IllegalArgumentException e) {
                    log.warn("~~> invalid status filter: {}", status);
                }
            }
            if (StringUtils.hasText(agentId)) {
                predicates.add(cb.equal(root.get("agentId"), agentId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        List<PropertyQuote> quotes = propertyQuoteRepo.findAll(spec, sort);
        log.info("~~> found {} propertyQuotes", quotes.size());
        return quotes.stream().map(propertyQuoteMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDto> getQuotesByLeadId(Integer leadId) {
        log.info("### Get propertyQuotes by leadId = {} ###", leadId);
        List<PropertyQuote> quotes = propertyQuoteRepo.findByLeadId(leadId);
        log.info("~~> found {} quotes for leadId: {}", quotes.size(), leadId);
        return quotes.stream().map(propertyQuoteMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyQuoteDto> getQuotesByAgentId(String agentId) {
        log.info("### Get propertyQuotes by agentId = {} ###", agentId);
        List<PropertyQuote> quotes = propertyQuoteRepo.findByAgentId(agentId);
        log.info("~~> found {} quotes for agentId: {}", quotes.size(), agentId);
        return quotes.stream().map(propertyQuoteMapper::toDto).toList();
    }

    @Override
    @Transactional
    public PropertyQuoteDto updatePropertyQuote(Integer id, UpdateQuoteDto updateDto) {
        log.info("### Update propertyQuote by id = {} ###", id);
        PropertyQuote existingQuote = propertyQuoteRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, QUOTE_NOT_FOUND + id));
        if (existingQuote.getStatus() != QuoteStatus.NEW) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update quote in " + existingQuote.getStatus() + " status. Only NEW quotes can be updated.");
        }
        propertyQuoteMapper.updateEntity(existingQuote, updateDto);
        premiumCalculationService.validateQuoteCoverages(existingQuote.getCoverages());
        Premium calculatedPremium = premiumCalculationService.calculatePremium(existingQuote.getCoverages());
        existingQuote.setPremium(calculatedPremium);
        log.info("~~> recalculated premium: total={}", calculatedPremium.getTotal());
        existingQuote = propertyQuoteRepo.save(existingQuote);
        log.info("~~> propertyQuote updated with id: {}", existingQuote.getId());
        return propertyQuoteMapper.toDto(existingQuote);
    }

    @Override
    @Transactional
    public void deletePropertyQuoteById(Integer id) {
        log.info("### Delete propertyQuote by id = {} ###", id);
        PropertyQuote quote = propertyQuoteRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, QUOTE_NOT_FOUND + id));
        if (quote.getStatus() == QuoteStatus.ACCEPTED || quote.getStatus() == QuoteStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete quote with status " + quote.getStatus());
        }
        propertyQuoteRepo.deleteById(id);
        log.info("~~> propertyQuote deleted with id: {}", id);
    }

    @Override
    @Transactional
    public void acceptQuote(Integer quoteId) {
        log.info("### Accept quote id = {} ###", quoteId);
        PropertyQuote targetQuote = propertyQuoteRepo.findById(quoteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, QUOTE_NOT_FOUND + quoteId));
        if (targetQuote.getStatus() != QuoteStatus.NEW) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quote cannot be accepted from state: " + targetQuote.getStatus());
        }
        boolean alreadyHasAccepted = propertyQuoteRepo.findByLeadId(targetQuote.getLeadId()).stream()
                .anyMatch(q -> q.getStatus() == QuoteStatus.ACCEPTED);
        if (alreadyHasAccepted) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lead already has an accepted quote. Cannot accept another one.");
        }
        targetQuote.setStatus(QuoteStatus.ACCEPTED);
        propertyQuoteRepo.save(targetQuote);
        log.info("~~> quote status updated to ACCEPTED for quoteId: {}", quoteId);
        try {
            propertyLeadFeignClient.updateLeadStatus(targetQuote.getLeadId(), "ACCEPTED");
            log.info("~~> updated lead status to ACCEPTED for leadId: {}", targetQuote.getLeadId());
        } catch (Exception e) {
            log.error("~~> failed to update lead status to ACCEPTED for leadId: {}. PROPAGATING ERROR to rollback.", targetQuote.getLeadId(), e);
            throw e;
        }
        List<PropertyQuote> allQuotes = propertyQuoteRepo.findByLeadId(targetQuote.getLeadId());
        for (PropertyQuote quote : allQuotes) {
            if (!quote.getId().equals(quoteId) && quote.getStatus() == QuoteStatus.NEW) {
                quote.setStatus(QuoteStatus.REJECTED);
                propertyQuoteRepo.save(quote);
                log.info("~~> automatically rejected other quoteId: {}", quote.getId());
            }
        }
    }

    @Override
    @Transactional
    public void rejectQuote(Integer quoteId) {
        log.info("### Reject quote id = {} ###", quoteId);
        PropertyQuote quote = propertyQuoteRepo.findById(quoteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, QUOTE_NOT_FOUND + quoteId));
        if (quote.getStatus() != QuoteStatus.NEW) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quote cannot be rejected from state: " + quote.getStatus());
        }
        quote.setStatus(QuoteStatus.REJECTED);
        propertyQuoteRepo.save(quote);
        log.info("~~> quote status updated to REJECTED for quoteId: {}", quoteId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteTrendDto> getQuoteTrend() {
        log.info("### Get quote trend last 7 days ###");
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);
        List<PropertyQuote> recentQuotes = propertyQuoteRepo.findByCreateDateGreaterThanEqual(startDate);
        Map<LocalDate, Long> trendMap = recentQuotes.stream()
                .collect(Collectors.groupingBy(
                        PropertyQuote::getCreateDate,
                        Collectors.counting()
                ));
        List<QuoteTrendDto> trendList = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            long count = trendMap.getOrDefault(date, 0L);
            trendList.add(new QuoteTrendDto(date, count));
        }
        return trendList;
    }
}
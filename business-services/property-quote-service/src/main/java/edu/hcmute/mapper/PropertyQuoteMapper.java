package edu.hcmute.mapper;

import edu.hcmute.dto.CoverageDto;
import edu.hcmute.dto.PremiumDto;
import edu.hcmute.dto.PropertyQuoteDto;
import edu.hcmute.entity.Coverage;
import edu.hcmute.entity.Premium;
import edu.hcmute.entity.PropertyQuote;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PropertyQuoteMapper {
    public PropertyQuote toEntity(PropertyQuoteDto dto) {
        if (dto == null) {
            return null;
        }
        PropertyQuote entity = PropertyQuote.builder()
                .leadId(dto.leadId())
                .agentId(dto.agentId())
                .validUntil(dto.validUntil())
                .startDate(dto.startDate())
                .endDate(dto.endDate())
                .propertyAddress(dto.propertyAddress())
                .sumInsured(dto.sumInsured())
                .plan(dto.plan())
                .status(dto.status())
                .build();
        if (dto.coverages() != null) {
            List<Coverage> coverages = new ArrayList<>();
            for (CoverageDto coverageDto : dto.coverages()) {
                Coverage coverage = new Coverage();
                coverage.setCode(coverageDto.code());
                coverage.setCoverageLimit(coverageDto.limit());
                coverage.setDeductible(coverageDto.deductible());
                coverages.add(coverage);
            }
            entity.setCoverages(coverages);
        }
        if (dto.premium() != null) {
            entity.setPremium(new Premium(
                    dto.premium().net(),
                    dto.premium().tax(),
                    dto.premium().total()
            ));
        }
        return entity;
    }

    public PropertyQuoteDto toDto(PropertyQuote entity) {
        if (entity == null) {
            return null;
        }
        List<CoverageDto> coverageDtos = new ArrayList<>();
        if (entity.getCoverages() != null) {
            for (Coverage coverage : entity.getCoverages()) {
                coverageDtos.add(new CoverageDto(
                        coverage.getId(),
                        coverage.getCode(),
                        coverage.getCoverageLimit(),
                        coverage.getDeductible()
                ));
            }
        }
        PremiumDto premiumDto = entity.getPremium() != null
                ? new PremiumDto(entity.getPremium().getNet(), entity.getPremium().getTax(), entity.getPremium().getTotal())
                : null;
        return new PropertyQuoteDto(
                entity.getId(),
                entity.getLeadId(),
                entity.getAgentId(),
                entity.getValidUntil(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getPropertyAddress(),
                entity.getSumInsured(),
                entity.getPlan(),
                entity.getStatus(),
                coverageDtos,
                premiumDto
        );
    }
}
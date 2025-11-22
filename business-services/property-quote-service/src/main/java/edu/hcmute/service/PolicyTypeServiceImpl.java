package edu.hcmute.service;

import edu.hcmute.dto.PolicyTypeDto;
import edu.hcmute.entity.PolicyType;
import edu.hcmute.mapper.PropertyQuoteMapper;
import edu.hcmute.repo.PolicyTypeRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PolicyTypeServiceImpl implements PolicyTypeService {
    private final PolicyTypeRepo repo;
    private final PropertyQuoteMapper propertyQuoteMapper;

    @Override
    public PolicyTypeDto createPolicyType(PolicyTypeDto policyTypeDto) {
        log.info("### Create PolicyType ###");
        log.info("~~> policyTypeDto: {}", policyTypeDto.toString());
        try {
            PolicyType policyType = propertyQuoteMapper.toEntity(policyTypeDto);
            policyType = repo.save(policyType);
            log.info("~~> policyType saved with id: {}", policyType.getId());
            return mapModelToDto(policyType);
        } catch (Exception e) {
            log.error("~~> error creating PolicyType: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public PolicyTypeDto getPolicyTypeById(Integer id) {
        log.info("### Get PolicyType by Id ###");
        log.info("~~> policyTypeDto id: {}", id);
        PolicyType policyType = repo.findById(id)
                .orElseThrow(() -> {
                    log.warn("~~> no PolicyType found with id: {}", id);
                    return new RuntimeException("~~> no PolicyType found with id: " + id);
                });
        return mapModelToDto(policyType);
    }

    @Override
    public List<PolicyTypeDto> getAllPolicyTypes() {
        log.info("### Get All PolicyTypes ###");
        List<PolicyType> policyTypeList = repo.findAll();
        if (policyTypeList.isEmpty()) {
            log.warn("~~> no PolicyTypes found in database");
            throw new RuntimeException("~~> no PolicyTypes found in database");
        }
        log.info("~~> found {} PolicyTypes", policyTypeList.size());
        return policyTypeList.stream()
                .map(this::mapModelToDto)
                .toList();
    }

    private PolicyTypeDto mapModelToDto(PolicyType policyType) {
        return propertyQuoteMapper.toDto(policyType);
    }
}
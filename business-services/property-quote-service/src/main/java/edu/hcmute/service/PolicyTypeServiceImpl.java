package edu.hcmute.service;

import edu.hcmute.dto.CoverageTypeDto;
import edu.hcmute.dto.PerilTypeDto;
import edu.hcmute.dto.PolicyTypeDto;
import edu.hcmute.entity.PolicyType;
import edu.hcmute.repo.PolicyTypeRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PolicyTypeServiceImpl implements PolicyTypeService {
    private final PolicyTypeRepo repo;
    private final ModelMapper modelMapper;

    @Override
    public PolicyTypeDto createPolicyType(PolicyTypeDto policyTypeDto) {
        log.info("### Create PolicyType ###");
        log.info("PolicyTypeDto: {}", policyTypeDto.toString());
        try {
            PolicyType policyType = modelMapper.map(policyTypeDto, PolicyType.class);
            policyType = repo.save(policyType);
            log.info("PolicyType saved with id: {}", policyType.getId());
            return mapModelToDto(policyType);
        } catch (Exception e) {
            log.error("Error creating PolicyType: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public PolicyTypeDto getPolicyTypeById(Integer id) {
        log.info("### Get PolicyType by Id ###");
        log.info("PolicyTypeDto id: {}", id);
        PolicyType policyType = repo.findById(id)
                .orElseThrow(() -> {
                    log.warn("No PolicyType found with id: {}", id);
                    return new RuntimeException("No PolicyType found with id: " + id);
                });
        return mapModelToDto(policyType);
    }

    @Override
    public List<PolicyTypeDto> getAllPolicyTypes() {
        log.info("### Get All PolicyTypes ###");
        List<PolicyType> policyTypeList = repo.findAll();
        if (policyTypeList.isEmpty()) {
            log.warn("No PolicyTypes found in database");
            throw new RuntimeException("No PolicyTypes found in database");
        }
        log.info("Found {} PolicyTypes", policyTypeList.size());
        return policyTypeList.stream()
                .map(this::mapModelToDto)
                .toList();
    }

    private PolicyTypeDto mapModelToDto(PolicyType policyType) {
        PolicyTypeDto policyTypeDto = new PolicyTypeDto();
        policyTypeDto.setId(policyType.getId());
        policyTypeDto.setType(policyType.getType());
        if (policyType.getCoverageType() != null) {
            CoverageTypeDto coverageTypeDto = new CoverageTypeDto();
            coverageTypeDto.setId(policyType.getCoverageType().getId());
            coverageTypeDto.setType(policyType.getCoverageType().getType());

            if (!CollectionUtils.isEmpty(policyType.getCoverageType().getPerilTypeList())) {
                List<PerilTypeDto> perilTypeDtoList = policyType.getCoverageType()
                        .getPerilTypeList()
                        .stream()
                        .map(perilType -> {
                            PerilTypeDto perilTypeDto = new PerilTypeDto();
                            perilTypeDto.setId(perilType.getId());
                            perilTypeDto.setType(perilType.getType());
                            return perilTypeDto;
                        })
                        .toList();
                coverageTypeDto.setPerilTypeList(perilTypeDtoList);
            }
            policyTypeDto.setCoverageTypeDto(coverageTypeDto);
        }
        return policyTypeDto;
    }
}
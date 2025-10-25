package edu.hcmute.service;

import edu.hcmute.dto.PolicyTypeDto;

import java.util.List;

public interface PolicyTypeService {
    PolicyTypeDto createPolicyType(PolicyTypeDto policyTypeDto);

    PolicyTypeDto getPolicyTypeById(Integer id);

    List<PolicyTypeDto> getAllPolicyTypes();
}
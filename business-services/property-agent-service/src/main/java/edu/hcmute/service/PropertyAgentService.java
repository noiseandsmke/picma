package edu.hcmute.service;

import java.util.List;

public interface PropertyAgentService {
    List<String> fetchAgentWithinZipCode(String propertyId, int leadId);
}
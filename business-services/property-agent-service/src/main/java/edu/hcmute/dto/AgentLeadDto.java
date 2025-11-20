package edu.hcmute.dto;

import edu.hcmute.domain.LeadAction;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class AgentLeadDto implements Serializable {
    @Serial
    private static final long serialVersionUID = 2166497869557129968L;

    private int id;
    private LeadAction leadAction;
    private int agentId;
    private int leadId;
}
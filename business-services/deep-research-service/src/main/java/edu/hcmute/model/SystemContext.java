package edu.hcmute.model;

import edu.hcmute.dto.PropertyInfoDto;
import edu.hcmute.dto.QuoteDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@RedisHash("research_context")
public class SystemContext implements Serializable {
    @Id
    private String id;
    private String goal;
    private PropertyInfoDto propertyInfo;
    private List<QuoteDto> quotes;
    private List<String> findings = new ArrayList<>();
    private List<String> history = new ArrayList<>();

    public SystemContext(String id, String goal, PropertyInfoDto propertyInfo, List<QuoteDto> quotes) {
        this.id = id;
        this.goal = goal;
        this.propertyInfo = propertyInfo;
        this.quotes = quotes;
    }

    public void addFindings(String finding) {
        findings.add(finding);
    }

    public void addToHistory(String event) {
        history.add(event);
    }

    public String toPromptString() {
        StringBuilder sb = new StringBuilder();
        sb.append("GOAL: ").append(goal).append("\n\n");
        sb.append("PROPERTY: ").append(propertyInfo).append("\n\n");
        if (quotes != null && !quotes.isEmpty()) {
            sb.append("EXISTING AGENT QUOTES: ").append(quotes).append("\n\n");
        }
        sb.append("HISTORY (What you have done so far):\n").append(String.join("\n", history)).append("\n\n");
        sb.append("FINDINGS (Knowledge Base):\n").append(String.join("\n", findings));
        return sb.toString();
    }
}
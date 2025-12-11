package edu.hcmute.model;

import java.util.List;

public record ResearchPlan(String mainGoal, List<String> stepByStepPlan, List<String> requiredSearchQueries) {
}
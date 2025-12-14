export enum CoverageCode {
    FIRE = "FIRE",
    THEFT = "THEFT",
    NATURAL_DISASTER = "NATURAL_DISASTER"
}

export const COVERAGE_CONFIG = {
    FIRE: {
        label: "Fire & Explosion",
        mandatory: true,
        description: "Coverage for fire and explosion damage"
    },
    THEFT: {
        label: "Theft & Burglary",
        mandatory: false,
        description: "Protection against theft and burglary"
    },
    NATURAL_DISASTER: {
        label: "Natural Disaster",
        mandatory: false,
        description: "Coverage for floods, earthquakes, storms"
    }
};

export enum LeadStatus {
    ACTIVE = "ACTIVE",
    IN_REVIEWING = "IN_REVIEWING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}

export enum ConstructionType {
    WOOD = 'WOOD',
    CONCRETE = 'CONCRETE',
    HYBRID = 'HYBRID'
}

export const COVERAGE_CODES = Object.values(CoverageCode);
export const LEAD_STATUSES = Object.values(LeadStatus);
export const CONSTRUCTION_TYPES = [
    { value: ConstructionType.WOOD, label: 'Wood Frame' },
    { value: ConstructionType.CONCRETE, label: 'Concrete' },
    { value: ConstructionType.HYBRID, label: 'Hybrid' }
];
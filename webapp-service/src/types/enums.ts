export enum CoverageCode {
    FIRE = "FIRE",
    THEFT = "THEFT",
    FLOOD = "FLOOD",
    EARTHQUAKE = "EARTHQUAKE",
    WINDSTORM = "WINDSTORM",
    LIABILITY = "LIABILITY"
}

export enum PlanType {
    BASIC = "BASIC",
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    GOLD = "GOLD",
    PLATINUM = "PLATINUM",
    SILVER = "SILVER"
}

export enum LeadStatus {
    ACTIVE = "ACTIVE",
    IN_REVIEWING = "IN_REVIEWING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}

export enum ConstructionType {
    WOOD = "WOOD",
    BRICK = "BRICK",
    CONCRETE = "CONCRETE",
    STEEL = "STEEL",
    STONE = "STONE",
    OTHER = "OTHER"
}

export enum OccupancyType {
    OWNER = "OWNER",
    TENANT = "TENANT",
    VACANT = "VACANT",
    COMMERCIAL = "COMMERCIAL",
    MIXED = "MIXED"
}

export const COVERAGE_CODES = Object.values(CoverageCode);
export const PLAN_TYPES = Object.values(PlanType);
export const LEAD_STATUSES = Object.values(LeadStatus);
export const CONSTRUCTION_TYPES = Object.values(ConstructionType);
export const OCCUPANCY_TYPES = Object.values(OccupancyType);
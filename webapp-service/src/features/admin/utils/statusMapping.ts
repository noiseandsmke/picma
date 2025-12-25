export const LEAD_STATUS_CONFIG: Record<string, {
    label: string;
    value: string;
    className: string;
    dotClass: string
}> = {
    NEW: {
        label: "New",
        value: "NEW",
        className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
        dotClass: "bg-emerald-500"
    },
    IN_REVIEW: {
        label: "In Review",
        value: "IN_REVIEW",
        className: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20",
        dotClass: "bg-amber-500"
    },
    ACCEPTED: {
        label: "Accepted",
        value: "ACCEPTED",
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
        dotClass: "bg-blue-500"
    }
};
export const QUOTE_STATUS_CONFIG: Record<string, {
    label: string;
    value: string;
    className: string;
    dotClass: string
}> = {
    NEW: {
        label: "New",
        value: "NEW",
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
        dotClass: "bg-blue-500"
    },
    ACCEPTED: {
        label: "Accepted",
        value: "ACCEPTED",
        className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
        dotClass: "bg-primary"
    },
    REJECTED: {
        label: "Rejected",
        value: "REJECTED",
        className: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
        dotClass: "bg-red-500"
    }
};
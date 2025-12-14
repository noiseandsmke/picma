import React from 'react';
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {cn, formatCurrency} from "@/lib/utils";
import {COVERAGE_CONFIG, CoverageCode} from "@/types/enums";
import {CoverageDto} from "@/features/admin/services/quoteService";

interface CoverageDetailCardProps {
    coverage: CoverageDto;
    className?: string;
}

export const CoverageDetailCard: React.FC<CoverageDetailCardProps> = ({
                                                                          coverage,
                                                                          className
                                                                      }) => {
    const code = coverage.code as CoverageCode;
    const config = COVERAGE_CONFIG[code];

    if (!config) return null;

    const COVERAGE_STYLES: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
        [CoverageCode.FIRE]: {
            gradient: "from-orange-500 to-red-600",
            bg: "bg-orange-500/10",
            text: "text-orange-400",
            border: "border-orange-500/30"
        },
        [CoverageCode.THEFT]: {
            gradient: "from-blue-500 to-indigo-600",
            bg: "bg-blue-500/10",
            text: "text-blue-400",
            border: "border-blue-500/30"
        },
        [CoverageCode.NATURAL_DISASTER]: {
            gradient: "from-purple-500 to-pink-600",
            bg: "bg-purple-500/10",
            text: "text-purple-400",
            border: "border-purple-500/30"
        }
    };

    const styles = COVERAGE_STYLES[code] || COVERAGE_STYLES[CoverageCode.FIRE];

    return (
        <Card className={cn(
            "overflow-hidden border transition-all duration-200 hover:bg-slate-900/80",
            styles.bg, styles.border,
            className
        )}>
            <div className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center text-xl shrink-0 bg-slate-950/50",
                        styles.border
                    )}>
                        <span className={cn("text-lg", styles.text)}>#{code.substring(0, 1)}</span>
                    </div>
                    <div>
                        <h4 className={cn("font-medium flex items-center gap-2", styles.text)}>
                            {config.label}
                            {config.mandatory && (
                                <Badge variant="secondary"
                                       className="h-5 text-[10px] bg-slate-900/50 text-slate-400 border-0">
                                    Mandatory
                                </Badge>
                            )}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {config.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-4 grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Limit</p>
                    <p className="font-mono text-sm font-medium text-slate-200">
                        {formatCurrency(coverage.limit)}
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Deductible</p>
                    <p className="font-mono text-sm font-medium text-slate-200">
                        {formatCurrency(coverage.deductible)}
                    </p>
                </div>
            </div>
        </Card>
    );
};
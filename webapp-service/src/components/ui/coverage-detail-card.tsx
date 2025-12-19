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
            <div className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-sm shrink-0 bg-slate-950/50",
                        styles.border
                    )}>
                        <span className={cn("font-bold", styles.text)}>#{code.substring(0, 1)}</span>
                    </div>
                    <div>
                        <h4 className={cn("text-sm font-medium flex items-center gap-2", styles.text)}>
                            {config.label}
                            {config.mandatory && (
                                <Badge variant="secondary"
                                       className="h-4 text-[9px] px-1.5 bg-slate-900/50 text-slate-400 border-0">
                                    Required
                                </Badge>
                            )}
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                     <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Limit</p>
                        <p className="font-mono font-medium text-slate-200">{formatCurrency(coverage.limit)}</p>
                    </div>
                    <div className="text-right pl-4 border-l border-slate-700/50">
                        <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Deductible</p>
                        <p className="font-mono font-medium text-slate-200">{(coverage.deductible * 100).toFixed(1)}%</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
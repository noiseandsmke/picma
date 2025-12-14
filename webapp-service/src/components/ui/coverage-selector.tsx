import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { COVERAGE_CONFIG, CoverageCode } from "@/types/enums";
import { cn, formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface CoverageSelection {
    code: CoverageCode;
    limit: number;
    deductible: number;
}

interface CoverageSelectorProps {
    value: CoverageSelection[];
    onChange: (coverages: CoverageSelection[]) => void;
    className?: string;
}

export const CoverageSelector: React.FC<CoverageSelectorProps> = ({
    value,
    onChange,
    className
}) => {
    const addCoverage = (code: CoverageCode) => {
        const newCoverage: CoverageSelection = {
            code,
            limit: 1000000000,
            deductible: 10000000
        };
        onChange([...value, newCoverage]);
    };

    const removeCoverage = (code: CoverageCode) => {
        onChange(value.filter(c => c.code !== code));
    };

    const handleToggle = (code: CoverageCode, checked: boolean) => {
        if (checked) {
            addCoverage(code);
        } else {
            removeCoverage(code);
        }
    };

    const handleUpdate = (code: CoverageCode, field: 'limit' | 'deductible', amount: number) => {
        const newValue = value.map(c => {
            if (c.code === code) {
                return { ...c, [field]: amount };
            }
            return c;
        });
        onChange(newValue);
    };

    const getSelection = (code: CoverageCode) => value.find(c => c.code === code);

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

    return (
        <div className={cn("space-y-4", className)}>
            {(Object.keys(COVERAGE_CONFIG) as CoverageCode[]).map((code) => {
                const config = COVERAGE_CONFIG[code];
                const styles = COVERAGE_STYLES[code];
                const selection = getSelection(code);
                const isSelected = !!selection;
                const isMandatory = config.mandatory;

                return (
                    <Card
                        key={code}
                        className={cn(
                            "transition-all duration-200 border",
                            isSelected ? `${styles.bg} ${styles.border}` : "bg-slate-900/50 border-slate-800"
                        )}
                    >
                        <div className="p-4">
                            <div className="flex items-start gap-4">
                                <div className="pt-1">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => handleToggle(code, checked === true)}
                                        disabled={isMandatory}
                                        className={cn(
                                            "data-[state=checked]:bg-slate-200 data-[state=checked]:text-slate-900",
                                            isMandatory && "opacity-50 cursor-not-allowed"
                                        )}
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Label className={cn("text-base font-medium text-slate-200")}>
                                            {config.label}
                                        </Label>
                                        {isMandatory && (
                                            <span
                                                className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                                                Mandatory
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400">{config.description}</p>
                                </div>
                            </div>

                            {isSelected && selection && (
                                <div
                                    className="mt-4 pl-10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-slate-400 uppercase tracking-wider">
                                            Limit of Liability
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={selection.limit}
                                                onChange={(e) => handleUpdate(code, 'limit', Number(e.target.value))}
                                                className="bg-slate-950 border-slate-700 text-slate-200 font-mono pl-3 pr-12"
                                                min={0}
                                            />
                                            <span
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">VND</span>
                                        </div>
                                        <p className="text-xs text-slate-500 text-right">
                                            {formatCurrency(selection.limit)}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-slate-400 uppercase tracking-wider">
                                            Deductible
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={selection.deductible}
                                                onChange={(e) => handleUpdate(code, 'deductible', Number(e.target.value))}
                                                className="bg-slate-950 border-slate-700 text-slate-200 font-mono pl-3 pr-12"
                                                min={0}
                                            />
                                            <span
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">VND</span>
                                        </div>
                                        {selection.deductible >= selection.limit && (
                                            <p className="text-xs text-red-400">Must be less than limit</p>
                                        )}
                                        <p className="text-xs text-slate-500 text-right">
                                            {formatCurrency(selection.deductible)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};
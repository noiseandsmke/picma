import React from 'react';
import {ResearchReport} from '../services/deepResearchService';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {AlertTriangle, Check, TrendingUp, Waves} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {formatCurrency} from '@/lib/utils';

interface ResearchReportViewProps {
    report: ResearchReport;
}

export const ResearchReportView: React.FC<ResearchReportViewProps> = ({report}) => {
    const getRiskColor = (level?: string) => {
        switch (level) {
            case 'HIGH':
                return 'text-red-400 bg-red-900/20 border-red-900/50';
            case 'MEDIUM':
                return 'text-amber-400 bg-amber-900/20 border-amber-900/50';
            case 'LOW':
                return 'text-emerald-400 bg-emerald-900/20 border-emerald-900/50';
            default:
                return 'text-slate-400 bg-slate-800';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-white">
                            <TrendingUp className="h-5 w-5 text-indigo-400"/>
                            Market Valuation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm text-slate-400">Estimated Value</div>
                            <div className="text-3xl font-bold text-white">
                                {formatCurrency(report.valuation.estimatedValue)}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                ~ {formatCurrency(report.valuation.pricePerM2)} / m²
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs font-medium text-slate-400 uppercase">Trend</div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={
                                    report.marketAnalysis.trend === 'RISING' ? 'text-emerald-400 border-emerald-500/30' :
                                        report.marketAnalysis.trend === 'FALLING' ? 'text-red-400 border-red-500/30' :
                                            'text-blue-400 border-blue-500/30'
                                }>
                                    {report.marketAnalysis.trend}
                                </Badge>
                                <span
                                    className="text-xs text-slate-500">Demand: {report.marketAnalysis.demandLevel}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-white">
                            <AlertTriangle className="h-5 w-5 text-amber-400"/>
                            Risk Assessment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50">
                            <div className="flex items-center gap-2">
                                <Waves className="h-4 w-4 text-blue-400"/>
                                <span className="text-sm text-slate-300">Flood Risk</span>
                            </div>
                            <Badge variant="outline"
                                   className={`border ${getRiskColor(report.riskAssessment.floodRiskLevel)}`}>
                                {report.riskAssessment.floodRiskLevel}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                            {report.riskAssessment.floodDetails}
                        </p>
                        {report.riskAssessment.nearbyHazards.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-xs font-medium text-slate-400 uppercase">Hazards</div>
                                <div className="flex flex-wrap gap-2">
                                    {report.riskAssessment.nearbyHazards.map((hazard, i) => (
                                        <Badge key={i} variant="secondary"
                                               className="text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700">
                                            {hazard}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                        <Check className="h-5 w-5 text-emerald-400"/>
                        AI Recommendation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Recommended Coverage</span>
                        <span className="text-xl font-bold text-emerald-400">
                            {formatCurrency(report.quoteRecommendation.recommendedSumInsured)}
                        </span>
                    </div>
                    <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                        <p className="text-sm text-slate-300 leading-relaxed italic">
                            "{report.quoteRecommendation.reasoning}"
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
import React from 'react';
import {ResearchReport} from '../services/deepResearchService';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Sparkles} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResearchReportViewProps {
    report: ResearchReport;
    hideTitle?: boolean;
}

export const ResearchReportView: React.FC<ResearchReportViewProps> = ({report, hideTitle = false}) => {
    return (
        <Card className="bg-[#0c0c14] border-indigo-500/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {!hideTitle && (
                <CardHeader className="border-b border-indigo-500/10 bg-indigo-500/5">
                    <CardTitle className="flex items-center gap-2 text-xl text-white">
                        <Sparkles className="h-5 w-5 text-indigo-400"/>
                        AI Research Report
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent className="p-6">
                <div className="prose prose-sm prose-invert max-w-none text-slate-300">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mb-4 mt-6 border-b border-slate-700 pb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-indigo-400 mb-3 mt-5" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-200 mb-2 mt-4" {...props} />,
                            p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-sm" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="text-sm" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-slate-100" {...props} />,
                            table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full text-sm border-collapse" {...props} /></div>,
                            th: ({node, ...props}) => <th className="border border-slate-700 bg-slate-800 p-2 text-left font-semibold text-slate-200" {...props} />,
                            td: ({node, ...props}) => <td className="border border-slate-700 p-2 text-slate-300" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 py-1 my-4 italic text-slate-400 bg-indigo-500/5 rounded-r" {...props} />
                        }}
                    >
                        {report}
                    </ReactMarkdown>
                </div>
            </CardContent>
        </Card>
    );
};
import React, {useState} from 'react';
import {Brain, ChevronUp} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';

interface ThinkingBlockProps {
    content: string;
}

interface ThoughtSection {
    title: string;
    content: string;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({content}) => {
    const [isMainExpanded, setIsMainExpanded] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const parseSections = (text: string): ThoughtSection[] => {
        const sections: ThoughtSection[] = [];
        const regex = /(?:^|\n\n)\*\*(.*?)\*\*\n\n([\s\S]*?)(?=(?:^|\n\n)\*\*|$)/g;

        let match;

        while ((match = regex.exec(text)) !== null) {
            sections.push({
                title: match[1].trim(),
                content: match[2].trim()
            });
        }

        if (sections.length === 0 && text.trim()) {
            sections.push({
                title: "Thinking Process",
                content: text.trim()
            });
        }

        return sections;
    };

    const sections = parseSections(content);
    const toggleSection = (title: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const expandAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        const allExpanded = sections.reduce((acc, section) => ({...acc, [section.title]: true}), {});
        setExpandedSections(allExpanded);
    };

    const collapseAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedSections({});
    };

    return (
        <div className="border border-indigo-100 rounded-xl bg-white overflow-hidden mb-4 shadow-sm">
            <div
                role="button"
                tabIndex={0}
                onClick={() => setIsMainExpanded(!isMainExpanded)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsMainExpanded(!isMainExpanded);
                    }
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all cursor-pointer border-b border-indigo-50"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-indigo-100 shadow-lg">
                        <Brain className="w-4 h-4"/>
                    </div>
                    <span className="font-semibold text-indigo-600 tracking-tight text-sm">Thought</span>
                </div>

                <div className="flex items-center gap-4">
                    {isMainExpanded && (
                        <div className="hidden sm:flex items-center gap-4 mr-2">
                            <button
                                onClick={expandAll}
                                className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
                            >
                                Expand All
                            </button>
                            <div className="w-[1px] h-3 bg-slate-200"/>
                            <button
                                onClick={collapseAll}
                                className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
                            >
                                Collapse All
                            </button>
                        </div>
                    )}
                    <div className={`transition-transform duration-200 ${isMainExpanded ? 'rotate-0' : 'rotate-180'}`}>
                        <ChevronUp className="w-5 h-5 text-slate-400"/>
                    </div>
                </div>
            </div>

            {isMainExpanded && (
                <div className="p-4 space-y-3 bg-slate-100/30">
                    {sections.map((section) => (
                        <div key={section.title}
                             className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all hover:shadow-md hover:border-indigo-100">
                            <button
                                onClick={() => toggleSection(section.title)}
                                className="w-full flex items-center justify-between p-4 hover:bg-indigo-50/20 transition-colors text-left"
                                aria-expanded={expandedSections[section.title] || false}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
                                        <Brain className="w-4 h-4"/>
                                    </div>
                                    <span
                                        className="font-semibold text-slate-800 text-sm tracking-tight">{section.title}</span>
                                </div>
                                <div
                                    className={`transition-transform duration-200 ${expandedSections[section.title] ? 'rotate-0' : 'rotate-180'}`}>
                                    <ChevronUp className="w-4 h-4 text-slate-300"/>
                                </div>
                            </button>

                            {expandedSections[section.title] && (
                                <div className="p-4 pt-0 text-sm text-slate-600 bg-white">
                                    <div
                                        className="prose prose-sm max-w-none text-slate-600 prose-headings:text-indigo-700 prose-strong:text-indigo-900 border-t border-slate-50 pt-4">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath, remarkBreaks]}
                                            rehypePlugins={[rehypeKatex]}
                                        >{section.content}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
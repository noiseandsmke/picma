import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ThinkingBlockProps {
    content: string;
}

interface ThoughtSection {
    title: string;
    content: string;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ content }) => {
    const [isMainExpanded, setIsMainExpanded] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

    // Parse content into sections based on **Title** headers
    const parseSections = (text: string): ThoughtSection[] => {
        const sections: ThoughtSection[] = [];
        // Split by lines that start with ** and end with ** (loosely)
        // actually looking at the stream, it's usually **Title**\nContent
        // We can use a regex to capture Title and Content pairs
        // Pattern: **Title** followed by content until next ** or end of string
        const regex = /\*\*(.*?)\*\*([\s\S]*?)(?=\*\*|$)/g;
        
        let match;
        // If text doesn't start with **, handle preamble? 
        // For now, let's just run the regex.
        
        while ((match = regex.exec(text)) !== null) {
            sections.push({
                title: match[1].trim(),
                content: match[2].trim()
            });
        }

        // If no sections found but there is content, treat entire content as one section with default title
        if (sections.length === 0 && text.trim()) {
             sections.push({
                title: "Thinking Process",
                content: text.trim()
            });
        }
        
        return sections;
    };

    const sections = parseSections(content);
    const toggleSection = (index: number) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const expandAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        const allExpanded = sections.reduce((acc, _, idx) => ({...acc, [idx]: true}), {});
        setExpandedSections(allExpanded);
    };

    const collapseAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedSections({});
    };

    return (
        <div className="border border-indigo-500/20 rounded-lg bg-indigo-500/5 overflow-hidden mb-4">
            {/* Main Header */}
            <div 
                onClick={() => setIsMainExpanded(!isMainExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-indigo-500/10 transition-colors cursor-pointer border-b border-indigo-500/10"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/20 p-1.5 rounded-md text-indigo-400">
                        <Brain className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-indigo-300 text-sm">Thought</span>
                </div>
                
                <div className="flex items-center gap-2">
                    {isMainExpanded && (
                        <div className="flex items-center gap-1 mr-2">
                             <button 
                                onClick={expandAll}
                                className="text-xs text-indigo-400 hover:text-white px-2 py-1 rounded hover:bg-indigo-500/20 transition-colors"
                            >
                                Expand All
                            </button>
                            <span className="text-slate-600">|</span>
                            <button 
                                onClick={collapseAll}
                                className="text-xs text-indigo-400 hover:text-white px-2 py-1 rounded hover:bg-indigo-500/20 transition-colors"
                            >
                                Collapse All
                            </button>
                        </div>
                    )}
                    {isMainExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                </div>
            </div>
            
            {/* Inner Content (List of Tiles) */}
            {isMainExpanded && (
                <div className="p-4 space-y-3 bg-black/20">
                    {sections.map((section, idx) => (
                        <div key={idx} className="border border-indigo-500/10 rounded-md overflow-hidden bg-indigo-500/5">
                            <button
                                onClick={() => toggleSection(idx)}
                                className="w-full flex items-center justify-between p-3 hover:bg-indigo-500/10 transition-colors text-left"
                            >
                                <div className="flex items-center gap-2">
                                     <Brain className="w-4 h-4 text-indigo-400 opacity-70" />
                                     <span className="text-slate-200 text-sm font-medium">{section.title}</span>
                                </div>
                                {expandedSections[idx] ? (
                                    <ChevronUp className="w-3 h-3 text-slate-500" />
                                ) : (
                                    <ChevronDown className="w-3 h-3 text-slate-500" />
                                )}
                            </button>
                            
                            {expandedSections[idx] && (
                                <div className="p-3 text-sm text-slate-300 border-t border-indigo-500/10 bg-black/10">
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{section.content}</ReactMarkdown>
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

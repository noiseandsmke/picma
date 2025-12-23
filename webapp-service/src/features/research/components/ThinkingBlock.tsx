import React, {useState} from 'react';
import {Brain, ChevronDown, ChevronUp} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
        <div className="border border-primary/20 rounded-lg bg-primary/5 overflow-hidden mb-4">
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
                className="w-full flex items-center justify-between p-3 hover:bg-primary/10 transition-colors cursor-pointer border-b border-primary/10"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-1.5 rounded-md text-primary">
                        <Brain className="w-4 h-4"/>
                    </div>
                    <span className="font-medium text-primary text-sm">Thought</span>
                </div>

                <div className="flex items-center gap-2">
                    {isMainExpanded && (
                        <div className="flex items-center gap-1 mr-2">
                            <button
                                onClick={expandAll}
                                className="text-xs text-primary hover:text-text-main px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                            >
                                Expand All
                            </button>
                            <span className="text-border-main">|</span>
                            <button
                                onClick={collapseAll}
                                className="text-xs text-primary hover:text-text-main px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                            >
                                Collapse All
                            </button>
                        </div>
                    )}
                    {isMainExpanded ? (
                        <ChevronUp className="w-4 h-4 text-text-muted"/>
                    ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted"/>
                    )}
                </div>
            </div>

            {isMainExpanded && (
                <div className="p-4 space-y-3 bg-black/20">
                    {sections.map((section) => (
                        <div key={section.title}
                             className="border border-primary/10 rounded-md overflow-hidden bg-primary/5">
                            <button
                                onClick={() => toggleSection(section.title)}
                                className="w-full flex items-center justify-between p-3 hover:bg-primary/10 transition-colors text-left"
                                aria-expanded={expandedSections[section.title] || false}
                            >
                                <div className="flex items-center gap-2">
                                    <Brain className="w-4 h-4 text-primary opacity-70"/>
                                    <span className="font-semibold text-text-main text-sm">{section.title}</span>
                                </div>
                                {expandedSections[section.title] ? (
                                    <ChevronUp className="w-3 h-3 text-text-muted"/>
                                ) : (
                                    <ChevronDown className="w-3 h-3 text-text-muted"/>
                                )}
                            </button>

                            {expandedSections[section.title] && (
                                <div className="p-3 text-sm text-text-secondary border-t border-primary/10 bg-muted/10">
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
import React, {useEffect, useRef, useState} from 'react';
import {Check, ChevronDown, Search} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Input} from '@/components/ui/input';

interface Option {
    value: string | number;
    label: string;
    sublabel?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value?: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    className?: string;
    isLoading?: boolean;
    disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
                                                                      options,
                                                                      value,
                                                                      onChange,
                                                                      placeholder = "Select...",
                                                                      className,
                                                                      isLoading = false,
                                                                      disabled = false
                                                                  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        opt.sublabel?.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val: string | number) => {
        if (disabled) return;
        onChange(val);
        setIsOpen(false);
        setSearch("");
    };

    const toggleOpen = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
    };

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <button
                type="button"
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-border-main bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer text-text-main",
                    isOpen && "ring-2 ring-primary ring-offset-2 border-primary/50",
                    disabled && "cursor-not-allowed opacity-50",
                    className
                )}
                onClick={toggleOpen}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls="searchable-struct-listbox"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleOpen();
                    }
                }}
            >
                <span className={cn(!selectedOption && "text-text-muted")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50"/>
            </button>

            {isOpen && !disabled && (
                <div
                    className="absolute z-50 mt-1 max-h-[300px] w-full min-w-[300px] overflow-hidden rounded-md border border-border-main bg-surface-main text-text-main shadow-md animate-in fade-in-0 zoom-in-95">
                    <div className="flex items-center border-b border-border-main px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50"/>
                        <Input
                            className="border-0 bg-transparent px-0 py-3 text-sm placeholder:text-text-muted focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div
                        className="max-h-[200px] overflow-y-auto p-1"
                        id="searchable-struct-listbox"
                        role="listbox">
                        {isLoading && <div className="py-6 text-center text-sm text-text-muted">Loading...</div>}
                        {!isLoading && filteredOptions.length === 0 && (
                            <div className="py-6 text-center text-sm text-text-muted">No results found.</div>
                        )}
                        {!isLoading && filteredOptions.length > 0 && (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    role="option"
                                    aria-selected={value === option.value}
                                    tabIndex={0}
                                    className={cn(
                                        "relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted hover:text-text-main cursor-pointer focus:bg-muted focus:text-text-main",
                                        value === option.value && "bg-muted text-text-main"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(option.value);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSelect(option.value);
                                        }
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{option.label}</span>
                                        {option.sublabel && (
                                            <span className="text-xs text-text-muted">{option.sublabel}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
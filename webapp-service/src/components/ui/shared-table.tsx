import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column {
    header: React.ReactNode;
    width?: string;
    className?: string;
    onClick?: () => void;
}

interface SharedTableProps {
    columns: Column[];
    children?: React.ReactNode;
    isLoading?: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
    className?: string;
    headerClassName?: string;
    rowClassName?: string;
}

const SharedTable: React.FC<SharedTableProps> = ({
    columns,
    children,
    isLoading,
    isEmpty,
    emptyMessage = "No data found.",
    className,
    headerClassName,
    rowClassName
}) => {
    return (
        <div className={cn("rounded-xl border border-white/5 bg-surface-card shadow-sm", className)}>
            <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                <colgroup>
                    {columns.map((col, index) => (
                        <col key={index} style={{ width: col.width || 'auto' }} />
                    ))}
                </colgroup>
                <TableHeader className={cn("bg-transparent border-b border-white/5 [&_th:last-child]:bg-transparent [&_th:last-child]:sticky [&_th:last-child]:right-0 [&_th:last-child]:z-10", headerClassName)}>
                    <TableRow className={cn("border-white/5 hover:bg-transparent", rowClassName)}>
                        {columns.map((col, index) => (
                            <TableHead
                                key={index}
                                className={cn("text-xs font-semibold text-slate-400 uppercase tracking-wider py-4", col.className, col.onClick && "cursor-pointer select-none")}
                                onClick={col.onClick}
                            >
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isEmpty && !isLoading ? (
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableCell
                                colSpan={columns.length}
                                className="h-32 text-center text-slate-500"
                            >
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-4xl text-slate-700">inbox</span>
                                    <p className="text-sm">{emptyMessage}</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        children
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default SharedTable;
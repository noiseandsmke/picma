import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {cn} from "@/lib/utils";

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
        <div className={cn("rounded-md border border-slate-800", className)}>
            <Table style={{tableLayout: 'fixed', width: '100%'}}>
                <colgroup>
                    {columns.map((col, index) => (
                        <col key={index} style={{width: col.width || 'auto'}}/>
                    ))}
                </colgroup>
                <TableHeader className={cn("bg-slate-900/50 border-slate-800", headerClassName)}>
                    <TableRow className={cn("border-slate-800 hover:bg-slate-900/50", rowClassName)}>
                        {columns.map((col, index) => (
                            <TableHead
                                key={index}
                                className={cn("text-slate-400", col.className, col.onClick && "cursor-pointer")}
                                onClick={col.onClick}
                            >
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isEmpty && !isLoading ? (
                        <TableRow className="border-slate-800">
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center text-slate-500"
                            >
                                {emptyMessage}
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
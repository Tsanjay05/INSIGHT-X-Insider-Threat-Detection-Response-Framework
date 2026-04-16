import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    VisibilityState,
} from "@tanstack/react-table";
import { cn } from "../../lib/utils";
import { Button } from "./Button";
import { Input } from "./Input";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    className?: string;
    searchable?: boolean;
    searchColumn?: string;
    filters?: { column: string; title: string; options: { label: string; value: string }[] }[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
    className,
    searchable = false,
    searchColumn,
    filters,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className={cn("space-y-4", className)}>
            {(searchable || filters) && (
                <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center space-x-2">
                        {searchable && searchColumn && (
                            <Input
                                placeholder={`Filter ${searchColumn}...`}
                                value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn(searchColumn)?.setFilterValue(event.target.value)
                                }
                                className="h-8 w-[150px] lg:w-[250px]"
                            />
                        )}
                        {/* Render extra filters here if needed */}
                    </div>
                    {/* View options here if needed */}
                </div>
            )}
            <div className="rounded-md border border-border-default overflow-hidden">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-bg-secondary [&_tr]:border-b [&_tr]:border-border-subtle">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b transition-colors hover:bg-bg-tertiary/50 data-[state=selected]:bg-bg-tertiary">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <th
                                                key={header.id}
                                                className="h-10 px-4 text-left align-middle font-medium text-text-secondary [&:has([role=checkbox])]:pr-0"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="border-b border-border-subtle transition-colors hover:bg-bg-tertiary/50 data-[state=selected]:bg-bg-tertiary"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-text-primary"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="h-24 text-center text-text-tertiary"
                                    >
                                        No results.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-text-tertiary">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

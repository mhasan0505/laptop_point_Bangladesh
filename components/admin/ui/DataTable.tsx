"use client";

import * as React from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "outline";
  onClick: (selectedRows: T[]) => void | Promise<void>;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKey?: keyof T | ((row: T) => string);
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  bulkActions?: BulkAction<T>[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  pageSize?: number;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchable = true,
  searchPlaceholder = "Search records...",
  searchKey,
  filters,
  actions,
  bulkActions,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = "No records found",
  emptyAction,
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);

  // Filter by search
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();

    return data.filter((row) => {
      if (searchKey) {
        if (typeof searchKey === "function") {
          return searchKey(row).toLowerCase().includes(q);
        }
        const val = row[searchKey];
        return String(val ?? "").toLowerCase().includes(q);
      }

      // Default: search all string / number fields
      return Object.values(row as Record<string, unknown>).some((val) =>
        String(val ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, searchQuery, searchKey]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      const comp = String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? comp : -comp;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handle sort header click
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Row selection
  const allPageKeysSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedKeys.has(keyExtractor(row)));

  const handleSelectAll = () => {
    const next = new Set(selectedKeys);
    if (allPageKeysSelected) {
      paginatedData.forEach((row) => next.delete(keyExtractor(row)));
    } else {
      paginatedData.forEach((row) => next.add(keyExtractor(row)));
    }
    setSelectedKeys(next);
  };

  const handleSelectRow = (key: string) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedKeys(next);
  };

  const selectedRows = React.useMemo(() => {
    return data.filter((row) => selectedKeys.has(keyExtractor(row)));
  }, [data, selectedKeys, keyExtractor]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="pl-8 text-xs sm:text-sm bg-card"
              />
            </div>
          )}
          {filters}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Bulk Action Bar */}
      {bulkActions && selectedKeys.size > 0 && (
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-primary/30 bg-primary/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {selectedKeys.size} {selectedKeys.size === 1 ? "item" : "items"} selected
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedKeys(new Set())}
              className="h-6 px-2 text-[11px]"
            >
              Deselect all
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <Button
                key={idx}
                type="button"
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => action.onClick(selectedRows)}
                className="h-7 text-xs"
              >
                {action.icon && <span className="mr-1.5">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {bulkActions && (
                  <th className="w-10 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={allPageKeysSelected}
                      onChange={handleSelectAll}
                      className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={cn(
                      "px-4 py-3.5 select-none",
                      col.sortable && "cursor-pointer hover:text-foreground",
                      col.className
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="shrink-0 text-muted-foreground/60">
                          {sortKey === col.key ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5 text-foreground" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-foreground" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (bulkActions ? 1 : 0)}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-xs">Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={columns.length + (bulkActions ? 1 : 0)}
                    className="py-12 text-center text-danger"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-6 w-6" />
                      <p className="text-sm font-medium">{error}</p>
                      {onRetry && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onRetry}
                          className="mt-2 text-xs"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (bulkActions ? 1 : 0)}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <Inbox className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
                      {emptyAction}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const key = keyExtractor(row);
                  const isSelected = selectedKeys.has(key);

                  return (
                    <tr
                      key={key}
                      className={cn(
                        "transition-colors hover:bg-muted/30",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      {bulkActions && (
                        <td className="w-10 px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(key)}
                            className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn("px-4 py-3 align-middle", col.className)}
                        >
                          {col.render
                            ? col.render(row, idx)
                            : String((row as Record<string, unknown>)[col.key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && !error && sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/80 bg-muted/20 text-xs text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-medium text-foreground">
                {Math.min(sortedData.length, (currentPage - 1) * pageSize + 1)}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(sortedData.length, currentPage * pageSize)}
              </span>{" "}
              of <span className="font-medium text-foreground">{sortedData.length}</span>{" "}
              results
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <span className="px-2 font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-7 px-2"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

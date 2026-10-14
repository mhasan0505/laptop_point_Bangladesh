import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  description?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  description,
  hint,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  const helpText = description || hint;
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label
            htmlFor={htmlFor}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"
          >
            {label}
            {required && <span className="text-danger">*</span>}
          </Label>
        </div>
      )}
      {children}
      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-danger transition-all animate-in fade-in-50">
          {error}
        </p>
      )}
    </div>
  );
}

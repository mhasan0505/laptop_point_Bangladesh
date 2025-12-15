import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

const spinnerContainerVariants = cva(
  "relative flex items-center justify-center",
  {
    variants: {
      size: {
        default: "h-12 w-12",
        sm: "h-8 w-8",
        lg: "h-16 w-16",
        xl: "h-24 w-24",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerContainerVariants> {}

export function LoadingSpinner({
  className,
  size,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className={cn(spinnerContainerVariants({ size }), className)}
      {...props}
    >
      {/* Outer Ring */}
      <motion.span className="block absolute inset-0 rounded-full border-[3px] border-primary/20" />

      {/* Spinning Segment */}
      <motion.span
        className="block absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          ease: "linear",
          repeat: Infinity,
        }}
      />

      {/* Inner Pulsing Dot */}
      <motion.div
        className="bg-primary rounded-full"
        style={{ width: "30%", height: "30%" }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      <span className="sr-only">Loading...</span>
    </div>
  );
}

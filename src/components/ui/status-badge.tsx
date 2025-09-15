
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "paused" | "draft" | "ended" | "pending" | "approved" | "rejected";
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const getStatusClasses = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-600 text-white hover:bg-yellow-700";
      case "approved":
        return "bg-green-600 text-white hover:bg-green-700";
      case "rejected":
        return "bg-red-600 text-white hover:bg-red-700";
      case "active":
        return "bg-green-600 text-white hover:bg-green-700";
      case "paused":
        return "bg-yellow-600 text-white hover:bg-yellow-700";
      case "draft":
        return "bg-gray-500 text-white hover:bg-gray-600";
      case "ended":
        return "bg-red-600 text-white hover:bg-red-700";
      default:
        return "bg-gray-500 text-white hover:bg-gray-600";
    }
  };

  // Capitalize first letter
  const displayText = typeof children === 'string' 
    ? children.charAt(0).toUpperCase() + children.slice(1).toLowerCase()
    : children;

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", getStatusClasses(), className)}>
      {displayText}
    </span>
  );
}

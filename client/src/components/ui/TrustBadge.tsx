import { ShieldCheck, CheckCircle2, Camera, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type BadgeType = "logbook" | "mileage" | "photos" | "price";

interface TrustBadgeProps {
  type: BadgeType;
  verified?: boolean;
  className?: string;
  showLabel?: boolean;
}

export default function TrustBadge({ type, verified = true, className, showLabel = true }: TrustBadgeProps) {
  const config = {
    logbook: {
      icon: FileCheck,
      label: "Logbook Verified",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      tooltip: "Ownership history and VIN matched with official records",
    },
    mileage: {
      icon: CheckCircle2, // Or a speedometer icon if available
      label: "Mileage Verified",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      tooltip: "Odometer reading consistent with service history and previous NCTs",
    },
    photos: {
      icon: Camera,
      label: "Live Photos",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      tooltip: "Photos verified for timestamp, location and consistency",
    },
    price: {
      icon: ShieldCheck,
      label: "Great Price",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      tooltip: "Priced accurately according to current market value",
    },
  };

  const { icon: Icon, label, color, bg, tooltip } = config[type];

  if (!verified) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-transparent transition-colors cursor-help",
            bg,
            color,
            className
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {showLabel && <span>{label}</span>}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

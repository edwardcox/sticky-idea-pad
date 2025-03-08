
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Priority } from '@/lib/data';

interface PriorityBadgeProps {
  priority: Priority;
  size?: number;
  onClick?: () => void;
  className?: string;
}

export function PriorityBadge({ 
  priority, 
  size = 20, 
  onClick,
  className 
}: PriorityBadgeProps) {
  const config = {
    urgent: {
      color: 'bg-priority-urgent text-white',
      label: 'Urgent'
    },
    action: {
      color: 'bg-priority-action text-white',
      label: 'Action'
    },
    normal: {
      color: 'bg-priority-normal text-white',
      label: 'Normal'
    }
  };

  const { color, label } = config[priority];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button 
            type="button"
            onClick={onClick}
            className={cn(
              "priority-button px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
              color,
              className
            )}
            aria-label={`Priority: ${label}. Click to change`}
          >
            {label}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-medium">Click to change priority</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

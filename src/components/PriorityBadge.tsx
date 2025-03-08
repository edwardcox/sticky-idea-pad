
import React from 'react';
import { CircleAlert, CircleCheck, CircleX } from 'lucide-react';
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
      icon: CircleX,
      color: 'text-priority-urgent',
      label: 'Urgent'
    },
    action: {
      icon: CircleAlert,
      color: 'text-priority-action',
      label: 'Action Required'
    },
    normal: {
      icon: CircleCheck,
      color: 'text-priority-normal',
      label: 'Normal'
    }
  };

  const { icon: Icon, color, label } = config[priority];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button 
            type="button"
            onClick={onClick}
            className={cn(
              "priority-indicator transition-transform duration-200 hover:scale-110",
              color,
              className
            )}
          >
            <Icon size={size} className="drop-shadow-sm" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-medium">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

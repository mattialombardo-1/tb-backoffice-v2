import { Braces } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CUSTOM_COMMANDS } from './constants';

interface CustomCommandsPaletteProps {
  mode: 'full' | 'compact';
  onInsert: (token: string) => void;
  disabled?: boolean;
}

export function CustomCommandsPalette({ mode, onInsert, disabled }: CustomCommandsPaletteProps) {
  if (mode === 'full') {
    return (
      <div className="flex items-center gap-0.5">
        {CUSTOM_COMMANDS.map((cmd) => (
          <Tooltip key={cmd.token}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-1.5 text-[10px] font-mono"
                disabled={disabled}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onInsert(cmd.token);
                }}
              >
                {cmd.label}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <code className="text-xs">{cmd.token}</code>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }

  // Compact mode: dropdown
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={disabled}
            >
              <Braces className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Comandi personalizzati</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start">
        {CUSTOM_COMMANDS.map((cmd) => (
          <DropdownMenuItem key={cmd.token} onClick={() => onInsert(cmd.token)}>
            <span className="font-mono text-xs text-muted-foreground">{cmd.token}</span>
            <span className="ml-2 text-xs">{cmd.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

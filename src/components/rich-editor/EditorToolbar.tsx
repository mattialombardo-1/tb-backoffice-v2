import {
  Bold,
  Italic,
  Subscript,
  Superscript,
  Radical,
  Sigma,
  Pi,
  Divide,
  Table2,
  Keyboard,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CustomCommandsPalette } from './CustomCommandsPalette';
import type { ComponentType } from 'react';

interface ToolbarAction {
  icon: ComponentType<{ className?: string }>;
  label: string;
  before: string;
  after: string;
  placeholder?: string;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: 'Grassetto', before: '<b>', after: '</b>', placeholder: 'testo' },
  { icon: Italic, label: 'Corsivo', before: '<em>', after: '</em>', placeholder: 'testo' },
  { icon: Subscript, label: 'Pedice', before: '$_{', after: '}$', placeholder: 'x' },
  { icon: Superscript, label: 'Apice', before: '$^{', after: '}$', placeholder: 'n' },
  { icon: Divide, label: 'Frazione', before: '$\\frac{', after: '}{b}$', placeholder: 'a' },
  { icon: Radical, label: 'Radice', before: '$\\sqrt{', after: '}$', placeholder: 'x' },
  { icon: Sigma, label: 'Sommatoria', before: '$\\sum_{i=0}^{n} ', after: '$', placeholder: '' },
  { icon: Pi, label: 'Lettera greca', before: '$\\', after: '$', placeholder: 'alpha' },
];

export interface AvailableImage {
  id: string;
  url: string;
}

interface EditorToolbarProps {
  disabled?: boolean;
  onInsertSnippet: (before: string, after: string, placeholder?: string) => void;
  showKeyboard: boolean;
  onToggleKeyboard: () => void;
  onTableInsert: () => void;
  availableImages?: AvailableImage[];
  hasUnreferencedImages?: boolean;
}

export function EditorToolbar({
  disabled,
  onInsertSnippet,
  showKeyboard,
  onToggleKeyboard,
  onTableInsert,
  availableImages = [],
  hasUnreferencedImages = false,
}: EditorToolbarProps) {
  const handleInsertText = (text: string) => onInsertSnippet(text, '');

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-md border bg-muted/50 px-1 py-1">
      {/* Formatting actions */}
      {TOOLBAR_ACTIONS.map((action, i) => (
        <span key={action.label} className="contents">
          {i === 2 && <Separator orientation="vertical" className="mx-1 h-5" />}
          {i === 4 && <Separator orientation="vertical" className="mx-1 h-5" />}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={disabled}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onInsertSnippet(action.before, action.after, action.placeholder);
                }}
              >
                <action.icon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{action.label}</TooltipContent>
          </Tooltip>
        </span>
      ))}

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Quick math wrappers */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-1.5 text-xs font-mono"
            disabled={disabled}
            onMouseDown={(e) => {
              e.preventDefault();
              onInsertSnippet('$', '$', 'x^2');
            }}
          >
            $...$
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Formula inline</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-1.5 text-xs font-mono"
            disabled={disabled}
            onMouseDown={(e) => {
              e.preventDefault();
              onInsertSnippet('$$', '$$', 'x^2 + y^2 = z^2');
            }}
          >
            $$...$$
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Formula a blocco</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Table insert */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={disabled}
            onMouseDown={(e) => {
              e.preventDefault();
              onTableInsert();
            }}
          >
            <Table2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Inserisci tabella</TooltipContent>
      </Tooltip>

      {/* Math keyboard toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={showKeyboard ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            disabled={disabled}
            onMouseDown={(e) => {
              e.preventDefault();
              onToggleKeyboard();
            }}
          >
            <Keyboard className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {showKeyboard ? 'Chiudi tastiera' : 'Tastiera matematica'}
        </TooltipContent>
      </Tooltip>

      {availableImages.length > 0 && (
        <>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="relative h-7 w-7 p-0"
                    disabled={disabled}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    {hasUnreferencedImages && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Inserisci immagine</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64 p-2" align="start">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Seleziona immagine da inserire</p>
              <div className="flex flex-col gap-1">
                {availableImages.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onInsertSnippet(`&&${img.id}&&`, '');
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.id}
                      className="h-8 w-8 rounded object-cover"
                    />
                    <span className="font-mono text-xs text-muted-foreground">&&{img.id}&&</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Custom commands */}
      <CustomCommandsPalette mode="compact" onInsert={handleInsertText} disabled={disabled} />
    </div>
  );
}

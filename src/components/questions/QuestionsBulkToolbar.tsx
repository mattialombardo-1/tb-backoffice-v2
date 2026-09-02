import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Download, FolderPlus, ListChecks, Trash2, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QuestionsBulkToolbarProps {
  isBulkMode: boolean;
  selectedCount: number;
  onToggleBulkMode: () => void;
  onExport: () => void;
  onImportCsv: (file: File) => void;
  onBulkDelete: () => void;
  onAddToCollection: () => void;
  /** False when the user lacks `collections:UPDATE` — hides the collection action. */
  canAddToCollection: boolean;
  isExporting: boolean;
}

export function QuestionsBulkToolbar({
  isBulkMode,
  selectedCount,
  onToggleBulkMode,
  onExport,
  onImportCsv,
  onBulkDelete,
  onAddToCollection,
  canAddToCollection,
  isExporting,
}: QuestionsBulkToolbarProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isBulkMode) {
    return (
      <Button variant="outline" size="sm" onClick={onToggleBulkMode}>
        <ListChecks className="h-4 w-4 mr-1.5" />
        {t('questions.bulk.toggle')}
      </Button>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportCsv(file);
    e.target.value = '';
  };

  const hasSelection = selectedCount > 0;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="text-sm">
        {t('questions.bulk.selected', { count: selectedCount })}
      </Badge>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {t('questions.bulk.actions')}
            <ChevronDown className="h-4 w-4 ml-1.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => {
              setMenuOpen(false);
              // Defer past the menu's unmount: opening the file picker while Radix is
              // restoring focus can swallow the click.
              setTimeout(() => fileInputRef.current?.click(), 0);
            }}
          >
            <Upload />
            {t('questions.bulk.importCsv')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {canAddToCollection && (
            <DropdownMenuItem
              disabled={!hasSelection}
              onClick={() => {
                setMenuOpen(false);
                onAddToCollection();
              }}
            >
              <FolderPlus />
              {t('questions.bulk.addToCollection')}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            disabled={!hasSelection || isExporting}
            onClick={() => {
              setMenuOpen(false);
              onExport();
            }}
          >
            <Download />
            {isExporting ? t('questions.bulk.exporting') : t('questions.bulk.export')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* TODO(backend-questions): questo bottone è rotto. `questionsService.bulkDelete`
              lancia un errore: non esiste nessun endpoint di bulk delete lato backend,
              né alcun mock che lo copra. Il badge segnala solo questa azione. */}
          <DropdownMenuItem
            disabled={!hasSelection}
            onClick={() => {
              setMenuOpen(false);
              onBulkDelete();
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 />
            {t('questions.bulk.remove')}
            <Badge
              variant="outline"
              className="ml-auto text-[10px] uppercase tracking-wide border-amber-300 bg-amber-50 text-amber-700"
            >
              {t('questions.bulk.todoBadge')}
            </Badge>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onToggleBulkMode}
        title={t('questions.bulk.exit')}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">{t('questions.bulk.exit')}</span>
      </Button>
    </div>
  );
}

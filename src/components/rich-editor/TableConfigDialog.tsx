import { useState, useCallback, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tryRenderKatex } from './latex-utils';

interface TableConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (latex: string) => void;
}

function createEmptyGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));
}

function resizeGrid(old: string[][], rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => old[r]?.[c] ?? '')
  );
}

function generateTableLatex(rows: number, cols: number, cells: string[][]): string {
  const colSpec = Array(cols)
    .fill('c')
    .map((c) => `${c} `)
    .join('|');
  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    const cellValues = Array.from({ length: cols }, (_, c) => {
      const v = cells[r]?.[c]?.trim();
      return v || ' ';
    });
    lines.push(`\\hline ${cellValues.join(' & ')} \\\\`);
  }
  return `$ \\begin{array}{|${colSpec}|}\n${lines.join('\n')}\n\\hline\n\\end{array} $`;
}

export function TableConfigDialog({ open, onOpenChange, onInsert }: TableConfigDialogProps) {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [cells, setCells] = useState<string[][]>(() => createEmptyGrid(2, 2));
  const gridRef = useRef<(HTMLInputElement | null)[][]>([]);

  const handleRowsChange = useCallback(
    (newRows: number) => {
      const clamped = Math.max(1, Math.min(10, newRows));
      setRows(clamped);
      setCells((prev) => resizeGrid(prev, clamped, cols));
    },
    [cols]
  );

  const handleColsChange = useCallback(
    (newCols: number) => {
      const clamped = Math.max(1, Math.min(10, newCols));
      setCols(clamped);
      setCells((prev) => resizeGrid(prev, rows, clamped));
    },
    [rows]
  );

  const handleCellChange = useCallback((r: number, c: number, value: string) => {
    setCells((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = value;
      return next;
    });
  }, []);

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        const nextC = c + 1;
        const nextR = r + (nextC >= cols ? 1 : 0);
        const targetC = nextC >= cols ? 0 : nextC;
        if (nextR < rows) {
          e.preventDefault();
          gridRef.current[nextR]?.[targetC]?.focus();
        }
      } else if (e.key === 'Tab' && e.shiftKey) {
        const prevC = c - 1;
        const prevR = r + (prevC < 0 ? -1 : 0);
        const targetC = prevC < 0 ? cols - 1 : prevC;
        if (prevR >= 0) {
          e.preventDefault();
          gridRef.current[prevR]?.[targetC]?.focus();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (r + 1 < rows) {
          gridRef.current[r + 1]?.[c]?.focus();
        }
      } else if (e.key === 'ArrowDown' && r + 1 < rows) {
        e.preventDefault();
        gridRef.current[r + 1]?.[c]?.focus();
      } else if (e.key === 'ArrowUp' && r - 1 >= 0) {
        e.preventDefault();
        gridRef.current[r - 1]?.[c]?.focus();
      }
    },
    [rows, cols]
  );

  const latex = useMemo(() => generateTableLatex(rows, cols, cells), [rows, cols, cells]);

  const previewHtml = useMemo(() => {
    const inner = latex.slice(2, -2).trim();
    return tryRenderKatex(inner, true);
  }, [latex]);

  const handleInsert = () => {
    onInsert(latex);
    onOpenChange(false);
    setRows(2);
    setCols(2);
    setCells(createEmptyGrid(2, 2));
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setRows(2);
      setCols(2);
      setCells(createEmptyGrid(2, 2));
    }
  };

  // Ensure ref grid is properly sized
  if (gridRef.current.length !== rows) {
    gridRef.current = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => gridRef.current[r]?.[c] ?? null)
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Inserisci tabella</DialogTitle>
          <DialogDescription>Configura dimensioni e contenuto della tabella.</DialogDescription>
        </DialogHeader>

        {/* Rows & Cols controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="table-rows">Righe</Label>
            <Input
              id="table-rows"
              type="number"
              min={1}
              max={10}
              value={rows}
              onChange={(e) => handleRowsChange(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="table-cols">Colonne</Label>
            <Input
              id="table-cols"
              type="number"
              min={1}
              max={10}
              value={cols}
              onChange={(e) => handleColsChange(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Editable cell grid */}
        <div className="space-y-1.5">
          <Label>Contenuto celle</Label>
          <div className="overflow-x-auto rounded-md border bg-muted/30 p-2">
            <table className="border-collapse">
              <tbody>
                {Array.from({ length: rows }, (_, r) => (
                  <tr key={r}>
                    {Array.from({ length: cols }, (_, c) => (
                      <td key={c} className="p-0.5">
                        <input
                          ref={(el) => {
                            if (!gridRef.current[r]) gridRef.current[r] = [];
                            gridRef.current[r][c] = el;
                          }}
                          type="text"
                          value={cells[r]?.[c] ?? ''}
                          onChange={(e) => handleCellChange(r, c, e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, r, c)}
                          placeholder={`${r + 1},${c + 1}`}
                          className="h-8 w-full min-w-[60px] rounded border bg-background px-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live preview */}
        <div className="space-y-1.5">
          <Label>Anteprima</Label>
          <div
            className="overflow-x-auto rounded-md border bg-background p-3 text-sm [&_.katex]:text-sm"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Annulla
          </Button>
          <Button type="button" onClick={handleInsert}>
            Inserisci
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useApiClient } from '@/lib/api/useApiClient';
import { poolsService } from '@/lib/services/pools';
import type { Pool, PoolScores, PoolStatus } from '@/lib/types/pools';
import { DEFAULT_POOL_SCORES, POOL_STATUS_LABELS } from '@/lib/types/pools';
import { PoolQuestionsPickerContent } from './PoolQuestionsPickerContent';

interface Brand {
  _id: string;
  name: string;
}

interface PoolCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function PoolCreateSheet({ open, onOpenChange, onCreated }: PoolCreateSheetProps) {
  const { t } = useTranslation();
  const client = useApiClient();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'questions'>('form');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<PoolStatus>('DRAFT');
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<PoolScores>(DEFAULT_POOL_SCORES);
  const [creating, setCreating] = useState(false);
  const [createdPool, setCreatedPool] = useState<Pool | null>(null);

  const brandsQuery = useQuery({
    queryKey: ['brands'],
    queryFn: ({ signal }) => client.get<Brand[]>('/brands', { signal }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });
  const brands = brandsQuery.data ?? [];

  const toggleBrand = (id: string) => {
    setSelectedBrandIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reset = () => {
    setStep('form');
    setName('');
    setStatus('DRAFT');
    setSelectedBrandIds(new Set());
    setScores(DEFAULT_POOL_SCORES);
    setCreatedPool(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      if (createdPool) onCreated();
      reset();
    }
    onOpenChange(next);
  };

  const canCreate = name.trim().length > 0 && selectedBrandIds.size > 0;

  const handleCreate = async () => {
    if (!canCreate) return;
    setCreating(true);
    try {
      const pool = await poolsService.create(client, {
        name: name.trim(),
        status,
        brands: Array.from(selectedBrandIds),
        scores,
      });
      setCreatedPool(pool);
      setStep('questions');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setCreating(false);
    }
  };

  const handleDone = () => {
    onCreated();
    reset();
    onOpenChange(false);
  };

  const handleGoToDetail = () => {
    if (!createdPool) return;
    onCreated();
    reset();
    onOpenChange(false);
    navigate({ to: '/pools/$poolId', params: { poolId: createdPool.id } });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full max-w-2xl flex flex-col p-0">
        {step === 'form' ? (
          <>
            <SheetHeader className="border-b px-6 py-4 shrink-0">
              <SheetTitle>{t('pools.createSheet.title')}</SheetTitle>
              <SheetDescription>{t('pools.createSheet.desc')}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pool-name">
                  {t('pools.createSheet.nameLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pool-name"
                  placeholder={t('pools.createSheet.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pool-status">{t('pools.createSheet.statusLabel')}</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as PoolStatus)}>
                  <SelectTrigger id="pool-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(POOL_STATUS_LABELS) as PoolStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {POOL_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {t('pools.createSheet.brandLabel')} <span className="text-destructive">*</span>
                </Label>
                {brandsQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    {t('pools.createSheet.brandLoading')}
                  </p>
                ) : brands.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    {t('pools.createSheet.brandEmpty')}
                  </p>
                ) : (
                  <div className="space-y-2 rounded-md border px-3 py-2 max-h-40 overflow-y-auto">
                    {brands.map((b) => (
                      <div key={b._id} className="flex items-center gap-2">
                        <Checkbox
                          id={`brand-${b._id}`}
                          checked={selectedBrandIds.has(b._id)}
                          onCheckedChange={() => toggleBrand(b._id)}
                          disabled={creating}
                        />
                        <label
                          htmlFor={`brand-${b._id}`}
                          className="text-sm cursor-pointer select-none"
                        >
                          {b.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>{t('pools.createSheet.scoresLabel')}</Label>
                <p className="text-xs text-muted-foreground">{t('pools.createSheet.scoresHint')}</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['correct', 'wrong', 'empty'] as const).map((key) => (
                    <div key={key} className="space-y-1">
                      <Label htmlFor={`score-${key}`} className="text-xs text-muted-foreground">
                        {t(`pools.scores.${key}`)}
                      </Label>
                      <Input
                        id={`score-${key}`}
                        type="number"
                        step="0.01"
                        value={scores[key]}
                        onChange={(e) =>
                          setScores((s) => ({ ...s, [key]: parseFloat(e.target.value) || 0 }))
                        }
                        disabled={creating}
                        className="text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={!canCreate || creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('pools.createSheet.createAndAdd')}
                {!creating && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="border-b px-6 py-4 shrink-0">
              <SheetTitle>{createdPool?.name}</SheetTitle>
              <SheetDescription>{t('pools.createSheet.createdHint')}</SheetDescription>
            </SheetHeader>

            {createdPool && (
              <PoolQuestionsPickerContent
                key={createdPool.id}
                poolId={createdPool.id}
                onAdded={() => {}}
              />
            )}

            <div className="border-t px-6 py-4 flex justify-between items-center shrink-0">
              <Button variant="ghost" size="sm" onClick={handleGoToDetail}>
                {t('pools.createSheet.goToDetail')}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button onClick={handleDone}>{t('pools.createSheet.done')}</Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { REJECT_CUSTOM_REASON, REJECT_CUSTOM_TEXT_MAX, REJECT_REASONS } from '@/lib/rejectReasons';

interface MyReviewsBulkRejectDialogProps {
  open: boolean;
  count: number;
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
}

/**
 * Stesso dialog di rigetto di QuestionEditContent (stessa lista di motivi, stesso limite di
 * caratteri per "Altro"), ma con una sola motivazione condivisa per tutte le domande
 * selezionate invece che una a domanda — impraticabile chiedere N motivazioni in un'unica
 * azione bulk.
 */
export function MyReviewsBulkRejectDialog({
  open,
  count,
  onConfirm,
  onCancel,
}: MyReviewsBulkRejectDialogProps) {
  const { t } = useTranslation();
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectCustomText, setRejectCustomText] = useState('');
  const isCustomReason = rejectReason === REJECT_CUSTOM_REASON;
  const canConfirm = rejectReason !== '' && (!isCustomReason || rejectCustomText.trim().length > 0);

  // Reset ad ogni apertura — stesso pattern di QuestionsBulkDeleteDialog.
  useEffect(() => {
    if (open) {
      setIsRejecting(false);
      setRejectReason('');
      setRejectCustomText('');
    }
  }, [open]);

  const handleConfirm = async () => {
    const reason = isCustomReason ? rejectCustomText.trim() : rejectReason;
    setIsRejecting(true);
    try {
      await onConfirm(reason);
    } catch {
      setIsRejecting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isRejecting) onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('myReviews.bulk.rejectDialogTitle')}</DialogTitle>
          <DialogDescription>{t('myReviews.bulk.rejectDialogDesc')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Label htmlFor="bulk-reject-reason">{t('myReviews.bulk.reasonLabel')}</Label>
          <Select value={rejectReason} onValueChange={setRejectReason}>
            <SelectTrigger id="bulk-reject-reason">
              <SelectValue placeholder={t('myReviews.bulk.reasonPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {REJECT_REASONS.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isCustomReason && (
            <div className="flex flex-col gap-1.5">
              <Input
                value={rejectCustomText}
                onChange={(e) =>
                  setRejectCustomText(e.target.value.slice(0, REJECT_CUSTOM_TEXT_MAX))
                }
                placeholder={t('myReviews.bulk.reasonCustomPlaceholder')}
                maxLength={REJECT_CUSTOM_TEXT_MAX}
              />
              <p
                className={cn(
                  'text-right text-xs text-muted-foreground',
                  rejectCustomText.length >= REJECT_CUSTOM_TEXT_MAX && 'text-destructive'
                )}
              >
                {rejectCustomText.length}/{REJECT_CUSTOM_TEXT_MAX}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isRejecting}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || isRejecting}
          >
            {isRejecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {t('myReviews.bulk.rejectConfirm', { count })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

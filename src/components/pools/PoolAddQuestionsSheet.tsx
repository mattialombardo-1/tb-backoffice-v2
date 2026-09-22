import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { PoolQuestionsPickerContent } from './PoolQuestionsPickerContent';

interface PoolAddQuestionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poolId: string;
  onAdded: () => void;
}

export function PoolAddQuestionsSheet({
  open,
  onOpenChange,
  poolId,
  onAdded,
}: PoolAddQuestionsSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-2xl flex flex-col p-0">
        <SheetHeader className="border-b px-6 py-4 shrink-0">
          <SheetTitle>{t('pools.questions.addSheet.title')}</SheetTitle>
          <SheetDescription>{t('pools.questions.addSheet.desc')}</SheetDescription>
        </SheetHeader>
        {open && <PoolQuestionsPickerContent poolId={poolId} onAdded={onAdded} />}
      </SheetContent>
    </Sheet>
  );
}

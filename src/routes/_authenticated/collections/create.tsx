import { createFileRoute } from '@tanstack/react-router';
import { CollectionCreatePage } from '@/components/collections';

interface CollectionCreateSearch {
  /** When present, the stepper opens in edit mode pre-populated with this collection. */
  collectionId?: string;
}

export const Route = createFileRoute('/_authenticated/collections/create')({
  validateSearch: (raw: Record<string, unknown>): CollectionCreateSearch => ({
    collectionId: typeof raw.collectionId === 'string' ? raw.collectionId : undefined,
  }),
  component: CollectionCreatePage,
});

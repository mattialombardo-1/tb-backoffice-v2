import { createFileRoute } from '@tanstack/react-router';
import { AttributesPage } from '@/components/attributes';

export const Route = createFileRoute('/_authenticated/attributes')({
  component: AttributesPage,
});

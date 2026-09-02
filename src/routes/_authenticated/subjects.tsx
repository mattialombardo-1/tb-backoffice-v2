import { createFileRoute } from '@tanstack/react-router';
import { SubjectsPage } from '@/components/subjects';

export const Route = createFileRoute('/_authenticated/subjects')({
  component: SubjectsPage,
});

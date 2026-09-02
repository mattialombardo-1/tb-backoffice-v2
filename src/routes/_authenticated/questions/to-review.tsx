import { createFileRoute } from '@tanstack/react-router';
import { MyReviewsPage } from '@/components/questions/MyReviewsPage';

export const Route = createFileRoute('/_authenticated/questions/to-review')({
  component: MyReviewsPage,
});

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Subject } from '@/lib/types/subjects';

interface SubjectsTableProps {
  data: Subject[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (subject: Subject) => void;
  onAddTopic: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

const COLUMNS = 3;

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: COLUMNS }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function SubjectRow({
  subject,
  canUpdate,
  canDelete,
  onEdit,
  onAddTopic,
  onDelete,
}: {
  subject: Subject;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (subject: Subject) => void;
  onAddTopic: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const topicCount = subject.topics?.length ?? 0;

  return (
    <>
      <TableRow className="group">
        <TableCell className="w-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setExpanded((v) => !v)}
            disabled={topicCount === 0}
            aria-label={expanded ? t('subjects.table.collapse') : t('subjects.table.expand')}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </TableCell>

        <TableCell className="font-medium">{subject.name}</TableCell>

        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {t('subjects.table.topic', { count: topicCount })}
            </span>

            {(canUpdate || canDelete) && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canUpdate && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(subject)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t('subjects.actions.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => onAddTopic(subject)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('subjects.actions.addTopic')}
                    </Button>
                  </>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(subject)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('subjects.actions.delete')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell />
          <TableCell colSpan={2} className="py-3">
            {topicCount === 0 ? (
              <p className="text-sm text-muted-foreground">{t('subjects.table.noTopics')}</p>
            ) : (
              <ul className="space-y-1">
                {subject.topics!.map((topic) => (
                  <li
                    key={topic._id}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                    {topic.name}
                  </li>
                ))}
              </ul>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function SubjectsTable({
  data,
  isLoading,
  error,
  onRetry,
  canUpdate,
  canDelete,
  onEdit,
  onAddTopic,
  onDelete,
}: SubjectsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>{t('subjects.table.name')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="h-24 text-center">
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
                  {t('common.retry')}
                </Button>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                {t('subjects.noResults')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((subject) => (
              <SubjectRow
                key={subject._id}
                subject={subject}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onEdit={onEdit}
                onAddTopic={onAddTopic}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

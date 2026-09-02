import { useState, useCallback } from 'react';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  FileDown,
  LayoutGrid,
  PenLine,
  HelpCircle,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCollectionForm, DEFAULT_COLLECTION_DETAILS } from '@/lib/hooks/useCollectionForm';
import { CollectionTabTipo } from './CollectionTabTipo';
import { CollectionTabNomeTest } from './CollectionTabNomeTest';
import { CollectionTabDomande } from './CollectionTabDomande';
import { CollectionTabDettagli } from './CollectionTabDettagli';
import { CollectionExportDialog } from './CollectionExportDialog';

type StepId = 'tipo' | 'nome-test' | 'domande' | 'dettagli';

interface Step {
  id: StepId;
  label: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; 'aria-hidden'?: 'true'; className?: string }>;
}

const STEPS: Step[] = [
  {
    id: 'tipo',
    label: 'Tipo',
    description: 'Seleziona il tipo di collezione che vuoi creare.',
    Icon: LayoutGrid,
  },
  {
    id: 'nome-test',
    label: 'Nome & test',
    description:
      'Scegli prima il test: determina punteggi default e durata standard. Il nome viene proposto automaticamente.',
    Icon: PenLine,
  },
  {
    id: 'domande',
    label: 'Domande',
    description: 'Aggiungi e gestisci le domande della collezione.',
    Icon: HelpCircle,
  },
  {
    id: 'dettagli',
    label: 'Dettagli',
    description: 'Configura i dettagli finali e pubblica la collezione.',
    Icon: SlidersHorizontal,
  },
];

const routeApi = getRouteApi('/_authenticated/collections/create');

export function CollectionCreatePage() {
  const navigate = useNavigate();
  const { collectionId } = routeApi.useSearch();
  const isEditMode = !!collectionId;
  const [currentStep, setCurrentStep] = useState<StepId>('tipo');
  // In edit mode every step is reachable from the start (all fields pre-populated).
  const [unlockedUpTo, setUnlockedUpTo] = useState(isEditMode ? STEPS.length - 1 : 0);
  const { form, updateForm, saveStatus, saveDraft, saveDetails, isLoading, loadError } =
    useCollectionForm(collectionId);
  const [exportOpen, setExportOpen] = useState(false);

  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleTabChange = (value: string) => {
    const idx = STEPS.findIndex((s) => s.id === value);
    if (idx <= unlockedUpTo) {
      setCurrentStep(value as StepId);
    }
  };

  const advance = useCallback(() => {
    if (currentIndex < STEPS.length - 1) {
      const nextIndex = currentIndex + 1;
      setUnlockedUpTo((prev) => Math.max(prev, nextIndex));
      setCurrentStep(STEPS[nextIndex].id);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    const id = await saveDetails();
    if (id) {
      navigate({ to: '/collections' });
    }
  }, [saveDetails, navigate]);

  // Step 1: plain advance
  const handleTipoContinue = () => advance();

  const handleNomeTestContinue = useCallback(async () => {
    await saveDraft();
    advance();
  }, [saveDraft, advance]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b bg-background px-8 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/collections' })}
          aria-label="Torna alle collezioni"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">
            {isEditMode ? 'Modifica collezione' : 'Nuova collezione'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Passaggio {currentIndex + 1} di {STEPS.length} —{' '}
            <span className="font-medium">{STEPS[currentIndex].label}</span>
          </p>
        </div>
        {isEditMode && collectionId && (
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
            <FileDown className="h-4 w-4 mr-2" />
            Esporta
          </Button>
        )}
      </div>

      {/* Scrollable content */}
      {isLoading ? (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-8 py-10">
            <div className="flex flex-row items-start gap-6">
              {/* Floating icon sidebar */}
              <div className="sticky top-10 flex flex-col rounded-xl border bg-card shadow-sm w-14 gap-1 px-2 py-4 shrink-0">
                {STEPS.map((step) => (
                  <Skeleton key={step.id} className="h-11 w-full rounded-lg" />
                ))}
              </div>

              {/* Card content */}
              <Card className="flex-1">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-10 w-40" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : loadError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button variant="outline" onClick={() => navigate({ to: '/collections' })}>
            Torna alle collezioni
          </Button>
        </div>
      ) : (
        /* Scrollable content */
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-8 py-10">
            <Tabs
              value={currentStep}
              onValueChange={handleTabChange}
              orientation="vertical"
              className="flex flex-row items-start gap-6"
            >
              {/* Floating icon sidebar */}
              <TabsList className="sticky top-10 flex-col rounded-xl border bg-card shadow-sm w-14 gap-1 px-2 py-4 justify-start shrink-0">
                <TooltipProvider delayDuration={0}>
                  {STEPS.map((step, index) => {
                    const isLocked = index > unlockedUpTo;
                    const isCompleted = index < currentIndex && index <= unlockedUpTo;
                    const { Icon } = step;

                    return (
                      <Tooltip key={step.id}>
                        <TooltipTrigger asChild>
                          <span>
                            <TabsTrigger
                              value={step.id}
                              disabled={isLocked}
                              className={cn(
                                'relative flex-col gap-0.5 p-3 w-full',
                                isLocked && 'opacity-40'
                              )}
                            >
                              {isCompleted ? (
                                <Check size={15} aria-hidden="true" className="text-primary" />
                              ) : (
                                <Icon size={15} aria-hidden="true" />
                              )}
                              <span className="text-[9px] font-bold leading-none">{index + 1}</span>
                            </TabsTrigger>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="px-2 py-1 text-xs" side="right">
                          {step.label}
                          {isLocked && ' · completa il passaggio precedente'}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </TabsList>

              {/* Card content */}
              <Card className="flex-1">
                <TabsContent value="tipo" className="m-0">
                  <CardHeader>
                    <CardTitle>Tipo di collezione</CardTitle>
                    <CardDescription>
                      Scegli se questa collection è una simulazione completa o una esercitazione
                      mirata. Non potrai cambiarlo dopo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <CollectionTabTipo
                      value={form.type}
                      onChange={(type) => updateForm({ type })}
                      onContinue={handleTipoContinue}
                    />
                  </CardContent>
                </TabsContent>

                <TabsContent value="nome-test" className="m-0">
                  <CardHeader>
                    <CardTitle>Nome & test</CardTitle>
                    <CardDescription>{STEPS[1].description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <CollectionTabNomeTest
                      testIds={form.testIds}
                      name={form.name}
                      saveStatus={saveStatus}
                      onTestsChange={(testIds) => updateForm({ testIds })}
                      onNameChange={(name) => updateForm({ name })}
                      onContinue={handleNomeTestContinue}
                    />
                  </CardContent>
                </TabsContent>

                <TabsContent value="domande" className="m-0">
                  <CardHeader>
                    <CardTitle>Domande</CardTitle>
                    <CardDescription>{STEPS[2].description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <CollectionTabDomande
                      collectionId={collectionId}
                      sections={form.sections}
                      onSectionsChange={(sections) => updateForm({ sections })}
                      onContinue={advance}
                      onBack={() => setCurrentStep('nome-test')}
                    />
                  </CardContent>
                </TabsContent>

                <TabsContent value="dettagli" className="m-0">
                  <CardHeader>
                    <CardTitle>Dettagli</CardTitle>
                    <CardDescription>{STEPS[3].description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <CollectionTabDettagli
                      type={form.type}
                      isEditMode={isEditMode}
                      details={form.details ?? DEFAULT_COLLECTION_DETAILS}
                      onDetailsChange={(patch) =>
                        updateForm({
                          details: { ...(form.details ?? DEFAULT_COLLECTION_DETAILS), ...patch },
                        })
                      }
                      attributeValues={form.attributeValues}
                      onAttributeValuesChange={(attributeValues) => updateForm({ attributeValues })}
                      onSubmit={handleSubmit}
                      onBack={() => setCurrentStep('domande')}
                    />
                  </CardContent>
                </TabsContent>
              </Card>
            </Tabs>
          </div>
        </div>
      )}

      {isEditMode && collectionId && (
        <CollectionExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          mode="single"
          collectionId={collectionId}
          count={1}
        />
      )}
    </div>
  );
}

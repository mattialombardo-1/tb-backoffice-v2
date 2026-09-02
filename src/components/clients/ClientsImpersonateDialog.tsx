import { useState } from 'react';
import { toast } from 'sonner';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useApiClient } from '@/lib/api/useApiClient';
import { clientsService } from '@/lib/services/clients';
import { getSimulatorHostname } from '@/lib/auth/config';
import type { Client, ClientBrand } from '@/lib/types/clients';

interface Props {
  client: Client | null;
  idToken: string;
  onClose: () => void;
}

export function ClientsImpersonateDialog({ client, idToken, onClose }: Props) {
  const { t } = useTranslation();
  const apiClient = useApiClient();
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: brands = [], isLoading: isLoadingBrands } = useQuery<ClientBrand[]>({
    queryKey: ['client-brands', client?.id],
    queryFn: ({ signal }) => clientsService.getBrands(apiClient, client!.id, signal),
    enabled: !!client,
    staleTime: 30_000,
  });

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) ?? brands[0] ?? null;

  const handleConfirm = async () => {
    if (!client || !selectedBrand) return;
    setIsSubmitting(true);
    try {
      const res = await clientsService.impersonate(idToken, client.email);
      toast.success(t('clients.impersonate.success', { email: client.email }));
      const hostname = getSimulatorHostname(selectedBrand.name);
      window.open(
        `https://${hostname}/impersonation/start?itk=${encodeURIComponent(res.data.itk)}`,
        '_blank'
      );
      onClose();
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : t('clients.impersonate.error');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientLabel =
    [client?.name, client?.surname].filter(Boolean).join(' ') || client?.email;

  return (
    <Dialog open={!!client} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleziona brand per impersonificazione</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {isLoadingBrands ? (
            <p className="text-sm text-muted-foreground text-center py-6">Caricamento brand...</p>
          ) : brands.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Questo utente non ha brand associati.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                Scegli su quale brand impersonare{' '}
                <span className="font-medium text-foreground">{clientLabel}</span>:
              </p>
              <div className="space-y-2">
                {brands.map((brand) => {
                  const hostname = getSimulatorHostname(brand.name);
                  const isSelected = brand.id === selectedBrand?.id;
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => setSelectedBrandId(brand.id)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground/40 hover:bg-muted/40'
                      )}
                    >
                      <div className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        isSelected ? 'border-primary' : 'border-muted-foreground/40'
                      )}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{brand.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Globe className="h-3 w-3 shrink-0" />
                          {hostname}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedBrand || isSubmitting || isLoadingBrands}
          >
            {isSubmitting ? 'Caricamento...' : 'Impersona'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

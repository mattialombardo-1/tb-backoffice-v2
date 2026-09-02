import type { APIClient } from '@/lib/api/client';

export interface QuestionImage {
  key: string;
  url: string;         // presigned GET URL (display)
  imageUrl: string;    // plain S3 URL (storage)
  lastModified?: string;
  size?: number;
}

/** Coppia storageUrl/viewUrl usata internamente nel form. */
export interface QuestionImageEntry {
  storageUrl: string;  // plain S3 URL salvato nel DB
  viewUrl: string;     // presigned GET URL per visualizzazione (scade in 12h)
}

export const questionImagesService = {
  async getUploadUrl(
    client: APIClient,
    contentType: string
  ): Promise<{ uploadUrl: string; imageUrl: string; viewUrl: string; key: string }> {
    return client.post('/question-images/upload-url', { contentType });
  },

  /** Carica il file su S3 tramite presigned PUT, restituisce {storageUrl, viewUrl}. */
  async uploadImage(client: APIClient, file: File): Promise<QuestionImageEntry> {
    const { uploadUrl, imageUrl, viewUrl } = await questionImagesService.getUploadUrl(client, file.type);
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!res.ok) throw new Error(`Upload S3 fallito: ${res.status}`);
    return { storageUrl: imageUrl, viewUrl };
  },

  /** Elenca le immagini nel bucket, con sia la URL presigned (display) che quella plain (storage). */
  async listImages(client: APIClient, signal?: AbortSignal): Promise<QuestionImage[]> {
    const res = await client.get<{ images: QuestionImage[] }>('/question-images', { signal });
    return res.images ?? [];
  },

  /** Dato un array di plain S3 URL, restituisce le corrispondenti presigned GET URL. */
  async getViewUrls(client: APIClient, storageUrls: string[], signal?: AbortSignal): Promise<string[]> {
    if (storageUrls.length === 0) return [];
    const res = await client.post<{ viewUrls: string[] }>(
      '/question-images/view-urls',
      { urls: storageUrls },
      { signal }
    );
    return res.viewUrls ?? [];
  },
};

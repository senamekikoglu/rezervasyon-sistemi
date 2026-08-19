import api from './api';
import type { Rezervasyon } from '../types/models';

export const getRezervasyonlar = (alanId?: number, baslangic?: string, bitis?: string) => {
  const params: Record<string, string | number> = {};
  if (alanId) params.alanId = alanId;
  if (baslangic) params.baslangic = baslangic;
  if (bitis) params.bitis = bitis;

  return api.get<Rezervasyon[]>('/Rezervasyon', { params }).then(r => r.data);
};

export const addRezervasyon = (
  alanId: number,
  kullaniciId: number,
  baslangicZamani: string,
  bitisZamani: string,
  aciklama: string
) =>
  api.post('/Rezervasyon', { alanId, kullaniciId, baslangicZamani, bitisZamani, aciklama });

export const deleteRezervasyon = (id: number) => api.delete(`/Rezervasyon/${id}`);
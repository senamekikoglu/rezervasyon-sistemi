import api from './api';
import type { Tesis, Bina, Kat, Alan } from '../types/models';

export const getTesisler = () => api.get<Tesis[]>('/Tesis').then(r => r.data);
export const getBinalar = () => api.get<Bina[]>('/Bina').then(r => r.data);
export const getKatlar = () => api.get<Kat[]>('/Kat').then(r => r.data);
export const getAlanlar = () => api.get<Alan[]>('/Alan').then(r => r.data);

export const addTesis = (ad: string) => api.post('/Tesis', { ad });
export const addBina = (ad: string, tesisId: number) => api.post('/Bina', { ad, tesisId });
export const addKat = (ad: string, binaId: number) => api.post('/Kat', { ad, binaId });
export const addAlan = (ad: string, katId: number) => api.post('/Alan', { ad, katId });

export const updateTesis = (id: number, ad: string) => api.put(`/Tesis/${id}`, { id, ad });
export const updateBina = (id: number, ad: string, tesisId: number) =>
  api.put(`/Bina/${id}`, { id, ad, tesisId });
export const updateKat = (id: number, ad: string, binaId: number) =>
  api.put(`/Kat/${id}`, { id, ad, binaId });
export const updateAlan = (id: number, ad: string, katId: number) =>
  api.put(`/Alan/${id}`, { id, ad, katId });

export const deleteTesis = (id: number) => api.delete(`/Tesis/${id}`);
export const deleteBina = (id: number) => api.delete(`/Bina/${id}`);
export const deleteKat = (id: number) => api.delete(`/Kat/${id}`);
export const deleteAlan = (id: number) => api.delete(`/Alan/${id}`);
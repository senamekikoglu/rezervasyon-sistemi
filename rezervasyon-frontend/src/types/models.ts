export interface Tesis {
  id: number;
  ad: string;
}

export interface Bina {
  id: number;
  ad: string;
  tesisId: number;
}

export interface Kat {
  id: number;
  ad: string;
  binaId: number;
}

export interface Alan {
  id: number;
  ad: string;
  katId: number;
}

export interface Kullanici {
  id: number;
  kullaniciAdi: string;
}

export interface Rezervasyon {
  id: number;
  alanId: number;
  kullaniciId: number;
  baslangicZamani: string;
  bitisZamani: string;
  aciklama?: string;
}
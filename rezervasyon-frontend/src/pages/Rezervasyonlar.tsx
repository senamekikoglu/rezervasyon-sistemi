import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTesisler, getBinalar, getKatlar, getAlanlar } from '../services/tesisYapisiService';
import { getRezervasyonlar, addRezervasyon, deleteRezervasyon } from '../services/rezervasyonService';
import type { Tesis, Bina, Kat, Alan, Rezervasyon } from '../types/models';

function Rezervasyonlar() {
  const [tesisler, setTesisler] = useState<Tesis[]>([]);
  const [binalar, setBinalar] = useState<Bina[]>([]);
  const [katlar, setKatlar] = useState<Kat[]>([]);
  const [alanlar, setAlanlar] = useState<Alan[]>([]);
  const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');

  // Ekleme formu state'leri
  const [seciliTesis, setSeciliTesis] = useState<number | ''>('');
  const [seciliBina, setSeciliBina] = useState<number | ''>('');
  const [seciliKat, setSeciliKat] = useState<number | ''>('');
  const [seciliAlan, setSeciliAlan] = useState<number | ''>('');
  const [baslangic, setBaslangic] = useState('');
  const [bitis, setBitis] = useState('');
  const [aciklama, setAciklama] = useState('');

  // Filtre formu state'leri (ekleme formundan bağımsız)
  const [filtreTesis, setFiltreTesis] = useState<number | ''>('');
  const [filtreBina, setFiltreBina] = useState<number | ''>('');
  const [filtreKat, setFiltreKat] = useState<number | ''>('');
  const [filtreAlan, setFiltreAlan] = useState<number | ''>('');
  const [filtreBaslangic, setFiltreBaslangic] = useState('');
  const [filtreBitis, setFiltreBitis] = useState('');

  const kullaniciStr = localStorage.getItem('kullanici');
  const kullanici = kullaniciStr ? JSON.parse(kullaniciStr) : null;

  const temelVeriGetir = async () => {
    try {
      const [t, b, k, a] = await Promise.all([
        getTesisler(),
        getBinalar(),
        getKatlar(),
        getAlanlar(),
      ]);
      setTesisler(t);
      setBinalar(b);
      setKatlar(k);
      setAlanlar(a);
    } catch (err) {
      console.error('Veri çekilirken hata oluştu:', err);
    }
  };

  const rezervasyonlariGetir = async (alanId?: number, bas?: string, bit?: string) => {
    try {
      const r = await getRezervasyonlar(alanId, bas, bit);
      setRezervasyonlar(r);
    } catch (err) {
      console.error('Rezervasyonlar çekilirken hata oluştu:', err);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    const ilkYukleme = async () => {
      await temelVeriGetir();
      await rezervasyonlariGetir();
    };
    ilkYukleme();
  }, []);

  const binaSecenekleri = binalar.filter((b) => b.tesisId === seciliTesis);
  const katSecenekleri = katlar.filter((k) => k.binaId === seciliBina);
  const alanSecenekleri = alanlar.filter((a) => a.katId === seciliKat);

  const filtreBinaSecenekleri = binalar.filter((b) => b.tesisId === filtreTesis);
  const filtreKatSecenekleri = katlar.filter((k) => k.binaId === filtreBina);
  const filtreAlanSecenekleri = alanlar.filter((a) => a.katId === filtreKat);

  const handleEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');

    if (!kullanici) {
      setHata('Oturum bulunamadı, lütfen tekrar giriş yapın.');
      return;
    }

    if (seciliAlan === '') {
      setHata('Lütfen bir alan seçin.');
      return;
    }

    if (!baslangic || !bitis) {
      setHata('Lütfen başlangıç ve bitiş zamanını girin.');
      return;
    }

    try {
      await addRezervasyon(seciliAlan as number, kullanici.id, baslangic, bitis, aciklama);

      setSeciliTesis('');
      setSeciliBina('');
      setSeciliKat('');
      setSeciliAlan('');
      setBaslangic('');
      setBitis('');
      setAciklama('');

      await rezervasyonlariGetir();
    } catch (err: any) {
      setHata(err.response?.data ?? 'Rezervasyon oluşturulamadı.');
    }
  };

  const handleSil = async (id: number) => {
    setHata('');
    try {
      await deleteRezervasyon(id);
      await rezervasyonlariGetir();
    } catch (err: any) {
      setHata(err.response?.data ?? 'Silme işlemi başarısız oldu.');
    }
  };

  const handleFiltreUygula = () => {
    rezervasyonlariGetir(
      filtreAlan === '' ? undefined : (filtreAlan as number),
      filtreBaslangic || undefined,
      filtreBitis || undefined
    );
  };

  const handleFiltreTemizle = () => {
    setFiltreTesis('');
    setFiltreBina('');
    setFiltreKat('');
    setFiltreAlan('');
    setFiltreBaslangic('');
    setFiltreBitis('');
    rezervasyonlariGetir();
  };

  const alanAdiGetir = (alanId: number) => {
    const alan = alanlar.find((a) => a.id === alanId);
    return alan ? alan.ad : `Alan #${alanId}`;
  };

  if (yukleniyor) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Rezervasyonlar
      </Typography>

      {hata && <Alert severity="error" sx={{ mb: 2 }}>{hata}</Alert>}

      {/* Rezervasyon oluşturma formu */}
      <Typography variant="h6" sx={{ mb: 1 }}>Yeni Rezervasyon</Typography>
      <Box
        component="form"
        onSubmit={handleEkle}
        sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Tesis</InputLabel>
          <Select
            value={seciliTesis}
            label="Tesis"
            onChange={(e) => {
              setSeciliTesis(e.target.value as number);
              setSeciliBina('');
              setSeciliKat('');
              setSeciliAlan('');
            }}
          >
            {tesisler.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.ad}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!seciliTesis}>
          <InputLabel>Bina</InputLabel>
          <Select
            value={seciliBina}
            label="Bina"
            onChange={(e) => {
              setSeciliBina(e.target.value as number);
              setSeciliKat('');
              setSeciliAlan('');
            }}
          >
            {binaSecenekleri.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.ad}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!seciliBina}>
          <InputLabel>Kat</InputLabel>
          <Select
            value={seciliKat}
            label="Kat"
            onChange={(e) => {
              setSeciliKat(e.target.value as number);
              setSeciliAlan('');
            }}
          >
            {katSecenekleri.map((k) => (
              <MenuItem key={k.id} value={k.id}>{k.ad}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!seciliKat}>
          <InputLabel>Alan</InputLabel>
          <Select
            value={seciliAlan}
            label="Alan"
            onChange={(e) => setSeciliAlan(e.target.value as number)}
          >
            {alanSecenekleri.map((a) => (
              <MenuItem key={a.id} value={a.id}>{a.ad}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Başlangıç"
          type="datetime-local"
          value={baslangic}
          onChange={(e) => setBaslangic(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          required
        />

        <TextField
          size="small"
          label="Bitiş"
          type="datetime-local"
          value={bitis}
          onChange={(e) => setBitis(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          required
        />

        <TextField
          size="small"
          label="Açıklama"
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
        />

        <Button type="submit" variant="contained">
          Rezervasyon Oluştur
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Filtreleme formu */}
      <Typography variant="h6" sx={{ mb: 1 }}>Filtrele</Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Tesis</InputLabel>
          <Select
            value={filtreTesis}
            label="Tesis"
            onChange={(e) => {
              setFiltreTesis(e.target.value as number);
              setFiltreBina('');
              setFiltreKat('');
              setFiltreAlan('');
            }}
          >
            <MenuItem value="">Tümü</MenuItem>
            {tesisler.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.ad}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!filtreTesis}>
          <InputLabel>Bina</InputLabel>
          <Select
            value={filtreBina}
            label="Bina"
            onChange={(e) => {
              setFiltreBina(e.target.value as number);
              setFiltreKat('');
              setFiltreAlan('');
            }}
          >
            <MenuItem value="">Tümü</MenuItem>
            {filtreBinaSecenekleri.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.ad}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!filtreBina}>
          <InputLabel>Kat</InputLabel>
          <Select
            value={filtreKat}
            label="Kat"
            onChange={(e) => {
              setFiltreKat(e.target.value as number);
              setFiltreAlan('');
            }}
          >
            <MenuItem value="">Tümü</MenuItem>
            {filtreKatSecenekleri.map((k) => (
              <MenuItem key={k.id} value={k.id}>{k.ad}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!filtreKat}>
          <InputLabel>Alan</InputLabel>
          <Select
            value={filtreAlan}
            label="Alan"
            onChange={(e) => setFiltreAlan(e.target.value as number)}
          >
            <MenuItem value="">Tümü</MenuItem>
            {filtreAlanSecenekleri.map((a) => (
              <MenuItem key={a.id} value={a.id}>{a.ad}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Başlangıç (min)"
          type="datetime-local"
          value={filtreBaslangic}
          onChange={(e) => setFiltreBaslangic(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          size="small"
          label="Bitiş (maks)"
          type="datetime-local"
          value={filtreBitis}
          onChange={(e) => setFiltreBitis(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Button variant="outlined" onClick={handleFiltreUygula}>
          Filtrele
        </Button>

        <Button variant="text" onClick={handleFiltreTemizle}>
          Temizle
        </Button>
      </Box>

      {/* Rezervasyon listesi */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Alan</TableCell>
              <TableCell>Başlangıç</TableCell>
              <TableCell>Bitiş</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell align="right">İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rezervasyonlar.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{alanAdiGetir(r.alanId)}</TableCell>
                <TableCell>{new Date(r.baslangicZamani).toLocaleString('tr-TR')}</TableCell>
                <TableCell>{new Date(r.bitisZamani).toLocaleString('tr-TR')}</TableCell>
                <TableCell>{r.aciklama}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleSil(r.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Rezervasyonlar;
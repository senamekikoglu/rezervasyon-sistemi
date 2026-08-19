import { useEffect, useState } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  getTesisler,
  getBinalar,
  getKatlar,
  getAlanlar,
  addTesis,
  addBina,
  addKat,
  addAlan,
  updateTesis,
  updateBina,
  updateKat,
  updateAlan,
  deleteTesis,
  deleteBina,
  deleteKat,
  deleteAlan,
} from '../services/tesisYapisiService';
import type { Tesis, Bina, Kat, Alan } from '../types/models';

type Seviye = 'tesis' | 'bina' | 'kat' | 'alan';

function TesisYapisi() {
  const [tesisler, setTesisler] = useState<Tesis[]>([]);
  const [binalar, setBinalar] = useState<Bina[]>([]);
  const [katlar, setKatlar] = useState<Kat[]>([]);
  const [alanlar, setAlanlar] = useState<Alan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');

  // Ekleme formu için state'ler
  const [seviye, setSeviye] = useState<Seviye>('tesis');
  const [yeniAd, setYeniAd] = useState('');
  const [ustId, setUstId] = useState<number | ''>('');

  // Düzenleme için state'ler: hangi node düzenleniyor, yeni değeri ne
  const [duzenlenenKey, setDuzenlenenKey] = useState<string | null>(null);
  const [duzenlenenAd, setDuzenlenenAd] = useState('');

  const veriGetir = async () => {
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
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    veriGetir();
  }, []);

  const handleEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');

    try {
      if (seviye === 'tesis') {
        await addTesis(yeniAd);
      } else if (seviye === 'bina') {
        if (ustId === '') return setHata('Lütfen bağlı olacağı tesisi seçin.');
        await addBina(yeniAd, ustId as number);
      } else if (seviye === 'kat') {
        if (ustId === '') return setHata('Lütfen bağlı olacağı binayı seçin.');
        await addKat(yeniAd, ustId as number);
      } else if (seviye === 'alan') {
        if (ustId === '') return setHata('Lütfen bağlı olacağı katı seçin.');
        await addAlan(yeniAd, ustId as number);
      }

      setYeniAd('');
      setUstId('');
      await veriGetir();
    } catch (err: any) {
      setHata(err.response?.data ?? 'Bir hata oluştu.');
    }
  };

  const handleSil = async (tip: Seviye, id: number) => {
    setHata('');
    try {
      if (tip === 'tesis') await deleteTesis(id);
      else if (tip === 'bina') await deleteBina(id);
      else if (tip === 'kat') await deleteKat(id);
      else if (tip === 'alan') await deleteAlan(id);

      await veriGetir();
    } catch (err: any) {
      setHata(err.response?.data ?? 'Silme işlemi başarısız oldu.');
    }
  };

  const duzenlemeyeBasla = (tip: Seviye, id: number, mevcutAd: string) => {
    setHata('');
    setDuzenlenenKey(`${tip}-${id}`);
    setDuzenlenenAd(mevcutAd);
  };

  const duzenlemeyiIptalEt = () => {
    setDuzenlenenKey(null);
    setDuzenlenenAd('');
  };

  const duzenlemeyiKaydet = async (tip: Seviye, id: number) => {
    setHata('');
    try {
      if (tip === 'tesis') {
        await updateTesis(id, duzenlenenAd);
      } else if (tip === 'bina') {
        const bina = binalar.find((b) => b.id === id);
        if (bina) await updateBina(id, duzenlenenAd, bina.tesisId);
      } else if (tip === 'kat') {
        const kat = katlar.find((k) => k.id === id);
        if (kat) await updateKat(id, duzenlenenAd, kat.binaId);
      } else if (tip === 'alan') {
        const alan = alanlar.find((a) => a.id === id);
        if (alan) await updateAlan(id, duzenlenenAd, alan.katId);
      }

      setDuzenlenenKey(null);
      setDuzenlenenAd('');
      await veriGetir();
    } catch (err: any) {
      setHata(err.response?.data ?? 'Güncelleme işlemi başarısız oldu.');
    }
  };

  // Seviyeye göre üst seçim listesi (dropdown içeriği)
  const ustSecenekleri =
    seviye === 'bina' ? tesisler :
    seviye === 'kat' ? binalar :
    seviye === 'alan' ? katlar : [];

  // Ortak node etiketi (label) render fonksiyonu: normal görünüm veya düzenleme kutusu
  const renderLabel = (tip: Seviye, id: number, ad: string) => {
    const key = `${tip}-${id}`;
    const duzenleniyor = duzenlenenKey === key;

    if (duzenleniyor) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => e.stopPropagation()}>
          <TextField
            size="small"
            value={duzenlenenAd}
            onChange={(e) => setDuzenlenenAd(e.target.value)}
            autoFocus
          />
          <IconButton size="small" onClick={() => duzenlemeyiKaydet(tip, id)}>
            <CheckIcon fontSize="small" color="success" />
          </IconButton>
          <IconButton size="small" onClick={duzenlemeyiIptalEt}>
            <CloseIcon fontSize="small" color="error" />
          </IconButton>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{ad}</span>
        <Box>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); duzenlemeyeBasla(tip, id, ad); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleSil(tip, id); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
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
        Tesis Yapısı
      </Typography>

      {hata && <Alert severity="error" sx={{ mb: 2 }}>{hata}</Alert>}

      {/* Ekleme formu */}
      <Box
        component="form"
        onSubmit={handleEkle}
        sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4, flexWrap: 'wrap' }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Seviye</InputLabel>
          <Select
            value={seviye}
            label="Seviye"
            onChange={(e) => {
              setSeviye(e.target.value as Seviye);
              setUstId('');
            }}
          >
            <MenuItem value="tesis">Tesis</MenuItem>
            <MenuItem value="bina">Bina</MenuItem>
            <MenuItem value="kat">Kat</MenuItem>
            <MenuItem value="alan">Alan</MenuItem>
          </Select>
        </FormControl>

        {seviye !== 'tesis' && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Bağlı Olacağı Üst Kayıt</InputLabel>
            <Select
              value={ustId}
              label="Bağlı Olacağı Üst Kayıt"
              onChange={(e) => setUstId(e.target.value as number)}
            >
              {ustSecenekleri.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.ad}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          size="small"
          label="Ad"
          value={yeniAd}
          onChange={(e) => setYeniAd(e.target.value)}
          required
        />

        <Button type="submit" variant="contained">
          Ekle
        </Button>
      </Box>

      {/* Tree view */}
      <SimpleTreeView>
        {tesisler.map((tesis) => (
          <TreeItem
            key={`tesis-${tesis.id}`}
            itemId={`tesis-${tesis.id}`}
            label={renderLabel('tesis', tesis.id, tesis.ad)}
          >
            {binalar
              .filter((bina) => bina.tesisId === tesis.id)
              .map((bina) => (
                <TreeItem
                  key={`bina-${bina.id}`}
                  itemId={`bina-${bina.id}`}
                  label={renderLabel('bina', bina.id, bina.ad)}
                >
                  {katlar
                    .filter((kat) => kat.binaId === bina.id)
                    .map((kat) => (
                      <TreeItem
                        key={`kat-${kat.id}`}
                        itemId={`kat-${kat.id}`}
                        label={renderLabel('kat', kat.id, kat.ad)}
                      >
                        {alanlar
                          .filter((alan) => alan.katId === kat.id)
                          .map((alan) => (
                            <TreeItem
                              key={`alan-${alan.id}`}
                              itemId={`alan-${alan.id}`}
                              label={renderLabel('alan', alan.id, alan.ad)}
                            />
                          ))}
                      </TreeItem>
                    ))}
                </TreeItem>
              ))}
          </TreeItem>
        ))}
      </SimpleTreeView>
    </Box>
  );
}

export default TesisYapisi;
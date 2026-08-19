import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';

function Login() {
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');

    try {
      const response = await api.post('/Kullanici/login', {
        kullaniciAdi,
        sifre,
      });

      // Basit bir yaklaşım: kullanıcı bilgisini tarayıcıda saklıyoruz
      localStorage.setItem('kullanici', JSON.stringify(response.data));

      navigate('/tesis-yapisi');
    } catch (err) {
      setHata('Kullanıcı adı veya şifre hatalı.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Giriş Yap
      </Typography>

      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 300 }}
      >
        {hata && <Alert severity="error">{hata}</Alert>}

        <TextField
          label="Kullanıcı Adı"
          value={kullaniciAdi}
          onChange={(e) => setKullaniciAdi(e.target.value)}
          required
        />

        <TextField
          label="Şifre"
          type="password"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          required
        />

        <Button type="submit" variant="contained">
          Giriş Yap
        </Button>
      </Box>
    </Box>
  );
}

export default Login;
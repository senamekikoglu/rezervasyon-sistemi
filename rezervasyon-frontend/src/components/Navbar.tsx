import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const kullaniciStr = localStorage.getItem('kullanici');
  const kullanici = kullaniciStr ? JSON.parse(kullaniciStr) : null;

  const handleCikis = () => {
    localStorage.removeItem('kullanici');
    navigate('/login');
  };

  // Login sayfasındaysak navbar'ı hiç gösterme
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Rezervasyon Sistemi
        </Typography>

        <Button color="inherit" onClick={() => navigate('/tesis-yapisi')}>
          Tesis Yapısı
        </Button>

        <Button color="inherit" onClick={() => navigate('/rezervasyonlar')}>
          Rezervasyonlar
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {kullanici && (
            <Typography variant="body2">
              {kullanici.kullaniciAdi}
            </Typography>
          )}
          <Button color="inherit" onClick={handleCikis}>
            Çıkış
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RezervasyonSistemi.API.Data;
using RezervasyonSistemi.API.Models;

namespace RezervasyonSistemi.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KullaniciController : ControllerBase
    {
        private readonly RezervasyonDbContext _context;

        public KullaniciController(RezervasyonDbContext context)
        {
            _context = context;
        }

        // GET: api/Kullanici
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Kullanici>>> GetKullanicilar()
        {
            return await _context.Kullanicilar.ToListAsync();
        }

        // POST: api/Kullanici
        [HttpPost]
        public async Task<ActionResult<Kullanici>> PostKullanici(Kullanici kullanici)
        {
            bool kullaniciAdiVarMi = await _context.Kullanicilar
                .AnyAsync(k => k.KullaniciAdi == kullanici.KullaniciAdi);

            if (kullaniciAdiVarMi)
            {
                return BadRequest("Bu kullanıcı adı zaten kullanılıyor.");
            }

            // NOT: Şimdilik şifreyi düz metin olarak alıyoruz test amaçlı.
            // Login modülünü yazarken burayı gerçek hashleme (BCrypt) ile değiştireceğiz.
            kullanici.SifreHash = BCrypt.Net.BCrypt.HashPassword(kullanici.SifreHash);

            _context.Kullanicilar.Add(kullanici);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetKullanicilar), new { id = kullanici.Id }, kullanici);
        }

        public class LoginRequest
        {
            public string KullaniciAdi { get; set; } = string.Empty;
            public string Sifre { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var kullanici = await _context.Kullanicilar
                .FirstOrDefaultAsync(k => k.KullaniciAdi == request.KullaniciAdi);

            if (kullanici == null)
            {
                return Unauthorized("Kullanıcı adı veya şifre hatalı.");
            }

            bool sifreDogruMu = BCrypt.Net.BCrypt.Verify(request.Sifre, kullanici.SifreHash);

            if (!sifreDogruMu)
            {
                return Unauthorized("Kullanıcı adı veya şifre hatalı.");
            }

            return Ok(new
            {
                kullanici.Id,
                kullanici.KullaniciAdi
            });
        }
    }
     
}
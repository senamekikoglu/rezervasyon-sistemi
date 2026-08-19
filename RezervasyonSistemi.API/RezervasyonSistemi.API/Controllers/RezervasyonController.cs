using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RezervasyonSistemi.API.Data;
using RezervasyonSistemi.API.Models;

namespace RezervasyonSistemi.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RezervasyonController : ControllerBase
    {
        private readonly RezervasyonDbContext _context;

        public RezervasyonController(RezervasyonDbContext context)
        {
            _context = context;
        }

        // GET: api/Rezervasyon
        // Filtreleme destekli: tesisId, binaId, katId, alanId, baslangic, bitis (opsiyonel)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rezervasyon>>> GetRezervasyonlar(
            [FromQuery] int? alanId,
            [FromQuery] DateTime? baslangic,
            [FromQuery] DateTime? bitis)
        {
            var query = _context.Rezervasyonlar
                .Include(r => r.Alan)
                .Include(r => r.Kullanici)
                .AsQueryable();

            if (alanId.HasValue)
            {
                query = query.Where(r => r.AlanId == alanId.Value);
            }

            if (baslangic.HasValue)
            {
                query = query.Where(r => r.BaslangicZamani >= baslangic.Value);
            }

            if (bitis.HasValue)
            {
                query = query.Where(r => r.BitisZamani <= bitis.Value);
            }

            return await query.ToListAsync();
        }

        // GET: api/Rezervasyon/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Rezervasyon>> GetRezervasyon(int id)
        {
            var rezervasyon = await _context.Rezervasyonlar
                .Include(r => r.Alan)
                .Include(r => r.Kullanici)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rezervasyon == null)
            {
                return NotFound();
            }

            return rezervasyon;
        }

        // POST: api/Rezervasyon
        [HttpPost]
        public async Task<ActionResult<Rezervasyon>> PostRezervasyon(Rezervasyon rezervasyon)
        {
            // 1. Alan gerçekten var mı?
            bool alanVarMi = await _context.Alanlar.AnyAsync(a => a.Id == rezervasyon.AlanId);
            if (!alanVarMi)
            {
                return BadRequest("Belirtilen alan bulunamadı.");
            }

            // 2. Kullanıcı gerçekten var mı?
            bool kullaniciVarMi = await _context.Kullanicilar.AnyAsync(k => k.Id == rezervasyon.KullaniciId);
            if (!kullaniciVarMi)
            {
                return BadRequest("Belirtilen kullanıcı bulunamadı.");
            }

            // 3. Başlangıç, bitişten önce olmalı
            if (rezervasyon.BaslangicZamani >= rezervasyon.BitisZamani)
            {
                return BadRequest("Başlangıç zamanı, bitiş zamanından önce olmalıdır.");
            }

            // 4. Geçmiş tarihe rezervasyon yapılamaz
            if (rezervasyon.BaslangicZamani < DateTime.Now)
            {
                return BadRequest("Geçmiş bir tarihe rezervasyon yapamazsınız.");
            }

            // 5. ÇAKIŞMA KONTROLÜ - projenin en kritik kuralı
            // İki zaman aralığı çakışır eğer: (BaşlangıçA < BitişB) VE (BitişA > BaşlangıçB)
            bool cakismaVarMi = await _context.Rezervasyonlar
                .Where(r => r.AlanId == rezervasyon.AlanId)
                .AnyAsync(r =>
                    rezervasyon.BaslangicZamani < r.BitisZamani &&
                    rezervasyon.BitisZamani > r.BaslangicZamani);

            if (cakismaVarMi)
            {
                return BadRequest("Bu alan, seçilen zaman aralığında zaten rezerve edilmiş.");
            }

            _context.Rezervasyonlar.Add(rezervasyon);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRezervasyon), new { id = rezervasyon.Id }, rezervasyon);
        }

        // PUT: api/Rezervasyon/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRezervasyon(int id, Rezervasyon rezervasyon)
        {
            if (id != rezervasyon.Id)
            {
                return BadRequest();
            }

            if (rezervasyon.BaslangicZamani >= rezervasyon.BitisZamani)
            {
                return BadRequest("Başlangıç zamanı, bitiş zamanından önce olmalıdır.");
            }

            // Çakışma kontrolü (kendi kaydı hariç)
            bool cakismaVarMi = await _context.Rezervasyonlar
                .Where(r => r.AlanId == rezervasyon.AlanId && r.Id != id)
                .AnyAsync(r =>
                    rezervasyon.BaslangicZamani < r.BitisZamani &&
                    rezervasyon.BitisZamani > r.BaslangicZamani);

            if (cakismaVarMi)
            {
                return BadRequest("Bu alan, seçilen zaman aralığında zaten rezerve edilmiş.");
            }

            _context.Entry(rezervasyon).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Rezervasyonlar.AnyAsync(r => r.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Rezervasyon/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRezervasyon(int id)
        {
            var rezervasyon = await _context.Rezervasyonlar.FindAsync(id);

            if (rezervasyon == null)
            {
                return NotFound();
            }

            _context.Rezervasyonlar.Remove(rezervasyon);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
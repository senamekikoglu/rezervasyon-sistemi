using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RezervasyonSistemi.API.Data;
using RezervasyonSistemi.API.Models;

namespace RezervasyonSistemi.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KatController : ControllerBase
    {
        private readonly RezervasyonDbContext _context;

        public KatController(RezervasyonDbContext context)
        {
            _context = context;
        }

        // GET: api/Kat
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Kat>>> GetKatlar()
        {
            return await _context.Katlar.ToListAsync();
        }

        // GET: api/Kat/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Kat>> GetKat(int id)
        {
            var kat = await _context.Katlar.FindAsync(id);

            if (kat == null)
            {
                return NotFound();
            }

            return kat;
        }

        // POST: api/Kat
        [HttpPost]
        public async Task<ActionResult<Kat>> PostKat(Kat kat)
        {
            // Bağlı olacağı bina gerçekten var mı?
            bool binaVarMi = await _context.Binalar.AnyAsync(b => b.Id == kat.BinaId);
            if (!binaVarMi)
            {
                return BadRequest("Belirtilen bina bulunamadı.");
            }

            // Aynı bina içinde aynı isimde kat var mı?
            bool isimVarMi = await _context.Katlar
                .AnyAsync(k => k.BinaId == kat.BinaId && k.Ad == kat.Ad);

            if (isimVarMi)
            {
                return BadRequest("Bu binada aynı isimde bir kat zaten mevcut.");
            }

            _context.Katlar.Add(kat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetKat), new { id = kat.Id }, kat);
        }

        // PUT: api/Kat/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutKat(int id, Kat kat)
        {
            if (id != kat.Id)
            {
                return BadRequest();
            }

            bool binaVarMi = await _context.Binalar.AnyAsync(b => b.Id == kat.BinaId);
            if (!binaVarMi)
            {
                return BadRequest("Belirtilen bina bulunamadı.");
            }

            bool isimVarMi = await _context.Katlar
                .AnyAsync(k => k.BinaId == kat.BinaId && k.Ad == kat.Ad && k.Id != id);

            if (isimVarMi)
            {
                return BadRequest("Bu binada aynı isimde bir kat zaten mevcut.");
            }

            _context.Entry(kat).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Katlar.AnyAsync(k => k.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Kat/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKat(int id)
        {
            var kat = await _context.Katlar
                .Include(k => k.Alanlar)
                .FirstOrDefaultAsync(k => k.Id == id);

            if (kat == null)
            {
                return NotFound();
            }

            // Alt kaydı (alan) varsa silmeyi engelle
            if (kat.Alanlar.Any())
            {
                return BadRequest("Bu kata bağlı alanlar var, önce onları silmelisiniz.");
            }

            _context.Katlar.Remove(kat);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RezervasyonSistemi.API.Data;
using RezervasyonSistemi.API.Models;

namespace RezervasyonSistemi.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlanController : ControllerBase
    {
        private readonly RezervasyonDbContext _context;

        public AlanController(RezervasyonDbContext context)
        {
            _context = context;
        }

        // GET: api/Alan
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Alan>>> GetAlanlar()
        {
            return await _context.Alanlar.ToListAsync();
        }

        // GET: api/Alan/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Alan>> GetAlan(int id)
        {
            var alan = await _context.Alanlar.FindAsync(id);

            if (alan == null)
            {
                return NotFound();
            }

            return alan;
        }

        // POST: api/Alan
        [HttpPost]
        public async Task<ActionResult<Alan>> PostAlan(Alan alan)
        {
            // Bağlı olacağı kat gerçekten var mı?
            bool katVarMi = await _context.Katlar.AnyAsync(k => k.Id == alan.KatId);
            if (!katVarMi)
            {
                return BadRequest("Belirtilen kat bulunamadı.");
            }

            // Aynı kat içinde aynı isimde alan var mı?
            bool isimVarMi = await _context.Alanlar
                .AnyAsync(a => a.KatId == alan.KatId && a.Ad == alan.Ad);

            if (isimVarMi)
            {
                return BadRequest("Bu katta aynı isimde bir alan zaten mevcut.");
            }

            _context.Alanlar.Add(alan);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAlan), new { id = alan.Id }, alan);
        }

        // PUT: api/Alan/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAlan(int id, Alan alan)
        {
            if (id != alan.Id)
            {
                return BadRequest();
            }

            bool katVarMi = await _context.Katlar.AnyAsync(k => k.Id == alan.KatId);
            if (!katVarMi)
            {
                return BadRequest("Belirtilen kat bulunamadı.");
            }

            bool isimVarMi = await _context.Alanlar
                .AnyAsync(a => a.KatId == alan.KatId && a.Ad == alan.Ad && a.Id != id);

            if (isimVarMi)
            {
                return BadRequest("Bu katta aynı isimde bir alan zaten mevcut.");
            }

            _context.Entry(alan).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Alanlar.AnyAsync(a => a.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Alan/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlan(int id)
        {
            var alan = await _context.Alanlar
                .Include(a => a.Rezervasyonlar)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (alan == null)
            {
                return NotFound();
            }

            // Alt kaydı (rezervasyon) varsa silmeyi engelle
            if (alan.Rezervasyonlar.Any())
            {
                return BadRequest("Bu alana bağlı rezervasyonlar var, önce onları silmelisiniz.");
            }

            _context.Alanlar.Remove(alan);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
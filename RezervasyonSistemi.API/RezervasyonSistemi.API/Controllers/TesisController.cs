using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RezervasyonSistemi.API.Data;
using RezervasyonSistemi.API.Models;

namespace RezervasyonSistemi.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TesisController : ControllerBase
    {
        private readonly RezervasyonDbContext _context;

        public TesisController(RezervasyonDbContext context)
        {
            _context = context;
        }

        // GET: api/Tesis
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tesis>>> GetTesisler()
        {
            return await _context.Tesisler.ToListAsync();
        }

        // GET: api/Tesis/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Tesis>> GetTesis(int id)
        {
            var tesis = await _context.Tesisler.FindAsync(id);

            if (tesis == null)
            {
                return NotFound();
            }

            return tesis;
        }

        // POST: api/Tesis
        [HttpPost]
        public async Task<ActionResult<Tesis>> PostTesis(Tesis tesis)
        {
            // Aynı isimde tesis var mı kontrolü
            bool isimVarMi = await _context.Tesisler
                .AnyAsync(t => t.Ad == tesis.Ad);

            if (isimVarMi)
            {
                return BadRequest("Bu isimde bir tesis zaten mevcut.");
            }

            _context.Tesisler.Add(tesis);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTesis), new { id = tesis.Id }, tesis);
        }

        // PUT: api/Tesis/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTesis(int id, Tesis tesis)
        {
            if (id != tesis.Id)
            {
                return BadRequest();
            }

            bool isimVarMi = await _context.Tesisler
                .AnyAsync(t => t.Ad == tesis.Ad && t.Id != id);

            if (isimVarMi)
            {
                return BadRequest("Bu isimde bir tesis zaten mevcut.");
            }

            _context.Entry(tesis).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Tesisler.AnyAsync(t => t.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Tesis/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTesis(int id)
        {
            var tesis = await _context.Tesisler
                .Include(t => t.Binalar)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tesis == null)
            {
                return NotFound();
            }

            // Alt kaydı (bina) varsa silmeyi engelle
            if (tesis.Binalar.Any())
            {
                return BadRequest("Bu tesise bağlı binalar var, önce onları silmelisiniz.");
            }

            _context.Tesisler.Remove(tesis);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
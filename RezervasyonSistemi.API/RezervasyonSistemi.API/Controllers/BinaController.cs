using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RezervasyonSistemi.API.Data;
using RezervasyonSistemi.API.Models;

namespace RezervasyonSistemi.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BinaController : ControllerBase
    {
        private readonly RezervasyonDbContext _context;

        public BinaController(RezervasyonDbContext context)
        {
            _context = context;
        }

        // GET: api/Bina
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bina>>> GetBinalar()
        {
            return await _context.Binalar.ToListAsync();
        }

        // GET: api/Bina/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Bina>> GetBina(int id)
        {
            var bina = await _context.Binalar.FindAsync(id);

            if (bina == null)
            {
                return NotFound();
            }

            return bina;
        }

        // POST: api/Bina
        [HttpPost]
        public async Task<ActionResult<Bina>> PostBina(Bina bina)
        {
            // Bağlı olacağı tesis gerçekten var mı?
            bool tesisVarMi = await _context.Tesisler.AnyAsync(t => t.Id == bina.TesisId);
            if (!tesisVarMi)
            {
                return BadRequest("Belirtilen tesis bulunamadı.");
            }

            // Aynı tesis içinde aynı isimde bina var mı?
            bool isimVarMi = await _context.Binalar
                .AnyAsync(b => b.TesisId == bina.TesisId && b.Ad == bina.Ad);

            if (isimVarMi)
            {
                return BadRequest("Bu tesiste aynı isimde bir bina zaten mevcut.");
            }

            _context.Binalar.Add(bina);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBina), new { id = bina.Id }, bina);
        }

        // PUT: api/Bina/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBina(int id, Bina bina)
        {
            if (id != bina.Id)
            {
                return BadRequest();
            }

            bool tesisVarMi = await _context.Tesisler.AnyAsync(t => t.Id == bina.TesisId);
            if (!tesisVarMi)
            {
                return BadRequest("Belirtilen tesis bulunamadı.");
            }

            bool isimVarMi = await _context.Binalar
                .AnyAsync(b => b.TesisId == bina.TesisId && b.Ad == bina.Ad && b.Id != id);

            if (isimVarMi)
            {
                return BadRequest("Bu tesiste aynı isimde bir bina zaten mevcut.");
            }

            _context.Entry(bina).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Binalar.AnyAsync(b => b.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Bina/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBina(int id)
        {
            var bina = await _context.Binalar
                .Include(b => b.Katlar)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (bina == null)
            {
                return NotFound();
            }

            // Alt kaydı (kat) varsa silmeyi engelle
            if (bina.Katlar.Any())
            {
                return BadRequest("Bu binaya bağlı katlar var, önce onları silmelisiniz.");
            }

            _context.Binalar.Remove(bina);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
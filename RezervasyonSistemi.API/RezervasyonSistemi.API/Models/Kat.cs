using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RezervasyonSistemi.API.Models
{
    public class Kat
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Ad { get; set; } = string.Empty;

        // Foreign key: hangi binaya bağlı
        [Required]
        public int BinaId { get; set; }

        [ForeignKey(nameof(BinaId))]
        public Bina? Bina { get; set; }

        // Bir katın birden fazla alanı olabilir
        public ICollection<Alan> Alanlar { get; set; } = new List<Alan>();
    }
}
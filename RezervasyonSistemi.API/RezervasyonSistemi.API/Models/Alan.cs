using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RezervasyonSistemi.API.Models
{
    public class Alan
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Ad { get; set; } = string.Empty;

        // Foreign key: hangi kata bağlı
        [Required]
        public int KatId { get; set; }

        [ForeignKey(nameof(KatId))]
        public Kat? Kat { get; set; }

        // Bir alanın birden fazla rezervasyonu olabilir (farklı zamanlarda)
        public ICollection<Rezervasyon> Rezervasyonlar { get; set; } = new List<Rezervasyon>();
    }
}
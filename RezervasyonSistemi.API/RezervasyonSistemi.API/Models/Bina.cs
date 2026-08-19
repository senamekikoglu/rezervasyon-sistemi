using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RezervasyonSistemi.API.Models
{
    public class Bina
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Ad { get; set; } = string.Empty;

        // Foreign key: hangi tesise bağlı
        [Required]
        public int TesisId { get; set; }

        [ForeignKey(nameof(TesisId))]
        public Tesis? Tesis { get; set; }

        // Bir binanın birden fazla katı olabilir
        public ICollection<Kat> Katlar { get; set; } = new List<Kat>();
    }
}
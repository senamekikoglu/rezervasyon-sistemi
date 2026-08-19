using System.ComponentModel.DataAnnotations;

namespace RezervasyonSistemi.API.Models
{
    public class Tesis
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Ad { get; set; } = string.Empty;

        // Bir tesisin birden fazla binası olabilir
        public ICollection<Bina> Binalar { get; set; } = new List<Bina>();
    }
}
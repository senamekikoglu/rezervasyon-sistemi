using System.ComponentModel.DataAnnotations;

namespace RezervasyonSistemi.API.Models
{
    public class Kullanici
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string KullaniciAdi { get; set; } = string.Empty;

        [Required]
        public string SifreHash { get; set; } = string.Empty;

        public ICollection<Rezervasyon> Rezervasyonlar { get; set; } = new List<Rezervasyon>();
    }
}
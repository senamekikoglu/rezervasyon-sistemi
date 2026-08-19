using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RezervasyonSistemi.API.Models
{
    public class Rezervasyon
    {
        public int Id { get; set; }

        [Required]
        public int AlanId { get; set; }

        [ForeignKey(nameof(AlanId))]
        public Alan? Alan { get; set; }

        [Required]
        public int KullaniciId { get; set; }

        [ForeignKey(nameof(KullaniciId))]
        public Kullanici? Kullanici { get; set; }

        [Required]
        public DateTime BaslangicZamani { get; set; }

        [Required]
        public DateTime BitisZamani { get; set; }

        [MaxLength(500)]
        public string? Aciklama { get; set; }
    }
}
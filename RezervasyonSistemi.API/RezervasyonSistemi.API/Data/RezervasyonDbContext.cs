using Microsoft.EntityFrameworkCore;
using RezervasyonSistemi.API.Models;

namespace RezervasyonSistemi.API.Data
{
    public class RezervasyonDbContext : DbContext
    {
        public RezervasyonDbContext(DbContextOptions<RezervasyonDbContext> options)
            : base(options)
        {
        }

        public DbSet<Tesis> Tesisler { get; set; }
        public DbSet<Bina> Binalar { get; set; }
        public DbSet<Kat> Katlar { get; set; }
        public DbSet<Alan> Alanlar { get; set; }
        public DbSet<Kullanici> Kullanicilar { get; set; }
        public DbSet<Rezervasyon> Rezervasyonlar { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Aynı seviyede aynı isimde kayıt olmasını engelle (unique constraint)
            modelBuilder.Entity<Tesis>()
                .HasIndex(t => t.Ad)
                .IsUnique();

            modelBuilder.Entity<Bina>()
                .HasIndex(b => new { b.TesisId, b.Ad })
                .IsUnique();

            modelBuilder.Entity<Kat>()
                .HasIndex(k => new { k.BinaId, k.Ad })
                .IsUnique();

            modelBuilder.Entity<Alan>()
                .HasIndex(a => new { a.KatId, a.Ad })
                .IsUnique();

            // Alt kaydı olan üst kaydın silinmesini engelle (Restrict)
            modelBuilder.Entity<Bina>()
                .HasOne(b => b.Tesis)
                .WithMany(t => t.Binalar)
                .HasForeignKey(b => b.TesisId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Kat>()
                .HasOne(k => k.Bina)
                .WithMany(b => b.Katlar)
                .HasForeignKey(k => k.BinaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Alan>()
                .HasOne(a => a.Kat)
                .WithMany(k => k.Alanlar)
                .HasForeignKey(a => a.KatId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Rezervasyon>()
                .HasOne(r => r.Alan)
                .WithMany(a => a.Rezervasyonlar)
                .HasForeignKey(r => r.AlanId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Kullanici>()
                .HasIndex(k => k.KullaniciAdi)
                .IsUnique();
        }
    }
}
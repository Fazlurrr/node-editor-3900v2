using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.DAL;

public class DB : DbContext {
    public DB(DbContextOptions<DB> options) : base(options) {
        Database.EnsureCreated();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Node>()
                .OwnsOne(n => n.Position);
        modelBuilder.Entity<Node>()
                .OwnsOne(n => n.Data);
        modelBuilder.Entity<Node>().HasKey(e => e.NodeId);
        modelBuilder.Entity<Node>().Property(e => e.NodeId).HasMaxLength(255);

        modelBuilder.Entity<Edge>()
                .OwnsOne(e => e.Data);
        modelBuilder.Entity<Edge>().HasKey(e => e.EdgeId);
        modelBuilder.Entity<Edge>().Property(e => e.EdgeId).HasMaxLength(255);
    }

    public DbSet<Node> Nodes { get; set;}
    public DbSet<Edge> Edges { get; set;}
}

using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using server.Models;

namespace server.DAL;

public class DB : DbContext
{
    public DB(DbContextOptions<DB> options) : base(options)
    {
        Database.EnsureCreated();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Node>()
                .HasDiscriminator<string>("NodeType")
                .HasValue<Block>("Block")
                .HasValue<Terminal>("Terminal")
                .HasValue<Connector>("Connector");

        modelBuilder.Entity<Node>()
                .OwnsOne(n => n.Position);

        modelBuilder.Entity<Terminal>().OwnsOne(t => t.Data, data =>
        {
            data.Property(nd => nd.ConnectedTo)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                    v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                .HasColumnType("json");

            data.Property(nd => nd.ConnectedBy)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                    v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                .HasColumnType("json");

            data.Property(nd => nd.CustomAttributes)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                    v => JsonSerializer.Deserialize<List<CustomAttribute>>(v, new JsonSerializerOptions()) ?? new List<CustomAttribute>())
                .HasColumnType("json");
        });
        modelBuilder.Entity<Connector>().OwnsOne(c => c.Data, data =>
        {
            data.Property(nd => nd.ConnectedTo)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                    v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                .HasColumnType("json");

            data.Property(nd => nd.ConnectedBy)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                    v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                .HasColumnType("json");

            data.Property(nd => nd.CustomAttributes)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                    v => JsonSerializer.Deserialize<List<CustomAttribute>>(v, new JsonSerializerOptions()) ?? new List<CustomAttribute>())
                .HasColumnType("json");

            data.Property(nd => nd.DirectParts)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                    v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                .HasColumnType("json");

        });
        modelBuilder.Entity<Block>()
                    .OwnsOne(n => n.Data, data =>
                    {
                        data.Property(nd => nd.Children)
                            .HasConversion(
                                v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                                v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                            .HasColumnType("json");

                        data.Property(nd => nd.Terminals)
                            .HasConversion(
                                v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                                v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                            .HasColumnType("json");

                        data.Property(nd => nd.DirectParts).HasConversion(
                            v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                            v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                            .HasColumnType("json");

                        data.Property(nd => nd.Fulfills).HasConversion(
                            v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                            v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                            .HasColumnType("json");

                        data.Property(nd => nd.FulfilledBy).HasConversion(
                            v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                            v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                            .HasColumnType("json");
                        data.Property(nd => nd.ConnectedTo)
                            .HasConversion(
                                v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                                v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                            .HasColumnType("json");

                        data.Property(nd => nd.ConnectedBy)
                            .HasConversion(
                                v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                                v => JsonSerializer.Deserialize<List<Relation>>(v, new JsonSerializerOptions()) ?? new List<Relation>())
                            .HasColumnType("json");

                        data.Property(nd => nd.CustomAttributes)
                            .HasConversion(
                                v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                                v => JsonSerializer.Deserialize<List<CustomAttribute>>(v, new JsonSerializerOptions()) ?? new List<CustomAttribute>())
                            .HasColumnType("json");
                    });

        modelBuilder.Entity<Block>()
            .Property(b => b.Width)
            .HasDefaultValue(110);
        modelBuilder.Entity<Block>()
            .Property(b => b.Height)
            .HasDefaultValue(66);

        modelBuilder.Entity<Edge>()
            .OwnsOne(e => e.Data);
    }

    public DbSet<Node> Nodes { get; set; }
    public DbSet<Edge> Edges { get; set; }
    public DbSet<User> Users { get; set; }
}

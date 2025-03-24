using server.Models;

namespace server.DAL
{
  public class DbInit
  {

    public static void Seed(IApplicationBuilder app)
    {
      using var serviceScope = app.ApplicationServices.CreateAsyncScope();
      DB context = serviceScope.ServiceProvider.GetRequiredService<DB>();

      context.Database.EnsureDeleted();
      context.Database.EnsureCreated();

      

      if (!context.Users.Any())
      {
        byte[] salt = PasswordHasher.GenerateSalt();
        string hashedPassword = PasswordHasher.HashPassword("admin", salt);
        
        // Add admin user
        User admin = new()
        {
          Username = "admin",
          Password = hashedPassword,
          Salt = Convert.ToBase64String(salt),
          Role = UserRole.Admin
        };
        context.Users.Add(admin);

        // Add normal users
        string[] users = new string[] { "baifan", "yuanwei", "fazlur", "lars", "filip", "eskil" };

        foreach (string user in users)
        {
          salt = PasswordHasher.GenerateSalt();
          hashedPassword = PasswordHasher.HashPassword(user, salt);

          User newUser = new()
          {
            Username = user,
            Password = hashedPassword,
            Salt = Convert.ToBase64String(salt),
            Role = UserRole.User
          };

          context.Users.Add(newUser);
        }

        // Add usertest users
        for (int i = 1; i <= 20; i++)
        {
          salt = PasswordHasher.GenerateSalt();
          hashedPassword = PasswordHasher.HashPassword($"testuser{i}", salt);

          User testUser = new()
          {
            Username = $"testuser{i}",
            Password = hashedPassword,
            Salt = Convert.ToBase64String(salt),
            Role = UserRole.User
          };

          context.Users.Add(testUser);
        }

      context.SaveChanges();
      }

    }
  }
}

using System.Security.Cryptography;

namespace server.DAL;

public class PasswordHasher
{
    public static byte[] GenerateSalt(int saltSize = 16)
    {
        byte[] salt = new byte[saltSize];
#pragma warning disable SYSLIB0023 
        using (var rng = new RNGCryptoServiceProvider())
        {
            rng.GetBytes(salt);
        }
#pragma warning restore SYSLIB0023 
        return salt;
    }

    public static string HashPassword(string password, byte[] salt, int iterations = 10000, int hashSize = 32)
    {
#pragma warning disable SYSLIB0041 
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations);
#pragma warning restore SYSLIB0041 
        byte[] hashBytes = pbkdf2.GetBytes(hashSize);
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }

    public static bool VerifyPassword(string password, byte[] salt, string hashedPassword, int iterations = 10000)
    {
        string hashedAttempt = HashPassword(password, salt, iterations, 32);
        return hashedPassword.Equals(hashedAttempt, StringComparison.OrdinalIgnoreCase);
    }
}
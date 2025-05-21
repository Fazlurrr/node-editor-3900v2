using System.Text;
using server.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace server.DAL;

public class JWT
{
  public static string GenerateJwtToken(User user, IConfiguration _configuration)
  {
    var envKey = _configuration["JwtSettings:SecretKey"] ?? throw new InvalidOperationException("JwtSettings:SecretKey is not set");

    var secretKey = Encoding.UTF8.GetBytes(envKey);
    var jwtTokenHandler = new JwtSecurityTokenHandler();

    var tokenDescriptor = new SecurityTokenDescriptor
    {
      Subject = new ClaimsIdentity(new[]
        {
            new Claim("username", user.Username),
            new Claim("id", user.Id),
            new Claim("role", user.Role == UserRole.Admin ? "admin" : "user")
        }),
      Expires = DateTime.UtcNow.AddDays(7),
      SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256Signature)
    };

    var token = jwtTokenHandler.CreateToken(tokenDescriptor);
    var tokenString = jwtTokenHandler.WriteToken(token);

    return tokenString;
  }

  public static void ValidateToken(string token, IConfiguration _configuration)
  {
    var jwtTokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"] ?? throw new InvalidOperationException("JwtSettings:SecretKey is not set"));

    jwtTokenHandler.ValidateToken(token, new TokenValidationParameters
    {
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new SymmetricSecurityKey(key),
      ValidateIssuer = false,
      ValidateAudience = false,
      ClockSkew = TimeSpan.Zero
    }, out SecurityToken validatedToken);
  }
}
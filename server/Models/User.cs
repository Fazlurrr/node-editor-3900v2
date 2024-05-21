using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using server.DAL;

namespace server.Models;

public class UserDto
{
  public required string Id { get; set; }
  public required string Username { get; set; }
  public required UserRole Role { get; set; }

}

public class PasswordUpdateModel
{
  public string CurrentPassword { get; set; } = string.Empty;
  public required string NewPassword { get; set; }
}

public class User
{
  [Key]
  public string Id { get; set; } = Guid.NewGuid().ToString();
  public UserRole Role { get; set; } = UserRole.User;
  public string Username { get; set; } = string.Empty;
  public string Password { get; set; } = string.Empty;
  public string Salt { get; set; } = string.Empty;
}

[JsonConverter(typeof(UserRoleConverter))]
public enum UserRole
{
  Admin,
  User
}
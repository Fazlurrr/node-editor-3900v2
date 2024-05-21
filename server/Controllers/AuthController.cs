using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DAL;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(DB db, ILogger<AuthController> logger, IConfiguration configuration) : Controller
{
  private readonly DB _db = db;
  private readonly ILogger<AuthController> _logger = logger;
  private readonly IConfiguration _configuration = configuration;

  [HttpPost("login")]
  public async Task<IActionResult> Login(User user)
  {
    try
    {
      var usr = await _db.Users.FirstOrDefaultAsync(u => u.Username == user.Username);

      byte[] salt = Convert.FromBase64String(usr?.Salt ?? "");

      var match = PasswordHasher.VerifyPassword(user.Password, salt, usr?.Password ?? "");

      if (!match || usr == null)
      {
        return BadRequest("Invalid credentials");
      }

      var token = JWT.GenerateJwtToken(usr, _configuration);

      return Ok(new
      {
        Token = token,
        User = new
        {
          Id = usr.Id,
          Username = usr.Username,
          Role = usr.Role,
        },
      });
    }
    catch (DbUpdateException dbEx)
    {
      _logger.LogError("[AuthController]: Database fetch failed: {Error}", dbEx.Message);
      return StatusCode(500, "Failed login user due to database error.");
    }
    catch (Exception e)
    {
      _logger.LogError("[AuthController]: Failed login user: {Error}", e.Message);
      return StatusCode(500, "An unexpected error occurred.");
    }
  }

  [Route("register")]
  [Authorize(Roles = "admin")]
  [HttpPost]
  public async Task<IActionResult> Register(User user)
  {
    try
    {
      var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Username == user.Username);

      if (existingUser != null)
      {
        return BadRequest("User with username " + user.Username + " already exists");
      }

      byte[] salt = PasswordHasher.GenerateSalt();
      string hashedPassword = PasswordHasher.HashPassword(user.Password, salt);

      user.Salt = Convert.ToBase64String(salt);
      user.Password = hashedPassword;
      user.Role = user.Role == UserRole.Admin ? UserRole.Admin : UserRole.User;

      await _db.Users.AddAsync(user);
      await _db.SaveChangesAsync();

      return Ok("User registered successfully");
    }
    catch (DbUpdateException dbEx)
    {
      _logger.LogError("[AuthController]: Database fetch failed: {Error}", dbEx.Message);
      return StatusCode(500, "Failed register user due to database error.");
    }
    catch (Exception e)
    {
      _logger.LogError("[AuthController]: Failed register user: {Error}", e.Message);
      return StatusCode(500, "An unexpected error occurred.");
    }
  }

  [HttpGet("users")]
  [Authorize(Roles = "admin")]
  public async Task<IActionResult> GetUsers()
  {
    try
    {
      var users = await _db.Users.Select(b => new UserDto
      {
        Id = b.Id,
        Username = b.Username,
        Role = b.Role,
      }).ToListAsync();

      return Ok(users);
    }
    catch (DbUpdateException dbEx)
    {
      _logger.LogError("[AuthController]: Database fetch failed: {Error}", dbEx.Message);
      return StatusCode(500, "Failed fetch users due to database error.");
    }
    catch (Exception e)
    {
      _logger.LogError("[AuthController]: Failed fetch users: {Error}", e.Message);
      return StatusCode(500, "An unexpected error occurred.");
    }
  }

  [HttpDelete("users/{id}")]
  [Authorize(Roles = "admin")]

  public async Task<IActionResult> DeleteUser(string id)
  {
    try
    {
      var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);

      if (user == null)
      {
        return BadRequest("User with id " + id + " does not exist");
      }

      _db.Users.Remove(user);
      await _db.SaveChangesAsync();

      return Ok("User deleted successfully");
    }
    catch (DbUpdateException dbEx)
    {
      _logger.LogError("[AuthController]: Database fetch failed: {Error}", dbEx.Message);
      return StatusCode(500, "Failed delete user due to database error.");
    }
    catch (Exception e)
    {
      _logger.LogError("[AuthController]: Failed delete user: {Error}", e.Message);
      return StatusCode(500, "An unexpected error occurred.");
    }
  }

  [HttpPut("users/{id}/password")]
  [Authorize]
  public async Task<IActionResult> ChangePassword(string id, PasswordUpdateModel password)
  {
    try
    {
      var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);

      if (existingUser == null)
      {
        return BadRequest("User with id " + id + " does not exist");
      }

      if (password.CurrentPassword != "" && !PasswordHasher.VerifyPassword(password.CurrentPassword, Convert.FromBase64String(existingUser.Salt), existingUser.Password))
      {
        return BadRequest("Could not update password: Current password is incorrect");
      }

      byte[] salt = PasswordHasher.GenerateSalt();

      string hashedPassword = PasswordHasher.HashPassword(password.NewPassword, salt);

      existingUser.Salt = Convert.ToBase64String(salt);
      existingUser.Password = hashedPassword;

      await _db.SaveChangesAsync();

      return Ok("Password changed successfully");
    }
    catch (DbUpdateException dbEx)
    {
      _logger.LogError("[AuthController]: Database fetch failed: {Error}", dbEx.Message);
      return StatusCode(500, "Failed change password due to database error.");
    }
    catch (Exception e)
    {
      _logger.LogError("[AuthController]: Failed change password: {Error}", e.Message);
      return StatusCode(500, "An unexpected error occurred.");
    }
  }

  [HttpPut("users/{id}/role")]
  [Authorize(Roles = "admin")]
  public async Task<IActionResult> ChangeRole(string id, User user)
  {
    try
    {
      var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);

      if (existingUser == null)
      {
        return BadRequest("User with id " + id + " does not exist");
      }

      existingUser.Role = user.Role == UserRole.Admin ? UserRole.Admin : UserRole.User;

      await _db.SaveChangesAsync();

      return Ok("Role changed successfully");
    }
    catch (DbUpdateException dbEx)
    {
      _logger.LogError("[AuthController]: Database fetch failed: {Error}", dbEx.Message);
      return StatusCode(500, "Failed change role due to database error.");
    }
    catch (Exception e)
    {
      _logger.LogError("[AuthController]: Failed change role: {Error}", e.Message);
      return StatusCode(500, "An unexpected error occurred.");
    }
  }
}
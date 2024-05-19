using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DAL;
using server.Models;
using Xunit;

namespace server.Controllers.Tests;

public class AuthControllerTest
{
  private readonly DB _db;
  private readonly ILogger<AuthController> _logger;
  private readonly IConfiguration _configuration;
  private readonly AuthController _authController;

  public AuthControllerTest()
  {
    var options = new DbContextOptionsBuilder<DB>()
        .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
        .Options;

    _db = new DB(options);
    _logger = new Logger<AuthController>(new LoggerFactory());
    _configuration = new ConfigurationBuilder().Build();

    _authController = new AuthController(_db, _logger, _configuration);
  }

  [Fact]
  public async Task Register_ValidUser_ReturnsOkResult()
  {
    // Generate a salt for password hashing
    var salt = PasswordHasher.GenerateSalt();

    // Hash the password with the generated salt
    var hashedPassword = PasswordHasher.HashPassword("testuser", salt);

    // Create a test user with the hashed password and salt
    var testUser = new User { Username = "testuser", Password = hashedPassword, Salt = Convert.ToBase64String(salt) };

    // Attempt to register the test user
    var result = await _authController.Register(testUser);

    // Assert that the registration result is an OkObjectResult (indicating a successful registration)
    Assert.IsType<OkObjectResult>(result);
  }

  [Fact]
  public async Task Login_ValidUser_ReturnsOkResult()
  {
    // Generate a salt for password hashing
    var salt = PasswordHasher.GenerateSalt();

    // Hash the password with the generated salt
    var hashedPassword = PasswordHasher.HashPassword("testuser", salt);

    // Create a test user with the hashed password and salt
    var testUser = new User { Username = "testuser2", Password = hashedPassword, Salt = Convert.ToBase64String(salt) };

    // Add the test user to the database
    _db.Users.Add(testUser);
    await _db.SaveChangesAsync();

    // Attempt to login with the test user's credentials
    var loginResult = await _authController.Login(new User { Username = testUser.Username, Password = "testuser" });

    // If the login result is a BadRequestObjectResult, print the error message
    if (loginResult is BadRequestObjectResult badRequestResult)
    {
      Console.WriteLine("Login failed: " + badRequestResult.Value);
    }

    // Assert that the login result is an ObjectResult (indicating a successful login)
    Assert.IsType<ObjectResult>(loginResult);
  }

  [Fact]
  public async Task DeleteUser_ValidUser_ReturnsOkResult()
  {
    // Create a user and save it to the database
    var salt = PasswordHasher.GenerateSalt();
    var hashedPassword = PasswordHasher.HashPassword("testuser", salt);

    var testUser = new User { Username = "testuser3", Password = hashedPassword, Salt = Convert.ToBase64String(salt) };

    _db.Users.Add(testUser);
    await _db.SaveChangesAsync();

    // Call the DeleteUser method with the ID of the created user
    var result = await _authController.DeleteUser(testUser.Id);

    // Assert that the result is an OkObjectResult
    Assert.IsType<OkObjectResult>(result);
  }

  [Fact]
  public async Task ChangePassword_ValidUser_ReturnsOkResult()
  {
    // Create a user and save it to the database
    var salt = PasswordHasher.GenerateSalt();
    var hashedPassword = PasswordHasher.HashPassword("testuser", salt);

    var testUser = new User { Username = "testuser4", Password = hashedPassword, Salt = Convert.ToBase64String(salt) };

    _db.Users.Add(testUser);
    await _db.SaveChangesAsync();

    // Create a PasswordUpdateModel with the new password
    var passwordUpdate = new PasswordUpdateModel { Password = "newpassword" };

    // Call the ChangePassword method with the ID of the created user and the new password
    var result = await _authController.ChangePassword(testUser.Id, passwordUpdate);

    // Assert that the result is an OkObjectResult
    Assert.IsType<OkObjectResult>(result);
  }

  [Fact]
  public async Task ChangeRole_ValidUser_ReturnsOkResult()
  {
    // Create a user and save it to the database
    var salt = PasswordHasher.GenerateSalt();
    var hashedPassword = PasswordHasher.HashPassword("testuser", salt);

    var testUser = new User { Username = "testuser5", Password = hashedPassword, Salt = Convert.ToBase64String(salt), Role = UserRole.User };

    _db.Users.Add(testUser);
    await _db.SaveChangesAsync();

    // Create a User with the new role
    var updatedUser = new User { Role = UserRole.Admin };

    // Call the ChangeRole method with the ID of the created user and the new role
    var result = await _authController.ChangeRole(testUser.Id, updatedUser);

    // Assert that the result is an OkObjectResult
    Assert.IsType<OkObjectResult>(result);
  }

  [Fact]
  public async Task Register_ExistingUser_ReturnsBadRequestResult()
  {
    // Create a user and save it to the database
    var salt = PasswordHasher.GenerateSalt();
    var hashedPassword = PasswordHasher.HashPassword("testuser", salt);

    var testUser = new User { Username = "testuser", Password = hashedPassword, Salt = Convert.ToBase64String(salt) };

    _db.Users.Add(testUser);
    await _db.SaveChangesAsync();

    // Attempt to register the same user again
    var result = await _authController.Register(testUser);

    // Assert that the result is a BadRequestObjectResult
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task Login_IncorrectPassword_ReturnsBadRequestResult()
  {
    // Create a user and save it to the database
    var salt = PasswordHasher.GenerateSalt();
    var hashedPassword = PasswordHasher.HashPassword("testuser", salt);

    var testUser = new User { Username = "testuser", Password = hashedPassword, Salt = Convert.ToBase64String(salt) };

    _db.Users.Add(testUser);
    await _db.SaveChangesAsync();

    // Attempt to login with an incorrect password
    var result = await _authController.Login(new User { Username = testUser.Username, Password = "wrongpassword" });

    // Assert that the result is a BadRequestObjectResult
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task ChangePassword_NonexistentUser_ReturnsBadRequestResult()
  {
    // Create a PasswordUpdateModel with a new password
    var passwordUpdate = new PasswordUpdateModel { Password = "newpassword" };

    // Call the ChangePassword method with a nonexistent user ID
    var result = await _authController.ChangePassword("nonexistent", passwordUpdate);

    // Assert that the result is a BadRequestObjectResult
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task ChangeRole_NonexistentUser_ReturnsBadRequestResult()
  {
    // Create a User with a new role
    var updatedUser = new User { Role = UserRole.Admin };

    // Call the ChangeRole method with a nonexistent user ID
    var result = await _authController.ChangeRole("nonexistent", updatedUser);

    // Assert that the result is a BadRequestObjectResult
    Assert.IsType<BadRequestObjectResult>(result);
  }
}
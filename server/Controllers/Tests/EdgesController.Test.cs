using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DAL;
using server.Models;
using Xunit;
using Moq;

namespace server.Controllers.Tests;

public class EdgesControllerTest
{
  private readonly DB _db;
  private readonly ILogger<EdgesController> _logger;
  private readonly EdgesController _edgesController;

  public EdgesControllerTest()
  {
    var options = new DbContextOptionsBuilder<DB>()
        .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
        .Options;

    _db = new DB(options);
    _logger = new Logger<EdgesController>(new LoggerFactory());

    _edgesController = new EdgesController(_db, _logger);
  }

  [Fact]
  public async Task FetchEdges_UserHasEdges_ReturnsOkResultWithEdges()
  {
    // Create a user and save it to the database
    var testUser = new User { Username = "testuser" };
    _db.Users.Add(testUser);
    await _db.SaveChangesAsync();

    // Create some edges created by the user and save them to the database
    var testEdges = new List<Edge>
  {
    new Edge {
      Data = new EdgeData {
        CreatedBy = testUser.Id,
        Id = "123",
        Label = "New edge 1",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "111",
      SourceHandle = "sourceHandle1",
      Target = "target1",
      Source = "source1",
      TargetHandle = "targetHandle1",
      Type = EdgeType.Connected
    },
    new Edge {
      Data = new EdgeData {
        CreatedBy = testUser.Id,
        Id = "222",
        Label = "New edge 2",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "222",
      SourceHandle = "sourceHandle2",
      Target = "target2",
      Source = "source2",
      TargetHandle = "targetHandle2",
      Type = EdgeType.Connected
    }
  };
    _db.Edges.AddRange(testEdges);
    await _db.SaveChangesAsync();

    // Call the FetchEdges method with the ID of the user
    var result = await _edgesController.FetchEdges(testUser.Id);

    // Assert that the result is an OkObjectResult with the edges
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var edges = Assert.IsType<List<Edge>>(okResult.Value);
    Assert.Equal(testEdges.Count, edges.Count);
  }

  [Fact]
public async Task FetchEdges_DbUpdateException_ReturnsServerError()
{
    // Mock the Edges DbSet to throw DbUpdateException on ToListAsync
    var mockEdgesDbSet = new Mock<DbSet<Edge>>();
    mockEdgesDbSet.As<IQueryable<Edge>>().Setup(m => m.Provider).Throws(new DbUpdateException());

    _db.Edges = mockEdgesDbSet.Object;

    // Call the FetchEdges method
    var result = await _edgesController.FetchEdges("someId");

    var objectResult = Assert.IsType<ObjectResult>(result.Result);
    Assert.Equal(500, objectResult.StatusCode);
    Assert.Equal("Failed to fetch edges due to database error.", objectResult.Value);
}

  [Fact]
public async Task FetchEdges_Exception_ReturnsServerError()
{
    // Mock the Edges DbSet to throw general exception on ToListAsync
    var mockEdgesDbSet = new Mock<DbSet<Edge>>();
    mockEdgesDbSet.As<IQueryable<Edge>>().Setup(m => m.Provider).Throws(new Exception("Unexpected"));

    _db.Edges = mockEdgesDbSet.Object;

    // Call the FetchEdges method
    var result = await _edgesController.FetchEdges("someId");

    var objectResult = Assert.IsType<ObjectResult>(result.Result);
    Assert.Equal(500, objectResult.StatusCode);
    Assert.Equal("An unexpected error occurred.", objectResult.Value);
}

  [Fact]
  public async Task FetchEdges_UserHasNoEdges_ReturnsOkResultWithEmptyList()
  {
    // Create a user and save it to the database
    var testUser = new User { Username = "testuser" };
    _db.Users.Add(testUser);
    await _db.SaveChangesAsync();

    // Call the FetchEdges method with the ID of the user
    var result = await _edgesController.FetchEdges(testUser.Id);

    // Assert that the result is an OkObjectResult with an empty list
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var edges = Assert.IsType<List<Edge>>(okResult.Value);
    Assert.Empty(edges);
  }

  [Fact]
  public async Task FetchEdge_EdgeExists_ReturnsOkResultWithEdge()
  {
    // Create an edge and save it to the database
    var testEdge = new Edge
    {
      Data = new EdgeData
      {
        CreatedBy = "testId",
        Id = "123",
        Label = "New edge 1",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "111",
      SourceHandle = "sourceHandle1",
      Target = "target1",
      Source = "source1",
      TargetHandle = "targetHandle1",
      Type = EdgeType.Connected
    };
    _db.Edges.Add(testEdge);
    await _db.SaveChangesAsync();

    // Call the FetchEdge method with the ID of the edge
    var result = await _edgesController.FetchEdge(testEdge.Id);

    // Assert that the result is an OkObjectResult with the edge
    var okResult = Assert.IsType<OkObjectResult>(result);
    var edge = Assert.IsType<Edge>(okResult.Value);
    Assert.Equal(testEdge.Id, edge.Id);
  }

  [Fact]
  public async Task FetchEdge_EdgeDoesNotExist_ReturnsServerError()
  {
    // Call the FetchEdge method with a non-existing ID
    var result = await _edgesController.FetchEdge("nonExistingId");

    // Assert that the result is an ObjectResult with a 500 status code
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
  }

  [Fact]
  public async Task FetchEdge_DatabaseErrorOccurs_ReturnsServerError()
  {
    // Mock the Edges DbSet to throw an exception when FindAsync is called
    var mockEdgesDbSet = new Mock<DbSet<Edge>>();
    mockEdgesDbSet.Setup(m => m.FindAsync(It.IsAny<string>())).Throws(new DbUpdateException());
    _db.Edges = mockEdgesDbSet.Object;

    // Call the FetchEdge method with any ID
    var result = await _edgesController.FetchEdge("anyId");

    // Assert that the result is an ObjectResult with a 500 status code
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
  }

  [Fact]
  public async Task UploadEdges_EdgesProvided_ReturnsOkResult()
  {
    // Create some edges
    var testEdges = new List<Edge>
    {
      new Edge
      {
        Data = new EdgeData
        {
          CreatedBy = "testId1",
          Id = "123",
          Label = "New edge 1",
          LockConnection = false,
          CreatedAt = DateTime.Now.Ticks,
          UpdatedAt = DateTime.Now.Ticks
        },
        Id = "111",
        SourceHandle = "sourceHandle1",
        Target = "target1",
        Source = "source1",
        TargetHandle = "targetHandle1",
        Type = EdgeType.Connected
      },
    new Edge
    {
      Data = new EdgeData
      {
        CreatedBy = "testId2",
        Id = "222",
        Label = "New edge 2",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "222",
      SourceHandle = "sourceHandle2",
      Target = "target2",
      Source = "source2",
      TargetHandle = "targetHandle2",
      Type = EdgeType.Connected
    }
  };

    // Call the UploadEdges method with the edges
    var result = await _edgesController.UploadEdges(testEdges);

    // Assert that the result is an OkResult
    Assert.IsType<OkResult>(result);

    // Assert that the edges were saved to the database
    foreach (var testEdge in testEdges)
    {
      var edge = await _db.Edges.FindAsync(testEdge.Id);
      Assert.NotNull(edge);
    }
  }

  [Fact]
  public async Task UploadEdges_EdgesNotProvided_ReturnsBadRequest()
  {
    // Call the UploadEdges method without providing edges
#pragma warning disable CS8625 // Cannot convert null literal to non-nullable reference type.
    var result = await _edgesController.UploadEdges(null);
#pragma warning restore CS8625 // Cannot convert null literal to non-nullable reference type.

    // Assert that the result is a BadRequestObjectResult
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task UploadEdges_DatabaseErrorOccurs_ReturnsServerError()
  {
    // Create some edges
    var testEdges = new List<Edge>
    {
      new Edge
      {
        Data = new EdgeData
        {
          CreatedBy = "testId1",
          Id = "123",
          Label = "New edge 1",
          LockConnection = false,
          CreatedAt = DateTime.Now.Ticks,
          UpdatedAt = DateTime.Now.Ticks
        },
        Id = "111",
        SourceHandle = "sourceHandle1",
        Target = "target1",
        Source = "source1",
        TargetHandle = "targetHandle1",
        Type = EdgeType.Connected
      },
    new Edge
    {
      Data = new EdgeData
      {
        CreatedBy = "testId2",
        Id = "222",
        Label = "New edge 2",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "222",
      SourceHandle = "sourceHandle2",
      Target = "target2",
      Source = "source2",
      TargetHandle = "targetHandle2",
      Type = EdgeType.Connected
    }
  };

    // Mock the Edges DbSet to throw an exception when AddRangeAsync is called
    var mockEdgesDbSet = new Mock<DbSet<Edge>>();
    mockEdgesDbSet.Setup(m => m.AddRangeAsync(It.IsAny<IEnumerable<Edge>>(), It.IsAny<CancellationToken>())).Throws(new DbUpdateException());
    _db.Edges = mockEdgesDbSet.Object;

    // Call the UploadEdges method with the edges
    var result = await _edgesController.UploadEdges(testEdges);

    // Assert that the result is an ObjectResult with a 500 status code
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
  }

  [Fact]
public async Task UploadEdges_ExceptionThrown_ReturnsServerError()
{
    // Arrange: create test data
    var testEdges = new List<Edge>
    {
        new Edge
        {
            Data = new EdgeData
            {
                CreatedBy = "testUser",
                Id = "dataId",
                Label = "Edge label",
                LockConnection = false,
                CreatedAt = DateTime.Now.Ticks,
                UpdatedAt = DateTime.Now.Ticks
            },
            Id = "edgeId",
            Source = "source",
            Target = "target",
            SourceHandle = "sourceHandle",
            TargetHandle = "targetHandle",
            Type = EdgeType.Connected
        }
    };

    // Mock the Edges DbSet to throw a general exception
    var mockEdgesDbSet = new Mock<DbSet<Edge>>();
    mockEdgesDbSet
        .Setup(m => m.AddRangeAsync(It.IsAny<IEnumerable<Edge>>(), It.IsAny<CancellationToken>()))
        .Throws(new Exception("Generic failure"));

    // Insert the mock into the context
    _db.Edges = mockEdgesDbSet.Object;

    // Act: Call the method
    var result = await _edgesController.UploadEdges(testEdges);

    // Assert
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
    Assert.Equal("An unexpected error occurred.", objectResult.Value);
}
  [Fact]
  public async Task CreateEdge_EdgeProvided_ReturnsCreatedAtActionResult()
  {
    // Use the first edge from the testEdges list
    var testEdge = new Edge
    {
      Data = new EdgeData
      {
        CreatedBy = "testId1",
        Id = "123",
        Label = "New edge 1",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "111",
      SourceHandle = "sourceHandle1",
      Target = "target1",
      Source = "source1",
      TargetHandle = "targetHandle1",
      Type = EdgeType.Connected
    };

    // Call the CreateEdge method with the edge
    var result = await _edgesController.CreateEdge(testEdge);

    // Assert that the result is a CreatedAtActionResult
    Assert.IsType<CreatedAtActionResult>(result);

    // Assert that the edge was saved to the database
    var edge = await _db.Edges.FindAsync(testEdge.Id);
    Assert.NotNull(edge);
  }

  [Fact]
  public async Task CreateEdge_EdgeNotProvided_ReturnsBadRequest()
  {
    // Call the CreateEdge method without providing an edge
#pragma warning disable CS8625 // Cannot convert null literal to non-nullable reference type.
    var result = await _edgesController.CreateEdge(null);
#pragma warning restore CS8625 // Cannot convert null literal to non-nullable reference type.

    // Assert that the result is a BadRequestObjectResult
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task CreateEdge_DatabaseErrorOccurs_ReturnsServerError()
  {
    // Use the first edge from the testEdges list
    var testEdge = new Edge
    {
      Data = new EdgeData
      {
        CreatedBy = "testId1",
        Id = "123",
        Label = "New edge 1",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "111",
      SourceHandle = "sourceHandle1",
      Target = "target1",
      Source = "source1",
      TargetHandle = "targetHandle1",
      Type = EdgeType.Connected
    };

    // Mock the Edges DbSet to throw an exception when AddAsync is called
    var mockEdgesDbSet = new Mock<DbSet<Edge>>();
    mockEdgesDbSet.Setup(m => m.AddAsync(It.IsAny<Edge>(), It.IsAny<CancellationToken>())).Throws(new DbUpdateException());
    _db.Edges = mockEdgesDbSet.Object;

    // Call the CreateEdge method with the edge
    var result = await _edgesController.CreateEdge(testEdge);

    // Assert that the result is an ObjectResult with a 500 status code
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
  }

  [Fact]
public async Task CreateEdge_ExceptionThrown_ReturnsServerError()
{
    // Arrange: a valid edge
    var testEdge = new Edge
    {
        Data = new EdgeData
        {
            CreatedBy = "user123",
            Id = "dataId",
            Label = "New edge",
            LockConnection = false,
            CreatedAt = DateTime.Now.Ticks,
            UpdatedAt = DateTime.Now.Ticks
        },
        Id = "edgeId",
        Source = "source",
        Target = "target",
        SourceHandle = "sourceHandle",
        TargetHandle = "targetHandle",
        Type = EdgeType.Connected
    };

    // Mock the Edges DbSet to throw a general exception when AddAsync is called
    var mockEdgesDbSet = new Mock<DbSet<Edge>>();
    mockEdgesDbSet
        .Setup(m => m.AddAsync(It.IsAny<Edge>(), It.IsAny<CancellationToken>()))
        .Throws(new Exception("Unexpected failure"));

    // Insert the mock into the context
    _db.Edges = mockEdgesDbSet.Object;

    // Act
    var result = await _edgesController.CreateEdge(testEdge);

    // Assert
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
    Assert.Equal("An unexpected error occurred.", objectResult.Value);
}

  [Fact]
  public async Task DeleteEdge_EdgeExists_ReturnsOkResult()
  {
    // Use the first edge from the testEdges list
    var testEdge = new Edge
    {
      Data = new EdgeData
      {
        CreatedBy = "testId1",
        Id = "123",
        Label = "New edge 1",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "111",
      SourceHandle = "sourceHandle1",
      Target = "target1",
      Source = "source1",
      TargetHandle = "targetHandle1",
      Type = EdgeType.Connected
    };

    // Add the edge to the database
    await _db.Edges.AddAsync(testEdge);
    await _db.SaveChangesAsync();

    // Call the DeleteEdge method with the edge's ID
    var result = await _edgesController.DeleteEdge(testEdge.Id);

    // Assert that the result is an OkObjectResult
    Assert.IsType<OkObjectResult>(result);

    // Assert that the edge was deleted from the database
    var edge = await _db.Edges.FindAsync(testEdge.Id);
    Assert.Null(edge);
  }

  [Fact]
  public async Task DeleteEdge_EdgeDoesNotExist_ReturnsServerError()
  {
    // Call the DeleteEdge method with a non-existing ID
    var result = await _edgesController.DeleteEdge("nonExistingId");

    // Assert that the result is an ObjectResult with a 500 status code
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
  }

  [Fact]
  public async Task DeleteEdge_DatabaseErrorOccurs_ReturnsServerError()
  {
    // Use the first edge from the testEdges list
    var testEdge = new Edge
    {
      Data = new EdgeData
      {
        CreatedBy = "testId1",
        Id = "123",
        Label = "New edge 1",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "111",
      SourceHandle = "sourceHandle1",
      Target = "target1",
      Source = "source1",
      TargetHandle = "targetHandle1",
      Type = EdgeType.Connected
    };

    // Add the edge to the database
    await _db.Edges.AddAsync(testEdge);
    await _db.SaveChangesAsync();

    // Mock the Edges DbSet to throw an exception when Remove is called
    var mockEdgesDbSet = new Mock<DbSet<Edge>>();
    mockEdgesDbSet.Setup(m => m.Remove(It.IsAny<Edge>())).Throws(new DbUpdateException());
    _db.Edges = mockEdgesDbSet.Object;

    // Call the DeleteEdge method with the edge's ID
    var result = await _edgesController.DeleteEdge(testEdge.Id);

    // Assert that the result is an ObjectResult with a 500 status code
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
  }

// Mock DbContext to simulate a failure
// Used to test DbUpdateExeption handling and generic Exception in the controller
public class FailingDbContext : DB
{
    private readonly bool _throwDbUpdateException;

    public FailingDbContext(DbContextOptions<DB> options, bool throwDbUpdateException = true)
        : base(options)
    {
        _throwDbUpdateException = throwDbUpdateException;
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        if (_throwDbUpdateException)
            throw new DbUpdateException("Simulated DbUpdate failure");
        else
            throw new Exception("Simulated general failure");
    }
}

  [Fact]
public async Task DeleteEdge_WhenDbUpdateExceptionThrown_ReturnsServerError()
{
    // Arrange
    var options = new DbContextOptionsBuilder<DB>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options;

    // Use normal context to insert a test edge
    var setupDb = new DB(options);
    var testEdge = new Edge
    {
        Data = new EdgeData
        {
            CreatedBy = "user123",
            Id = "dataId",
            Label = "Test edge",
            LockConnection = false,
            CreatedAt = DateTime.Now.Ticks,
            UpdatedAt = DateTime.Now.Ticks
        },
        Id = "edge123",
        Source = "source",
        Target = "target",
        SourceHandle = "sh",
        TargetHandle = "th",
        Type = EdgeType.Connected
    };

    await setupDb.Edges.AddAsync(testEdge);
    await setupDb.SaveChangesAsync();

    // Act using failing context
    var failingDb = new FailingDbContext(options);
    var controller = new EdgesController(failingDb, _logger);
    var result = await controller.DeleteEdge(testEdge.Id);

    // Assert
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
    Assert.Equal("Failed to delete edge due to database error.", objectResult.Value);
}

  [Fact]
  public async Task DeleteEdges_EdgesExist_ReturnsOkResult()
  {
    var testEdges = new List<Edge>
  {
    new Edge {
      Data = new EdgeData {
        CreatedBy = "testId1",
        Id = "123",
        Label = "New edge 1",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "111",
      SourceHandle = "sourceHandle1",
      Target = "target1",
      Source = "source1",
      TargetHandle = "targetHandle1",
      Type = EdgeType.Connected
    },
    new Edge {
      Data = new EdgeData {
        CreatedBy = "testId2",
        Id = "222",
        Label = "New edge 2",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "222",
      SourceHandle = "sourceHandle2",
      Target = "target2",
      Source = "source2",
      TargetHandle = "targetHandle2",
      Type = EdgeType.Connected
    }
  };
    // Use the edges from the testEdges list
    foreach (var edge in testEdges)
    {
      // Add the edges to the database
      await _db.Edges.AddAsync(edge);
    }
    await _db.SaveChangesAsync();

    // Call the DeleteEdges method with the createdBy id
    var result = await _edgesController.DeleteEdges(testEdges[0].Data.CreatedBy);

    // Assert that the result is an OkObjectResult
    var okResult = Assert.IsType<OkObjectResult>(result);

    // Assert that the edges were deleted from the database
    var edges = await _db.Edges.Where(e => e.Data.CreatedBy == testEdges[0].Data.CreatedBy).ToListAsync();
    Assert.Empty(edges);
  }

  [Fact]
public async Task DeleteEdges_WhenNoEdgesMatchUserId_ReturnsServerError()
{
    // Arrange: a userId with no edges
    var userId = "empty-user";

    // Act
    var result = await _edgesController.DeleteEdges(userId);

    // Assert: hits catch (Exception e)
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
    Assert.Equal("An unexpected error occurred.", objectResult.Value);
}

  [Fact]
  public async Task DeleteEdges_DatabaseErrorOccurs_ReturnsServerError()
  {
    var testEdges = new List<Edge>
  {
    new Edge {
      Data = new EdgeData {
        CreatedBy = "testId1",
        Id = "123",
        Label = "New edge 1",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "111",
      SourceHandle = "sourceHandle1",
      Target = "target1",
      Source = "source1",
      TargetHandle = "targetHandle1",
      Type = EdgeType.Connected
    },
    new Edge {
      Data = new EdgeData {
        CreatedBy = "testId2",
        Id = "222",
        Label = "New edge 2",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "222",
      SourceHandle = "sourceHandle2",
      Target = "target2",
      Source = "source2",
      TargetHandle = "targetHandle2",
      Type = EdgeType.Connected
    }
  };
    // Use the edges from the testEdges list
    foreach (var edge in testEdges)
    {
      // Add the edges to the database
      await _db.Edges.AddAsync(edge);
    }
    await _db.SaveChangesAsync();

    // Mock the Edges DbSet to throw an exception when RemoveRange is called
    var mockEdgesDbSet = new Mock<DbSet<Edge>>();
    mockEdgesDbSet.Setup(m => m.RemoveRange(It.IsAny<IEnumerable<Edge>>())).Throws(new DbUpdateException());
    _db.Edges = mockEdgesDbSet.Object;

    // Call the DeleteEdges method with the createdBy id
    var result = await _edgesController.DeleteEdges(testEdges[0].Data.CreatedBy);

    // Assert that the result is an ObjectResult with a 500 status code
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
  }

  [Fact]
public async Task DeleteEdges_WhenDbUpdateExceptionThrown_ReturnsServerError()
{
    // Arrange
    var options = new DbContextOptionsBuilder<DB>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options;

    // Use a normal context to insert test edges
    var setupDb = new DB(options);
    var userId = "user123";

    var edges = new List<Edge>
    {
        new Edge
        {
            Data = new EdgeData
            {
                CreatedBy = userId,
                Id = "data1",
                Label = "Edge 1",
                LockConnection = false,
                CreatedAt = DateTime.Now.Ticks,
                UpdatedAt = DateTime.Now.Ticks
            },
            Id = "edge1",
            Source = "source1",
            Target = "target1",
            SourceHandle = "sh1",
            TargetHandle = "th1",
            Type = EdgeType.Connected
        },
        new Edge
        {
            Data = new EdgeData
            {
                CreatedBy = userId,
                Id = "data2",
                Label = "Edge 2",
                LockConnection = false,
                CreatedAt = DateTime.Now.Ticks,
                UpdatedAt = DateTime.Now.Ticks
            },
            Id = "edge2",
            Source = "source2",
            Target = "target2",
            SourceHandle = "sh2",
            TargetHandle = "th2",
            Type = EdgeType.Connected
        }
    };

    await setupDb.Edges.AddRangeAsync(edges);
    await setupDb.SaveChangesAsync();

    // Use failing context
    var failingDb = new FailingDbContext(options);
    var controller = new EdgesController(failingDb, _logger);

    // Act
    var result = await controller.DeleteEdges(userId);

    // Assert
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
    Assert.Equal("Failed to delete edges due to database error.", objectResult.Value);
}

  [Fact]
  public async Task UpdateEdge_EdgeExists_ReturnsCreatedAtActionResult()
  {
    // Use the first edge from the testEdges list
    var testEdge = new Edge
    {
      Data = new EdgeData
      {
        CreatedBy = "testId1",
        Id = "123",
        Label = "New edge 1",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "111",
      SourceHandle = "sourceHandle1",
      Target = "target1",
      Source = "source1",
      TargetHandle = "targetHandle1",
      Type = EdgeType.Connected
    };

    // Add the edge to the database
    await _db.Edges.AddAsync(testEdge);
    await _db.SaveChangesAsync();

    // Modify the edge
    testEdge.Data.CreatedBy = "newCreator";

    // Call the UpdateEdge method with the modified edge
    var result = await _edgesController.UpdateEdge(testEdge);

    // Assert that the result is a CreatedAtActionResult
    Assert.IsType<CreatedAtActionResult>(result);

    // Assert that the edge was updated in the database
    var edge = await _db.Edges.FindAsync(testEdge.Id);
    Assert.Equal("newCreator", edge?.Data.CreatedBy);
  }

  [Fact]
  public async Task UpdateEdge_EdgeDoesNotExist_ReturnsServerError()
  {
    // Use the first edge from the testEdges list and modify its ID to a non-existing one
    var testEdge = new Edge
    {
      Data = new EdgeData
      {
        CreatedBy = "testId1",
        Id = "123",
        Label = "New edge 1",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "111",
      SourceHandle = "sourceHandle1",
      Target = "target1",
      Source = "source1",
      TargetHandle = "targetHandle1",
      Type = EdgeType.Connected
    };
    testEdge.Id = "nonExistingId";

    // Call the UpdateEdge method with the non-existing edge
    var result = await _edgesController.UpdateEdge(testEdge);

    // Assert that the result is an ObjectResult with a 500 status code
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
  }

  [Fact]
  public async Task UpdateEdge_DatabaseErrorOccurs_ReturnsServerError()
  {
    // Use the first edge from the testEdges list
    var testEdge = new Edge
    {
      Data = new EdgeData
      {
        CreatedBy = "testId1",
        Id = "123",
        Label = "New edge 1",
        LockConnection = false,
        CreatedAt = DateTime.Now.Ticks,
        UpdatedAt = DateTime.Now.Ticks
      },
      Id = "111",
      SourceHandle = "sourceHandle1",
      Target = "target1",
      Source = "source1",
      TargetHandle = "targetHandle1",
      Type = EdgeType.Connected
    };

    // Add the edge to the database
    await _db.Edges.AddAsync(testEdge);
    await _db.SaveChangesAsync();

    // Modify the edge
    testEdge.Data.CreatedBy = "newCreator";

    // Mock the Edges DbSet to throw an exception when Update is called
    var mockEdgesDbSet = new Mock<DbSet<Edge>>();
    mockEdgesDbSet.Setup(m => m.Update(It.IsAny<Edge>())).Throws(new DbUpdateException());
    _db.Edges = mockEdgesDbSet.Object;

    // Call the UpdateEdge method with the modified edge
    var result = await _edgesController.UpdateEdge(testEdge);

    // Assert that the result is an ObjectResult with a 500 status code
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
  }

  [Fact]
public async Task UpdateEdge_WhenExceptionThrown_ReturnsServerError()
{
    // Arrange
    var options = new DbContextOptionsBuilder<DB>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options;

    var setupDb = new DB(options);
    var testEdge = new Edge
    {
        Id = "edgeX",
        Data = new EdgeData
        {
            Id = "dataX",
            CreatedBy = "user123",
            Label = "Original",
            LockConnection = false,
            CreatedAt = DateTime.Now.Ticks,
            UpdatedAt = DateTime.Now.Ticks
        },
        Source = "source1",
        Target = "target1",
        SourceHandle = "sh",
        TargetHandle = "th",
        Type = EdgeType.Connected
    };

    await setupDb.Edges.AddAsync(testEdge);
    await setupDb.SaveChangesAsync();

    testEdge.Data.Label = "Updated Label";

    // Uses FailingDbContext with generic Exception mode
    var failingDb = new FailingDbContext(options, throwDbUpdateException: false);
    var controller = new EdgesController(failingDb, _logger);

    // Act
    var result = await controller.UpdateEdge(testEdge);

    // Assert
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
    Assert.Equal("An unexpected error occurred.", objectResult.Value);
}

  [Fact]
public async Task DeleteEdgesBulk_ValidIds_ReturnsOkResult()
{
    var testEdge = new Edge
    {
        Id = "edge1",
        Data = new EdgeData
        {
            CreatedBy = "creator",
            Id = "data1",
            CreatedAt = DateTime.Now.Ticks,
            UpdatedAt = DateTime.Now.Ticks,
            LockConnection = false,
            Label = "Default Label"
        },
        Source = "source1",
        SourceHandle = "sourceHandle1",
        Target = "target1",
        TargetHandle = "targetHandle1",
        Type = EdgeType.Connected
    };

    await _db.Edges.AddAsync(testEdge);
    await _db.SaveChangesAsync();

    var result = await _edgesController.DeleteEdgesBulk(new List<string> { testEdge.Id });

    var okResult = Assert.IsType<OkObjectResult>(result);
    Assert.Equal("Selected edges have been deleted.", okResult.Value);

    var deleted = await _db.Edges.FindAsync(testEdge.Id);
    Assert.Null(deleted);
}

  [Fact]
public async Task DeleteEdgesBulk_NoIdsProvided_ReturnsBadRequest()
{
    var result = await _edgesController.DeleteEdgesBulk(new List<string>());

    var badRequest = Assert.IsType<BadRequestObjectResult>(result);
    Assert.Equal("No edge IDs provided.", badRequest.Value);
}

  [Fact]
public async Task DeleteEdgesBulk_NoEdgesFound_ReturnsNotFound()
{
    var result = await _edgesController.DeleteEdgesBulk(new List<string> { "nonExistentId" });

    var notFound = Assert.IsType<NotFoundObjectResult>(result);
    Assert.Equal("No edges found for the provided IDs.", notFound.Value);
}

  [Fact]
public async Task DeleteEdgesBulk_WhenDbUpdateExceptionThrown_ReturnsServerError()
{
    // Arrange
    var options = new DbContextOptionsBuilder<DB>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options;

    // Insert one edge normally
    var setupDb = new DB(options);
    var testEdge = new Edge
    {
        Id = "edge123",
        Data = new EdgeData
        {
            Id = "data123",
            CreatedBy = "user1",
            Label = "To be deleted",
            LockConnection = false,
            CreatedAt = DateTime.Now.Ticks,
            UpdatedAt = DateTime.Now.Ticks
        },
        Source = "source",
        Target = "target",
        SourceHandle = "sh",
        TargetHandle = "th",
        Type = EdgeType.Connected
    };

    await setupDb.Edges.AddAsync(testEdge);
    await setupDb.SaveChangesAsync();

    // Uses failing DB to throw DbUpdateException
    var failingDb = new FailingDbContext(options, throwDbUpdateException: true);
    var controller = new EdgesController(failingDb, _logger);

    // Act
    var result = await controller.DeleteEdgesBulk(new List<string> { testEdge.Id });

    // Assert
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
    Assert.Equal("Failed to delete edges due to a database error.", objectResult.Value);
}

  [Fact]
public async Task DeleteEdgesBulk_WhenGenericExceptionThrown_ReturnsServerError()
{
    // Arrange
    var options = new DbContextOptionsBuilder<DB>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options;

    var setupDb = new DB(options);
    var testEdge = new Edge
    {
        Id = "edge999",
        Data = new EdgeData
        {
            Id = "data999",
            CreatedBy = "userX",
            Label = "Label",
            LockConnection = false,
            CreatedAt = DateTime.Now.Ticks,
            UpdatedAt = DateTime.Now.Ticks
        },
        Source = "a",
        Target = "b",
        SourceHandle = "shX",
        TargetHandle = "thX",
        Type = EdgeType.Connected
    };

    await setupDb.Edges.AddAsync(testEdge);
    await setupDb.SaveChangesAsync();

    // Uses failing DB that throws generic Exception
    var failingDb = new FailingDbContext(options, throwDbUpdateException: false);
    var controller = new EdgesController(failingDb, _logger);

    // Act
    var result = await controller.DeleteEdgesBulk(new List<string> { testEdge.Id });

    // Assert
    var objectResult = Assert.IsType<ObjectResult>(result);
    Assert.Equal(500, objectResult.StatusCode);
    Assert.Equal("An unexpected error occurred.", objectResult.Value);
}

}
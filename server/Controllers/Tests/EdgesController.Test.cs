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

}
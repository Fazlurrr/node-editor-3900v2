using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DAL;
using server.Models;
using Xunit;

namespace server.Controllers.Tests;

public class NodesControllerTest
{
  private readonly DB _db;
  private readonly ILogger<NodesController> _logger;
  private readonly NodesController _nodesController;

  public NodesControllerTest()
  {
    var options = new DbContextOptionsBuilder<DB>()
        .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
        .Options;

    _db = new DB(options);
    _logger = new Logger<NodesController>(new LoggerFactory());

    _nodesController = new NodesController(_db, _logger);
  }

  [Fact]
  public async Task FetchNodes_NodesExist_ReturnsOkObjectResult()
  {
    var createdBy = "testCreator";
    // // Use the first node from the testNodes list
    List<Node> testNodes =
    [
      new Block(id: "testBlockId", new Position { X = 2, Y = 2 }, new BlockData() { Label = "blockLabel", Aspect = AspectType.Function, CreatedBy = createdBy }),
      new Terminal("testTerminalId", new Position { X = 2, Y = 2 }, new TerminalData { Label = "terminalLabel", Aspect = AspectType.Location, CreatedBy = createdBy }),
      new Connector("testConnectorId", new Position { X = 3, Y = 3 }, new ConnectorData { Label = "connectorLabel", Aspect = AspectType.Product, CreatedBy = createdBy })
    ];
    // Add the node to the database;
    await _db.Nodes.AddRangeAsync(testNodes);
    await _db.SaveChangesAsync();

    // Call the FetchNodes method with the createdBy id
    var result = await _nodesController.FetchNodes(createdBy);

    // Assert that the result is an OkObjectResult
    var okObjectResult = Assert.IsType<OkObjectResult>(result.Result);

    // Assert that the result contains the node
    var nodes = Assert.IsType<List<object>>(okObjectResult.Value);

    Assert.Contains(nodes, n => n is BlockDto block && block.Id == testNodes[0].Id);
    Assert.Contains(nodes, n => n is TerminalDto terminal && terminal.Id == testNodes[1].Id);
    Assert.Contains(nodes, n => n is ConnectorDto connector && connector.Id == testNodes[2].Id);
  }

  [Fact]
  public async Task FetchNodes_NoNodesExist_ReturnsOkObjectResultWithEmptyList()
  {
    var createdBy = "testCreator";

    // Call the FetchNodes method with the createdBy id
    var result = await _nodesController.FetchNodes(createdBy);

    // Assert that the result is an OkObjectResult
    var okObjectResult = Assert.IsType<OkObjectResult>(result.Result);

    // Assert that the result contains an empty list
    var nodes = Assert.IsType<List<object>>(okObjectResult.Value);
    Assert.Empty(nodes);
  }

  [Fact]
  public async Task FetchNode_NodeExists_ReturnsNode()
  {
    // Arrange
    var id = "testId";
    var createdBy = "testCreator";
    var node = new Block(id, new Position { X = 2, Y = 2 }, new BlockData() { Label = "blockLabel", Aspect = AspectType.Function, CreatedBy = createdBy });
    _db.Nodes.Add(node);
    await _db.SaveChangesAsync();

    // Act
    var actionResult = await _nodesController.FetchNode(id);

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(actionResult);
    var returnedNode = Assert.IsType<Block>(okResult.Value);
    Assert.Equal(id, returnedNode.Id);
  }

  [Fact]
  public async Task FetchNode_NodeDoesNotExist_ReturnsNotFound()
  {
    // Arrange
    var id = "testId";

    // Act
    var actionResult = await _nodesController.FetchNode(id);

    // Assert
    var notFoundResult = Assert.IsType<NotFoundObjectResult>(actionResult);
    Assert.Equal("Node with id " + id + " does not exist", notFoundResult.Value);
  }

  [Fact]
  public async Task UploadNodes_ReturnsBadRequest_WhenDataIsUndefined()
  {
    // Act
    // Call the UploadNodes method on the controller with the undefined data
    var result = await _nodesController.UploadNodes(new JsonElement());

    // Assert
    // Check that the result of the method is a BadRequestObjectResult, which indicates that the input data was not valid
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task UploadNodes_ReturnsBadRequest_WhenRequiredFieldsAreMissing()
  {
    // Arrange
    // Define a JSON string that represents a list of nodes with missing required fields
    var data = JsonDocument.Parse("[{\"type\": \"block\"}]").RootElement;

    // Act
    // Call the UploadNodes method on the controller with the incomplete data
    var result = await _nodesController.UploadNodes(data);

    // Assert
    // Check that the result of the method is a BadRequestObjectResult, which indicates that the input data was not valid
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task CreateNode_ReturnsBadRequest_WhenDataIsUndefined()
  {
    // Act
    // Call the CreateNode method on the controller with the undefined data
    var result = await _nodesController.CreateNode(new JsonElement());

    // Assert
    // Check that the result of the method is a BadRequestObjectResult, which indicates that the input data was not valid
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task CreateNode_ReturnsBadRequest_WhenRequiredFieldsAreMissing()
  {
    // Arrange
    // Define a JSON string that represents a node with missing required fields
    var data = JsonDocument.Parse("{\"type\": \"block\", \"id\": \"1\", \"position\": {\"x\": 0, \"y\": 0}}").RootElement;

    // Act
    // Call the CreateNode method on the controller with the incomplete data
    var result = await _nodesController.CreateNode(data);

    // Assert
    // Check that the result of the method is a BadRequestObjectResult, which indicates that the input data was not valid
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task DeleteNode_ReturnsOk_WhenNodeIsDeleted()
  {
    // Arrange
    // Define a test id and create a node with the test id
    var id = "testId";
    var node = new Block(id, new Position { X = 2, Y = 2 }, new BlockData() { Label = "blockLabel", Aspect = AspectType.Function, CreatedBy = "testCreator" });
    // Add the created node to the mock database
    _db.Nodes.Add(node);
    await _db.SaveChangesAsync();

    // Act
    // Call the DeleteNode method on the controller with the test id
    var result = await _nodesController.DeleteNode(id);

    // Assert
    // Check that the result of the method is an OkObjectResult, which indicates that the node was successfully deleted
    Assert.IsType<OkObjectResult>(result);
  }

  [Fact]
  public async Task DeleteNode_ReturnsBadRequest_WhenIdIsNull()
  {
    // Act
    // Call the DeleteNode method on the controller with null as the id
#pragma warning disable CS8625 // Cannot convert null literal to non-nullable reference type.
    var result = await _nodesController.DeleteNode(null);
#pragma warning restore CS8625 // Cannot convert null literal to non-nullable reference type.

    // Assert
    // Check that the result of the method is a BadRequestObjectResult, which indicates that the input was not valid
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task DeleteNode_ReturnsNotFound_WhenNodeDoesNotExist()
  {
    // Act
    // Call the DeleteNode method on the controller with the non-existent id
    var result = await _nodesController.DeleteNode("1");

    // Assert
    // Check that the result of the method is a NotFoundObjectResult, which indicates that the node was not found in the database
    Assert.IsType<NotFoundObjectResult>(result);
  }

  [Fact]
  public async Task DeleteNodes_ReturnsBadRequest_WhenIdIsNull()
  {
    // Act
    // Call the DeleteNodes method on the controller with null as the creator
#pragma warning disable CS8625 // Cannot convert null literal to non-nullable reference type.
    var result = await _nodesController.DeleteNodes(null);
#pragma warning restore CS8625 // Cannot convert null literal to non-nullable reference type.

    // Assert
    // Check that the result of the method is a BadRequestObjectResult, which indicates that the input was not valid
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task DeleteNodes_ReturnsNotFound_WhenNodesDoNotExist()
  {
    // Act
    // Call the DeleteNodes method on the controller with the test creator
    var result = await _nodesController.DeleteNodes("1");

    // Assert
    // Check that the result of the method is a NotFoundObjectResult, which indicates that no nodes were found for the given creator
    Assert.IsType<NotFoundObjectResult>(result);
  }

  [Fact]
  public async Task DeleteNodes_ReturnsOk_WhenNodesAreDeleted()
  {
    // Arrange
    // Define a test creator and create a list of nodes with the test creator as the creator
    var createdBy = "testCreator";
    List<Node> testNodes =
    [
      new Block(id: "testBlockId", new Position { X = 2, Y = 2 }, new BlockData() { Label = "blockLabel", Aspect = AspectType.Function, CreatedBy = createdBy }),
      new Terminal("testTerminalId", new Position { X = 2, Y = 2 }, new TerminalData { Label = "terminalLabel", Aspect = AspectType.Location, CreatedBy = createdBy }),
      new Connector("testConnectorId", new Position { X = 3, Y = 3 }, new ConnectorData { Label = "connectorLabel", Aspect = AspectType.Product, CreatedBy = createdBy })
    ];

    // Add the created nodes to the mock database
    _db.Nodes.AddRange(testNodes);
    await _db.SaveChangesAsync();

    // Act
    // Call the DeleteNodes method on the controller with the test creator
    var result = await _nodesController.DeleteNodes(createdBy);

    // Assert
    // Check that the result of the method is an OkObjectResult, which indicates that the nodes were successfully deleted
    Assert.IsType<OkObjectResult>(result);
  }

  [Fact]
  public async Task UpdateNode_ReturnsBadRequest_WhenDataIsUndefined()
  {

    // Act
    // Call the UpdateNode method on the controller with the undefined data
    var result = await _nodesController.UpdateNode(new JsonElement());

    // Assert
    // Check that the result of the method is a BadRequestObjectResult, which indicates that the input data was not valid
    Assert.IsType<BadRequestObjectResult>(result);
  }

  [Fact]
  public async Task UpdateNode_ReturnsNotFound_WhenNodeDoesNotExist()
  {
    // Arrange
    // Define a JSON string that represents the data for a node that does not exist in the database
    var json = "{\"type\":\"block\",\"id\":\"1\",\"position\":{\"x\":0,\"y\":0},\"data\":{}}";
    // Parse the JSON string into a JsonElement
    var data = JsonDocument.Parse(json).RootElement;

    // Act
    // Call the UpdateNode method on the controller with the non-existent node data
    var result = await _nodesController.UpdateNode(data);

    // Assert
    // Check that the result of the method is a NotFoundObjectResult, which indicates that the node was not found in the database
    Assert.IsType<NotFoundObjectResult>(result);
  }

  [Fact]
  public async Task UpdateNode_ReturnsOk_WhenNodeIsUpdated()
  {
    // Arrange
    // Define a test id and create a new Block node with the test id and some initial data
    var id = "testId";
    var node = new Block(id, new Position { X = 2, Y = 2 }, new BlockData() { Label = "blockLabel", Aspect = AspectType.Function, CreatedBy = "testCreator" });

    // Add the created node to the mock database
    _db.Nodes.Add(node);
    await _db.SaveChangesAsync();

    // Define a JSON string that represents the updated data for the node
    var json = "{\"type\":\"block\",\"id\":\"testId\",\"position\":{\"x\":0,\"y\":0},\"data\":{}}";
    // Parse the JSON string into a JsonElement
    var data = JsonDocument.Parse(json).RootElement;

    // Act
    // Call the UpdateNode method on the controller with the updated data
    var result = await _nodesController.UpdateNode(data);

    // Assert
    // Check that the result of the method is a CreatedAtActionResult, which indicates that the node was successfully updated
    Assert.IsType<CreatedAtActionResult>(result);
  }

}
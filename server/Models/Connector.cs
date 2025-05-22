namespace server.Models;

public class ConnectorDto
{

  public required string Id { get; set; }
  public required Position Position { get; set; }
  public NodeType Type { get; set; }
  public required ConnectorData Data { get; set; }
}

public class ConnectorData : NodeData
{
  public List<Relation> ConnectedTo { get; set; } = [];
  public List<Relation> ConnectedBy { get; set; } = [];
  public List<Relation> DirectParts { get; set; } = [];
  public string DirectPartOf { get; set; } = string.Empty;
}

public class Connector : Node
{
#pragma warning disable CS8618 
#pragma warning disable CS8625 
  private Connector() : base(null, null, NodeType.Connector) { }
#pragma warning restore CS8625 
#pragma warning restore CS8618 

  public ConnectorData Data { get; set; }

  public Connector(string id, Position position, ConnectorData connectorData)
      : base(id, position, NodeType.Connector)
  {
    Data = connectorData;
  }
}

namespace server.Models;

public class BlockDto
{
    public required string Id { get; set; }
    public required Position Position { get; set; }
    public NodeType Type { get; set; }
    public required BlockData Data { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
}

public class BlockData : NodeData
{
    public string Parent { get; set; } = "void";
    public List<Relation> Children { get; set; } = [];
    public List<Relation> Terminals { get; set; } = [];
    public List<Relation> FulfilledBy { get; set; } = [];
    public List<Relation> Fulfills { get; set; } = [];
    public List<Relation> DirectParts { get; set; } = [];
    public List<Relation> ConnectedTo { get; set; } = [];
    public List<Relation> ConnectedBy { get; set; } = [];
    public string DirectPartOf { get; set; } = string.Empty;
}

public class Block : Node
{
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
#pragma warning disable CS8625 // Cannot convert null literal to non-nullable reference type.
    private Block() : base(null, null, NodeType.Block) { }
#pragma warning restore CS8625 // Cannot convert null literal to non-nullable reference type.
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.

    public BlockData Data { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }

    public Block(string id, Position position, BlockData blockData)
        : base(id, position, NodeType.Block)
    {
        Data = blockData;
        if (Width == null) Width = 110;
        if (Height == null) Height = 66;
    }

}

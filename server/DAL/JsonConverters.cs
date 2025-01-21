using System.Text.Json;
using System.Text.Json.Serialization;
using server.Models;

namespace server.DAL;

public class AspectTypeConverter : JsonConverter<AspectType>
{
  public override AspectType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
  {
    var value = reader.GetString() ?? throw new JsonException("Null, is not a valid AspectType.");
    return value.ToLower() switch
    {
      "function" => AspectType.Function,
      "product" => AspectType.Product,
      "location" => AspectType.Location,
      "installed" => AspectType.Installed,
      "empty" => AspectType.Empty,
      _ => throw new JsonException($"Value '{value}' is not recognized as a valid AspectType.")
    };
  }

  public override void Write(Utf8JsonWriter writer, AspectType value, JsonSerializerOptions options)
  {
    var stringValue = value switch
    {
      AspectType.Function => "function",
      AspectType.Product => "product",
      AspectType.Location => "location",
      AspectType.Installed => "installed",
      AspectType.Empty => "empty",
      _ => throw new JsonException($"'{value}' is not a valid AspectType value.")
    };
    writer.WriteStringValue(stringValue);
  }
}

public class EdgeTypeConverter : JsonConverter<EdgeType>
{
  public override EdgeType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
  {
    var value = reader.GetString() ?? throw new JsonException("Null, is not a valid EdgeType.");
    return value.ToLower() switch
    {
      "connected" => EdgeType.Connected,
      "fulfilled" => EdgeType.Fulfilled,
      "part" => EdgeType.Part,
      "transfer" => EdgeType.Transfer,
      _ => throw new JsonException($"Value '{value}' is not recognized as a valid EdgeType.")
    };
  }

  public override void Write(Utf8JsonWriter writer, EdgeType value, JsonSerializerOptions options)
  {
    var stringValue = value switch
    {
      EdgeType.Connected => "connected",
      EdgeType.Fulfilled => "fulfilled",
      EdgeType.Part => "part",
      EdgeType.Transfer => "transfer",
      _ => throw new JsonException($"'{value}' is not a valid EdgeType value.")
    };
    writer.WriteStringValue(stringValue);
  }
}

public class NodeTypeConverter : JsonConverter<NodeType>
{
  public override NodeType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
  {
    var value = reader.GetString() ?? throw new JsonException("Null, is not a valid NodeType.");
    return value.ToLower() switch
    {
      "block" => NodeType.Block,
      "terminal" => NodeType.Terminal,
      "connector" => NodeType.Connector,
      _ => throw new JsonException($"Value '{value}' is not recognized as a valid NodeType.")
    };
  }

  public override void Write(Utf8JsonWriter writer, NodeType value, JsonSerializerOptions options)
  {
    var stringValue = value switch
    {
      NodeType.Block => "block",
      NodeType.Terminal => "terminal",
      NodeType.Connector => "connector",
      _ => throw new JsonException($"'{value}' is not a valid NodeType value.")
    };
    writer.WriteStringValue(stringValue);
  }
}

public class UserRoleConverter : JsonConverter<UserRole>
{
  public override UserRole Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
  {
    var value = reader.GetString() ?? throw new JsonException("Null, is not a valid UserRole.");
    return value.ToLower() switch
    {
      "user" => UserRole.User,
      "admin" => UserRole.Admin,
      _ => throw new JsonException($"Value '{value}' is not recognized as a valid UserRole.")
    };
  }

  public override void Write(Utf8JsonWriter writer, UserRole value, JsonSerializerOptions options)
  {
    var stringValue = value switch
    {
      UserRole.Admin => "admin",
      UserRole.User => "user",
      _ => throw new JsonException($"'{value}' is not a valid UserRole value.")
    };
    writer.WriteStringValue(stringValue);
  }
}
using System.Text.Json;
using server.Models;

namespace server.DAL;

public class Utils
{
  public static Node CreateNode(string type, string id, Position position, string aspect, string label, string createdBy)
  {
    AspectType parsedAspect = (AspectType)Enum.Parse(typeof(AspectType), aspect, ignoreCase: true);
    NodeData data = new() { Label = label, Aspect = parsedAspect };

    return type.ToLower() switch
    {
      "block" => new Block(id, position, new BlockData() { Label = data.Label, Aspect = data.Aspect, CreatedBy = createdBy }),
      "connector" => new Connector(id, position, new ConnectorData() { Label = data.Label, Aspect = data.Aspect, CreatedBy = createdBy }),
      "terminal" => new Terminal(id, position, new TerminalData() { Label = data.Label, Aspect = data.Aspect, CreatedBy = createdBy }),
      _ => throw new ArgumentException($"Unsupported node type: {type}"),
    };
  }

  public static Node CreateNode(string type, string id, Position position, string aspect, string label, string createdBy, string customName, string childrenString, string directPartsString, string directPartOf, string terminalsString, string terminalOf, string transfersTo, string transferedBy, string fulfillsString, string fulfilledByString, string connectedToString, string connectedByString, string customAttributesString)
  {
    AspectType parsedAspect = (AspectType)Enum.Parse(typeof(AspectType), aspect, ignoreCase: true);
    NodeData data = new() { Label = label, Aspect = parsedAspect, CustomName = customName };

    List<Relation> children = [];

    if (childrenString != "[]" && childrenString != "")
    {

      var options = new JsonSerializerOptions
      {
        PropertyNameCaseInsensitive = true
      };

      var relations = JsonSerializer.Deserialize<List<Relation>>(childrenString, options);

      if (relations != null)
      {
        foreach (var relation in relations)
        {
          children.Add(relation);
        }
      }
    }

    List<Relation> directParts = [];

    if (directPartsString != "[]" && directPartsString != "")
    {

      var options = new JsonSerializerOptions
      {
        PropertyNameCaseInsensitive = true
      };

      var relations = JsonSerializer.Deserialize<List<Relation>>(directPartsString, options);

      if (relations != null)
      {
        foreach (var relation in relations)
        {
          directParts.Add(relation);
        }
      }
    }

    List<Relation> terminals = [];

    if (terminalsString != "[]" && terminalsString != "")
    {

      var options = new JsonSerializerOptions
      {
        PropertyNameCaseInsensitive = true
      };

      var relations = JsonSerializer.Deserialize<List<Relation>>(terminalsString, options);

      if (relations != null)
      {
        foreach (var relation in relations)
        {
          terminals.Add(relation);
        }
      }
    }

    List<Relation> fulfills = [];

    if (fulfillsString != "[]" && fulfillsString != "")
    {

      var options = new JsonSerializerOptions
      {
        PropertyNameCaseInsensitive = true
      };

      var relations = JsonSerializer.Deserialize<List<Relation>>(fulfillsString, options);

      if (relations != null)
      {
        foreach (var relation in relations)
        {
          fulfills.Add(relation);
        }
      }
    }

    List<Relation> fulfilledBy = [];

    if (fulfilledByString != "[]" && fulfilledByString != "")
    {

      var options = new JsonSerializerOptions
      {
        PropertyNameCaseInsensitive = true
      };

      var relations = JsonSerializer.Deserialize<List<Relation>>(fulfilledByString, options);

      if (relations != null)
      {
        foreach (var relation in relations)
        {
          fulfilledBy.Add(relation);
        }
      }
    }

    List<Relation> connectedTo = [];

    if (connectedToString != "[]" && connectedToString != "")
    {

      var options = new JsonSerializerOptions
      {
        PropertyNameCaseInsensitive = true
      };

      var relations = JsonSerializer.Deserialize<List<Relation>>(connectedToString, options);

      if (relations != null)
      {
        foreach (var relation in relations)
        {
          connectedTo.Add(relation);
        }
      }
    }

    List<Relation> connectedBy = [];

    if (connectedByString != "[]" && connectedByString != "")
    {

      var options = new JsonSerializerOptions
      {
        PropertyNameCaseInsensitive = true
      };

      var relations = JsonSerializer.Deserialize<List<Relation>>(connectedByString, options);

      if (relations != null)
      {
        foreach (var relation in relations)
        {
          connectedBy.Add(relation);
        }
      }
    }

    List<CustomAttribute> customAttributes = [];

    if (customAttributesString != "[]" && customAttributesString != "")
    {

      var options = new JsonSerializerOptions
      {
        PropertyNameCaseInsensitive = true
      };

      var attributes = JsonSerializer.Deserialize<List<CustomAttribute>>(customAttributesString, options);

      if (attributes != null)
      {
        foreach (var attribute in attributes)
        {
          var name = attribute.Name;
          var value = attribute.Value;
          var unitOfMeasure = attribute.UnitOfMeasure;
          var quantityDatums = attribute.QuantityDatums;

          customAttributes.Add(new CustomAttribute() { Name = name, Value = value , UnitOfMeasure = unitOfMeasure, QuantityDatums = quantityDatums});
        }
      }
    }

    return type.ToLower() switch
    {
      "block" => new Block(id, position, new BlockData() { Label = data.Label, Aspect = data.Aspect, CreatedBy = createdBy, CustomName = data.CustomName, Children = children, DirectParts = directParts, DirectPartOf = directPartOf.Replace("\"", ""), Terminals = terminals, FulfilledBy = fulfilledBy, Fulfills = fulfills, ConnectedTo = connectedTo, ConnectedBy = connectedBy, CustomAttributes = customAttributes }),
      "connector" => new Connector(id, position, new ConnectorData() { Label = data.Label, Aspect = data.Aspect, CreatedBy = createdBy, CustomName = data.CustomName, DirectParts = directParts, DirectPartOf = directPartOf.Replace("\"", ""), ConnectedTo = connectedTo, ConnectedBy = connectedBy, CustomAttributes = customAttributes }),
      "terminal" => new Terminal(id, position, new TerminalData() { Label = data.Label, Aspect = data.Aspect, CreatedBy = createdBy, CustomName = data.CustomName, TerminalOf = terminalOf.Replace("\"", ""), TransfersTo = transfersTo.Replace("\"", ""), TransferedBy = transferedBy.Replace("\"", ""), ConnectedTo = connectedTo, ConnectedBy = connectedBy, CustomAttributes = customAttributes }),
      _ => throw new ArgumentException($"Unsupported node type: {type}"),
    };
  }

}
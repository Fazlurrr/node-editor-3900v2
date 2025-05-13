import { useState } from "react";


// your definitions
const DEFINITIONS: Record<string,string> = {
  Elements: "Elements represent the building-blocks of the model…",
  Relations: "Relations define how elements connect or relate…",
  Aspects: "Aspects capture different perspectives on an element…",
  Attributes: "Attributes are properties of elements: name, value, unit…",
  "Attribute Qualifier": "Attribute Qualifier provide context for numeric values…",
  Block: "A block represents a physical or conceptual component in the model.",
  Terminal: "A terminal is a point at which elements can be connected.",
  Connector: "Connectors establish links between elements to show interaction or flow.",
  "Connected to": "ConnectedTo is a topological associative relation between elements.",
  "Transferred to": "TransfersTo expresses that one element transfers to another.",
  "Part of": "PartOf defines a part-whole hierarchy between elements.",
  Specialization: "SpecializationOf expresses subtype hierarchy between elements.",
  Fulfills: "Fulfills shows that one element satisfies the requirements of another.",
  Proxy: "Proxy relates two aspect-elements from the same no-aspect element.",
  Projection: "Projection relates no-aspect element to its aspect representation.",
  "Same as": "SameAs denotes identity equivalence between two entities.",
  Function: "The Function aspect specifies what activities the system realizes.",
  Product: "The Product aspect shows the intended deliverables of the system.",
  Location: "The Location aspect captures spatial properties of elements.",
  Installed: "The Installed aspect gives real-world status of elements.",
  "No Aspect": "Used when an element isn’t carrying any specific aspect.",
  "Unspecified Aspect": "When aspects exist but aren’t yet assigned.",
  Name: "The attribute’s unique identifier.",
  Value: "The attribute’s data—can be numeric or string.",
  "Unit of measure": "The unit qualifying the value (e.g., kg, m, °C).",
  Provenance: "Where or how the measurement/data point originated.",
  Scope: "The conditions or context under which data applies.",
  Range: "Difference between upper and lower limits of a value.",
  Regularity: "The consistency or pattern of a value over time.",
};

// map only those pages you have images for:
const IMAGES: Record<string, string> = {
    Elements: "/guru-images/Elements.png",
    Aspects: "/guru-images/Aspects.png",
    Attributes: "/guru-images/Attributes.png",
    Relations: "/guru-images/Relations.png",
    "Attribute Qualifier": "/guru-images/Quantity_datums.png",
    Block: "/guru-images/Block.png",
    "Connected to": "/guru-images/Connected_to.png",
    Connector: "/guru-images/Connector.png",
    Fulfills: "/guru-images/Fulfills.png",
    Function: "/guru-images/Function.png",
    Installed: "/guru-images/Installed.png",
    Location: "/guru-images/Location.png",
    "No Aspect": "/guru-images/No_Aspect.png",
    "Part of": "/guru-images/Part_of.png",
    Product: "/guru-images/Product.png",
    Projection: "/guru-images/Projection.png",
    Proxy: "/guru-images/Proxy.png",
    "Same as": "/guru-images/Same_as.png",
    Specialization: "/guru-images/Specialization.png",
    Terminal: "/guru-images/Terminal.png",
    "Transferred to": "/guru-images/Transferred_to.png",
    "Unspecified Aspect": "/guru-images/Unspecified_Aspect.png",
  };

const Guru: React.FC = () => {
  const [selected, setSelected] = useState<string>("Elements");

  const sidebar: { label: string; children: (string | { label:string; children:string[] })[] }[] = [
    {
      label: "Elements",
      children: ["Block", "Terminal", "Connector"],
    },
    {
      label: "Relations",
      children: [
        "Connected to",
        "Transferred to",
        "Part of",
        "Specialization",
        "Fulfills",
        "Proxy",
        "Projection",
        "Same as",
      ],
    },
    {
      label: "Aspects",
      children: [
        "Function",
        "Product",
        "Location",
        "Installed",
        "No Aspect",
        "Unspecified Aspect",
      ],
    },
    {
      label: "Attributes",
      children: [
        "Name",
        "Value",
        "Unit of measure",
        {
          label: "Attribute Qualifier",
          children: ["Provenance", "Scope", "Range", "Regularity"],
        },
      ],
    },
  ];

  return (
    <div className="flex h-full" style={{ minHeight: 400, maxHeight: "80vh" }}>
      {/* Sidebar */}
      <div
        className="w-1/4 p-4 overflow-y-auto"
        style={{ maxHeight: "80vh" }}
      >
        {sidebar.map((sec) => (
          <div key={sec.label} className="mb-4">
            <div
              className="cursor-pointer py-1"
              style={{ fontWeight: selected === sec.label ? "bold" : "normal" }}
              onClick={() => setSelected(sec.label)}
            >
              {sec.label}
            </div>
            <div className="ml-4">
              {sec.children.map((child) =>
                typeof child === "string" ? (
                  <div
                    key={child}
                    className="cursor-pointer py-1"
                    style={{
                      fontWeight: selected === child ? "bold" : "normal",
                    }}
                    onClick={() => setSelected(child)}
                  >
                    {child}
                  </div>
                ) : (
                  <div key={child.label}>
                    <div
                      className="cursor-pointer py-1"
                      style={{
                        fontWeight:
                          selected === child.label ? "bold" : "normal",
                      }}
                      onClick={() => setSelected(child.label)}
                    >
                      {child.label}
                    </div>
                    <div className="ml-4">
                      {child.children.map((sub) => (
                        <div
                          key={sub}
                          className="cursor-pointer py-1"
                          style={{
                            fontWeight:
                              selected === sub ? "bold" : "normal",
                          }}
                          onClick={() => setSelected(sub)}
                        >
                          {sub}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div
        className="flex-1 p-4 overflow-auto"
        style={{ maxHeight: "80vh" }}
      >
        <h2 className="text-xl font-semibold mb-2">{selected}</h2>
        <p className="mb-4">{DEFINITIONS[selected]}</p>

        {/* only show if you have an image for this page */}
        {IMAGES[selected] && (
          <div className="mb-6">
            <img
              src={IMAGES[selected]}
              alt={selected}
              className="w-full max-w-sm mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Guru;

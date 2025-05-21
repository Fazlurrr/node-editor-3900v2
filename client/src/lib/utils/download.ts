import { useStore } from '@/hooks';
import { type Node } from 'reactflow';
import { RelationKeys } from '@/lib/types';
import { capitalizeFirstLetter } from '@/lib/utils';

export const downloadFile = async (fileType: string, fileName: string) => {
  const { nodes, edges } = useStore.getState();

  let data: string | Blob;

  if (fileType === 'imf') {
    const imfData = JSON.stringify({ nodes, edges }, null, 2);
    data = new Blob([imfData], { type: 'application/json' });
  } else if (fileType === 'rdf') {
    const rdfData = mapNodeRelationsToString(nodes);
    data = new Blob([rdfData], { type: 'text/plain' });
  } else {
    throw new Error('Unsupported file type');
  }

  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName || 'Untitled'}.${fileType}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};


export const mapNodeRelationsToString = (nodes: Node[]): string => {
  const transformableKeys: RelationKeys[] = [
    'connectedTo',
    'connectedBy',
    'directParts',
    'fulfilledBy',
    'terminals',
    'terminalOf',
    'directPartOf',
    'transfersTo',
    'transferedBy',
    'fulfills',
  ];

  const relations = new Map<string, string[]>();

  for (const node of nodes) {
    const nodeLabel = node.data.customName
      ? node.data.customName.replace(/ /g, '_')
      : node.data.label;

    relations.set(nodeLabel, []);

    for (const key of transformableKeys) {
      if (!node.data || !node.data[key] || node.data[key].length === 0)
        continue;

      if (typeof node.data[key] === 'string') {
        const id = node.data[key];
        const currentElement = nodes.find(node => node.id === id);

        const currentLabel = currentElement?.data.customName
          ? currentElement.data.customName.replace(/ /g, '_')
          : currentElement?.data.label;

        if (currentElement) {
          relations
            .get(nodeLabel)
            ?.push(`${getReadableKey(key)} ${currentLabel}`);
        }
        continue;
      }

      for (const item of node.data[key]) {
        const currentElement = nodes.find(node => node.id === item.id);

        const currentLabel = currentElement?.data.customName
          ? currentElement.data.customName.replace(/ /g, '_')
          : currentElement?.data.label;
        if (currentElement) {
          relations
            .get(nodeLabel)
            ?.push(`${getReadableKey(key)} ${currentLabel}`);
        }
      }
    }
  }

  let str =
    '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n@prefix imf: <http://ns.imfid.org/imf#> .\n@prefix owl: <http://www.w3.org/2002/07/owl#> .\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n@prefix skos: <http://www.w3.org/2004/02/skos/core#> .\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n@prefix imfgui: http://example.org/imfgui# .\n\n';

  for (const node of nodes) {
    str += `imgui:${node.data.customName ? node.data.customName.replace(/ /g, '_') : node.data.label} rdf:type imf:${capitalizeFirstLetter(node.type!)};\n`;
    str += `    imf:hasAspect imf:${node.data.aspect};\n`;
    str += `    skos:preLabel "${node.data.customName === '' ? node.data.label : node.data.customName.replace(/ /g, '_')}".\n\n`;
  }

  for (const relation of relations) {
    const [key, value] = relation;
    for (const v of value) {
      const parts = v.split(' ');
      str += `imgui:${key} imf:${parts[0]} imgui:${parts[1]}.\n`;
    }
    str += '\n';
  }
  str += '\n';

  for (const node of nodes) {
    for (let i = 0; i < node.data.customAttributes.length; i++) {
      const nodeLabel = node.data.customName
        ? node.data.customName.replace(/ /g, '_')
        : node.data.label;

      const attributeName = `${nodeLabel}-attribute${i}`;
      str += `imfgui:${nodeLabel} imf:hasAttribute imfgui:${attributeName}.\n`;
      str += `imfgui:${attributeName} rdfs:label "${node.data.customAttributes[i].name}".\n`;
      str += `imfgui:${attributeName} imf:value "${node.data.customAttributes[i].value}".\n`;
    }
  }

  return str;
};

export const getReadableKey = (key: RelationKeys): string => {
  switch (key) {
    case 'connectedTo':
      return 'connectedTo';
    case 'connectedBy':
      return 'connectedBy';
    case 'directParts':
      return 'hasPart';
    case 'fulfilledBy':
      return 'fulfilledBy';
    case 'terminals':
      return 'hasTerminal';
    case 'terminalOf':
      return 'terminalOf';
    case 'directPartOf':
      return 'partOf';
    case 'transfersTo':
      return 'transfersTo';
    case 'transferedBy':
      return 'transferedBy';
    case 'fulfills':
      return 'fulfills';
    default:
      return '';
  }
};

import { type Node } from 'reactflow';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';
import { RelationType } from '../types';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const isBlock = (id: string): boolean => id.includes('block');

export const isConnector = (id: string): boolean => id.includes('connector');

export const isTerminal = (id: string): boolean => id.includes('terminal');

export const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const getReadableRelation = (type: RelationType): string | null => {
  switch (type) {
    case RelationType.DirectParts:
      return 'Parts';
    case RelationType.ConnectedTo:
      return 'Connected to';
    case RelationType.ConnectedBy:
      return 'Connected by';
    case RelationType.FulfilledBy:
      return 'Fulfilled by';
    case RelationType.Terminals:
      return 'Terminals';
    case RelationType.TerminalOf:
      return 'Terminal of';
    case RelationType.DirectPartOf:
      return 'Part of';
    case RelationType.TransfersTo:
      return 'Transfers to';
    case RelationType.TransferedBy:
      return 'Transfered by';
    case RelationType.Fulfills:
      return 'Fulfills';
    default:
      return null;
  }
};

export const getNodeRelationLabel = (node: Node): string =>
  `${node.data.customName === '' ? `${capitalizeFirstLetter(node.type!)}_${node.id} (type: ${node.type}, aspect: ${node.data.aspect})` : node.data.customName.replace(' ', '_')}`;

export const generateNewNodeId = (currentId: string): string => {
  if (isBlock(currentId)) {
    return `block-${uuidv4()}`;
  }
  if (isConnector(currentId)) {
    return `connector-${uuidv4()}`;
  }
  return `terminal-${uuidv4()}`;
};
import type { Edge, EdgeProps, NodeProps } from 'reactflow';

export enum AppPage {
  Editor = 'editor',
  Login = 'login',
  Dashboard = 'dashboard',
}

export enum AspectType {
  Function = 'function',
  Product = 'product',
  Location = 'location',
  Installed = 'installed',
  NoAspect = 'noaspect',
  UnspecifiedAspect = 'unspecifiedaspect',
}

export enum NodeType {
  Block = 'block',
  Connector = 'connector',
  Terminal = 'terminal',
}

export enum EdgeType {
  Connected = 'connected',
  Fulfilled = 'fulfilled',
  Part = 'part',
  Transfer = 'transfer',
  Specialization = 'specialization',
  Proxy = 'proxy',
  Projection = 'projection',
  Equality = 'equality',
}

export enum Provenance {
  Specified = 'specified',
  Calculated = 'calculated',
  Measured = 'measured',
}

export enum Scope {
  Design = 'design',
  Operating = 'operating'
}

export enum Range {
  Nominal = 'nominal',
  Normal = 'normal',
  Average = 'average',
  Minimum = 'minimum',
  Maximum = 'maximum',
}

export enum Regularity {
  Continuous = 'continuous',
  Absolute = 'absolute'
}

export enum RelationType {
  ConnectedTo = 'connectedTo',
  ConnectedBy = 'connectedBy',
  DirectParts = 'directParts',
  FulfilledBy = 'fulfilledBy',
  Terminals = 'terminals',
  TerminalOf = 'terminalOf',
  DirectPartOf = 'directPartOf',
  TransfersTo = 'transfersTo',
  TransferedBy = 'transferedBy',
  Fulfills = 'fulfills',
  Specialization = 'specialization',
  SpecializationOf = 'specializationOf',
  Proxy = 'proxy',
  ProxyOf = 'proxyOf',
  Projection = 'projection',
  ProjectionOf = 'projectionOf',
  Equality = 'equality',
  EqualityOf = 'equalityOf',
}

export type Role = 'admin' | 'user';

export type UpdateNode = {
  customName?: string;
  aspect?: AspectType;
  customAttributes?: CustomAttribute[];
  label?: string;
  width?: number;
  height?: number;
};

export type Relation = {
  id: string;
};

export type CustomAttribute = {
  name: string;
  value: string;
  unitOfMeasure: string;
  quantityDatums: QuantityDatums;
};

export type NodeData = {
  aspect: AspectType;
  parent: 'void' | string;
  children?: Relation[];
  terminals?: Relation[];
  terminalOf?: string;
  transfersTo?: string;
  transferedBy?: string;
  connectedTo?: Relation[];
  connectedBy?: Relation[];
  directParts?: Relation[];
  customAttributes: CustomAttribute[];
  directPartOf?: string;
  fulfills?: Relation[];
  fulfilledBy?: Relation[];
  label: string;
  createdAt: number;
  updatedAt: number;
  customName?: string;
  createdBy: string;
  width?: number;
  height?: number;
  zIndex?: number;
};

export type QuantityDatums = {
  provenance: Provenance;
  scope: Scope;
  range: Range;
  regularity: Regularity;
}

export type EdgeData = {
  id: string;
  label: string;
  lockConnection: boolean;
  createdAt: number;
  updatedAt: number;
  customName?: string;
  createdBy: string;
};

export type CustomEdgeProps = Omit<EdgeProps, 'data'> &
  EdgeData & {
    data: EdgeData;
    type: string;
  };

export type CustomNodeProps = Omit<NodeProps, 'data'> &
  NodeData & {
    data: NodeData;
    onRightClick?: (info: { x: number; y: number; nodeId: string }) => void;
  };

export type NodeRelation = {
  nodeId: string;
  relation?: {
    [key: string]: string;
  };
  relations?: {
    [key: string]: {
      id: string;
    };
  };
};

export type NavItem = {
  title: string;
  aspect: AspectType;
  subtitle: string;
  children: {
    title: string;
    description: string;
    nodeType: NodeType;
  }[];
};

export type RelationKeys =
  | 'connectedTo'
  | 'directParts'
  | 'fulfilledBy'
  | 'terminals'
  | 'terminalOf'
  | 'directPartOf'
  | 'transfersTo'
  | 'transferedBy'
  | 'fulfills'
  | 'connectedBy'
  | 'specialization'
  | 'specializationOf'
  | 'proxy'
  | 'proxyOf'
  | 'projection'
  | 'projectionOf'
  | 'equality'
  | 'equalityOf';

export type RelationKeysWithChildren = {
  key: RelationKeys;
  children: { id: string }[];
};

export type EdgeWithEdgeId = Edge & {
  edgeId: string;
};

export type User = {
  id: string;
  username: string;
  role: Role;
};

export type UserWithToken = {
  user: User;
  token: string;
};

type CommonData = {
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  customName: string;
  customAttributes: CustomAttribute[];
  aspect: string;
  label: string;
};

type NodePosition = {
  x: number;
  y: number;
};

type BlockData = CommonData & {
  parent: string;
  children: string[];
  terminals: string[];
  fulfilledBy: string[];
  fulfills: string[];
  directParts: string[];
  connectedTo: string[];
  connectedBy: string[];
  directPartOf: string;
};

type Block = {
  data: BlockData;
  nodeId: string;
  id: string;
  position: NodePosition;
  type: 'block';
  width: number;
  height: number;
};

type ConnectorData = CommonData & {
  connectedTo: string[];
  connectedBy: string[];
};

type Connector = {
  data: ConnectorData;
  nodeId: string;
  id: string;
  position: NodePosition;
  type: 'connector';
  width: number;
  height: number;
};

type TerminalData = CommonData & {
  terminalOf: string;
  connectedTo: string[];
  connectedBy: string[];
  transfersTo: string;
  transferedBy: string;
};

type Terminal = {
  data: TerminalData;
  nodeId: string;
  id: string;
  position: NodePosition;
  type: 'terminal';
  width: number;
  height: number;
};

export type ValidUploadNode = Block | Terminal | Connector;

export type ValidUploadEdge = {
  edgeId: string;
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  type: EdgeType;
  data: EdgeData;
};

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface Documentation {
  summary?: string;
  description?: string;
  source?: { file: string; line: number; kind: 'property' | 'type' };
}

export interface TypeProperty {
  key: string;
  typeId: string;
  optional: boolean;
  documentation?: Documentation;
}

export interface TypeDefinition {
  id: string;
  kind:
    | 'object'
    | 'union'
    | 'intersection'
    | 'array'
    | 'tuple'
    | 'literal'
    | 'primitive'
    | 'unsupported';
  label: string;
  documentation?: Documentation;
  properties?: TypeProperty[];
  alternatives?: string[];
  elementTypeId?: string;
  tupleItems?: { typeId: string; optional: boolean }[];
  indexSignatures?: { keyType: string; typeId: string; keyPattern?: string }[];
  literal?: string | number | boolean | null;
}

export interface InspectionModel {
  root: { name: string; typeId: string; documentation?: Documentation };
  definitions: Record<string, TypeDefinition>;
  source: { file: string; exportName: string; path: string[] };
  diagnostics: { message: string; typeId?: string }[];
}

export interface InspectionDataset {
  model: InspectionModel;
  reference?: JsonValue;
  secondaryLabelField?: string;
}

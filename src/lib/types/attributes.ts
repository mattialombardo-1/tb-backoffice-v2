export type AttributeResourceName =
  | 'collections'
  | 'questions'
  | 'subjects'
  | 'users'
  | 'brands';

export type AttributeType =
  | 'boolean'
  | 'string'
  | 'number'
  | 'select'
  | 'multiSelect'
  | 'date';

export interface AttributeItem {
  name: string;
  type?: AttributeType;
  values?: string[];
}

export interface Attribute {
  _id: string;
  name: AttributeResourceName;
  attributes: AttributeItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttributesPayload {
  resource: {
    name: AttributeResourceName;
    attributes: AttributeItem[];
  };
}

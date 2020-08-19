import { JSONSchema } from 'json-schema-typed';

export interface UserPreferences {
  windowBounds: { width: number; height: number; x: number; y: number };
  respectPinned: boolean;
  humanizePackageNames: boolean;
  updatePackagesOnStart: boolean;
  windowMaximized?: boolean;
  darkMode?: boolean;
  ror2_path?: string;
  appUpdateCheckInterval: number;
  displayedColumns: string[];
}

interface SchemaItem {
  [key: string]: JSONSchema;
}
interface Schema {
  [key: string]: JSONSchema & SchemaItem;
}

export const preferencesSchema = <Schema>{
  windowBounds: {
    type: 'object',
    properties: {
      width: {
        type: 'number',
        minimum: 0,
        default: 800,
      },
      height: {
        type: 'number',
        minimum: 0,
        default: 600,
      },
      x: {
        type: 'number',
        minimum: 0,
        default: 0,
      },
      y: {
        type: 'number',
        minimum: 0,
        default: 0,
      },
    },
  },
  respectPinned: {
    type: 'boolean',
    default: true,
  },
  humanizePackageNames: {
    type: 'boolean',
    default: true,
  },
  updatePackagesOnStart: {
    type: 'boolean',
    default: true,
  },
  windowMaximized: {
    type: 'boolean',
  },
  darkMode: {
    type: 'boolean',
  },
  ror2_path: {
    type: 'string',
    default: '',
  },
  appUpdateCheckInterval: {
    type: 'number',
    minimum: 0,
    default: 300,
  },
  displayedColumns: {
    type: 'array',
    default: [],
  },
};

export const defaultConfig: UserPreferences = {
  windowBounds: { width: 800, height: 600, x: 0, y: 0 },
  respectPinned: true,
  humanizePackageNames: true,
  updatePackagesOnStart: true,
  appUpdateCheckInterval: 300,
  displayedColumns: [],
};

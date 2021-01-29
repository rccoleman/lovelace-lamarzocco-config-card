import { LovelaceCardConfig } from 'custom-card-helpers';
export interface ValueRangeCardConfig extends LovelaceCardConfig {
  entity: string;
  name: string;
  layout: ValueRangeLayoutConfig;
  hide: ValueRangeHideConfig;
}
export interface ValueRangeLayoutConfig {
  name: Layout.Name;
  embedded: boolean;
}

export interface ValueDataType {
  label: string;
  attrStart: string;
  attrEnd: string | undefined;
  attrEnabled: string | undefined;
}
export namespace Layout {
  export enum Name {
    HEADER = 'header',
    INSIDE = 'inside',
  }
}

export interface ValueRangeHideConfig {
  name: boolean;
}

export enum Direction {
  UP = 'up',
  DOWN = 'down',
}

export enum ValueType {
  START = 'start',
  END = 'end',
}

export enum CardSettingsType {
  AUTO_ON_OFF = 'auto',
  PREBREW = 'prebrew',
  DOSE = 'dose',
}

export enum Models {
  // Models
  GS3_AV = 'GS3 AV',
  GS3_MP = 'GS3 MP',
  LM = 'Linea Mini',
}

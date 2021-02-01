import { LovelaceCardConfig } from 'custom-card-helpers';
export interface LaMarzoccoConfigCardConfig extends LovelaceCardConfig {
  name: string;
  card_type: string;
  hide: LaMarzoccoConfigHideConfig;
}

export interface ValueDataType {
  label: string;
  attrStart: string;
  attrEnd: string | undefined;
  attrEnabled: string | undefined;
}

export interface LaMarzoccoConfigHideConfig {
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

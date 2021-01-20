import { LovelaceCardConfig } from 'custom-card-helpers';

export interface ValueRangeCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  layout?: ValueRangeLayoutConfig;
  hide?: ValueRangeHideConfig;
}
export interface ValueRangeLayoutConfig {
  align_controls?: Layout.AlignControls;
  name?: Layout.Name;
  embedded?: boolean;
}

export namespace Layout {
  export type HourMode = 'single' | 'double';

  export enum AlignControls {
    LEFT = 'left',
    CENTER = 'center',
    RIGHT = 'right',
  }

  export enum Name {
    HEADER = 'header',
    INSIDE = 'inside',
  }
}

export interface ValueRangeHideConfig {
  name?: boolean;
}

export enum Direction {
  UP = 'up',
  DOWN = 'down',
}

export enum ValueType {
  START = 'start',
  END = 'end',
}

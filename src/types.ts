import { LovelaceCardConfig } from 'custom-card-helpers';

export interface TimePickerCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  layout?: TimePickerLayoutConfig;
  hide?: TimePickerHideConfig;
}
export interface TimePickerLayoutConfig {
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

export interface TimePickerHideConfig {
  name?: boolean;
}

export enum Direction {
  UP = 'up',
  DOWN = 'down',
}

export enum Period {
  AM = 'AM',
  PM = 'PM',
}

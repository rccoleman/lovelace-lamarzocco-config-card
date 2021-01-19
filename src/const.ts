import * as pkg from '../package.json';
import { Layout } from './types';

export const CARD_VERSION = pkg.version;
export const CARD_SIZE = 3;

export const ENTITY_DOMAIN = 'switch';
export const SERVICE_DOMAIN = 'lamarzocco';

// Config defaults
export const DEFAULT_HOUR_STEP = 1;
export const DEFAULT_LAYOUT_ALIGN_CONTROLS = Layout.AlignControls.CENTER;
export const DEFAULT_LAYOUT_NAME = Layout.Name.HEADER;

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

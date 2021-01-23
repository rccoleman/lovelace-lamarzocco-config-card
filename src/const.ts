import * as pkg from '../package.json';
import { Layout, CardType } from './types';

export const ENTITY_DOMAIN = 'switch';
export const SERVICE_DOMAIN = 'lamarzocco';

export const CARD_VERSION = pkg.version;
export const CARD_SIZE = 3;

// Config defaults
export const DEFAULT_LAYOUT_ALIGN_CONTROLS = Layout.AlignControls.CENTER;
export const DEFAULT_LAYOUT_NAME = Layout.Name.HEADER;
export const DEFAULT_CARD_TYPE = CardType.AUTO_ON_OFF;

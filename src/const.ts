import * as pkg from '../package.json';
import { Layout } from './types';

export const CARD_VERSION = pkg.version;
export const CARD_SIZE = 3;

// Config defaults
export const DEFAULT_LAYOUT_ALIGN_CONTROLS = Layout.AlignControls.CENTER;
export const DEFAULT_LAYOUT_NAME = Layout.Name.HEADER;

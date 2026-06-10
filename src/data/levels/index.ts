import type { Level } from '@/types';
import { foundationalLevels } from './foundational';
import { intermediateLevels } from './intermediate';
import { advancedLevels } from './advanced';
import { expertLevels } from './expert';

export const levels: Level[] = [
  ...foundationalLevels,
  ...intermediateLevels,
  ...advancedLevels,
  ...expertLevels,
];

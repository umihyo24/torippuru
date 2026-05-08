import { TRAITS } from './traits.js';

export const ABILITIES = Object.fromEntries(
  Object.entries(TRAITS).map(([key, value]) => [
    key,
    {
      ...value,
      triggerType: value?.triggerType === 'onEnter' ? 'onEnter' : 'passive'
    }
  ])
);

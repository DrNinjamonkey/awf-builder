// Svelte
import { writable, derived } from 'svelte/store';

// Types
import type { Logic } from '../types';

// Helpers
import { cloneDeep } from 'lodash-es';

const defaults: Logic[] = [
  {
    id: 'f0df0eeb-e65a-45c4-8d08-fdebcf6ad2d1',
    conditions: [
      {
        selector: 'options',
        type: 'text',
        operator: 'not-equal',
        value: 'Contact Info',
      },
      {
        selector: 'demo',
        type: 'radios',
        operator: 'greater-equal',
        value: '10',
      },
    ],
    operator: 'or',
    actions: [
      {
        selector: 'contact-info',
        action: 'hide',
        clear: false,
      },
      {
        selector: 'test',
        action: 'disable',
        clear: true,
      },
    ],
  },
];

const logicStore = writable(defaults);

const customLogicStore = {
  subscribe: logicStore.subscribe,
  add: (newLogic: Logic) => {
    logicStore.update((items) => [...items, newLogic]);
  },
  modify: (data: Logic) => {
    logicStore.update((items) =>
      items.map((item) => (item.id === data.id ? { ...item, ...data } : item))
    );
  },
  remove: (id: string) => {
    logicStore.update((items) => items.filter((item) => item.id !== id));
  },
};

export default customLogicStore;

export const logicParams = writable({
  submitHiddenInputs: false,
  checkConditionsOnLoad: true,
});

export const logicExport = derived(
  [logicStore, logicParams],
  ([$logicStore, $logicParams]) => {
    const newStore = cloneDeep($logicStore);
    const { submitHiddenInputs, checkConditionsOnLoad } = $logicParams;

    newStore.forEach((logic) => {
      delete logic.id;

      logic.conditions.forEach((condition) => {
        condition.type === 'radios'
          ? (condition.selector = `input[name="${condition.selector}"]:checked`)
          : (condition.selector = `#${condition.selector}`);

        if (condition.operator === 'checked') {
          condition.operator = 'equal';
          condition.value = 'true';
        }

        if (condition.operator === 'not-checked') {
          condition.operator = 'equal';
          condition.value = 'false';
        }

        delete condition.type;
      });

      logic.actions.forEach((action) => {
        action.selector = `#${action.selector}`;
      });
    });

    return {
      logicList: newStore,
      submitHiddenInputs,
      checkConditionsOnLoad,
    };
  }
);

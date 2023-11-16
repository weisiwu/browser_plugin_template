/** @format */

import { createContext } from 'react';
import { defaultText } from './utils';

export const defaultStore = {
  project: {
    name: defaultText,
  },
  userInfo: {
    lastName: '',
    nickNameCn: '',
  },
};

export const StoreContext = createContext(defaultStore);

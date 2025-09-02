import { useContext } from 'react';
import { colorModeContext } from './colorModeContext';

export function useColorMode() {
  return useContext(colorModeContext);
}

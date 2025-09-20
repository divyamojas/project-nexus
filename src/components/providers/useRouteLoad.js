import { useContext } from 'react';
import RouteLoadContext from './RouteLoadContext';

export function useRouteLoad() {
  return useContext(RouteLoadContext);
}

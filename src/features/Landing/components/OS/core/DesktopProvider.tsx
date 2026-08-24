import React, { useReducer } from 'react';
import { desktopReducer, createInitialState, DesktopStateContext, DesktopDispatchContext } from './DesktopReducer';

export const DesktopProvider: React.FC<{
  children: React.ReactNode;
  fullscreen?: boolean;
  standalone?: boolean;
}> = ({ children, fullscreen = false, standalone = false }) => {
  const [state, dispatch] = useReducer(desktopReducer, createInitialState(fullscreen, standalone));

  return (
    <DesktopStateContext.Provider value={state}>
      <DesktopDispatchContext.Provider value={dispatch}>
        {children}
      </DesktopDispatchContext.Provider>
    </DesktopStateContext.Provider>
  );
};

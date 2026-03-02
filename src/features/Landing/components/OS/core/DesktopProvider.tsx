import React, { useReducer } from 'react';
import { desktopReducer, createInitialState, DesktopStateContext, DesktopDispatchContext } from './DesktopReducer';

export const DesktopProvider: React.FC<{ children: React.ReactNode; fullscreen?: boolean }> = ({ children, fullscreen = false }) => {
  const [state, dispatch] = useReducer(desktopReducer, createInitialState(fullscreen));

  return (
    <DesktopStateContext.Provider value={state}>
      <DesktopDispatchContext.Provider value={dispatch}>
        {children}
      </DesktopDispatchContext.Provider>
    </DesktopStateContext.Provider>
  );
};

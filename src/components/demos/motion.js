import { createContext, useContext } from 'react';

// True when the demo is on screen and the visitor hasn't asked for reduced
// motion. Every demo reads this instead of animating unconditionally.
export const MotionContext = createContext(true);

export const useActive = () => useContext(MotionContext);

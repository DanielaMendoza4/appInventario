import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

const TopbarActionContext = createContext(null);

export function TopbarActionProvider({ children }) {
  const [target, setTarget] = useState(null);

  return (
    <TopbarActionContext.Provider value={{ target, setTarget }}>
      {children}
    </TopbarActionContext.Provider>
  );
}

export function TopbarActionSlot() {
  const { setTarget } = useContext(TopbarActionContext);
  return <div className="topbar__action" ref={setTarget} />;
}

export function TopbarAction({ children }) {
  const { target } = useContext(TopbarActionContext);

  if (!target) return null;

  return createPortal(children, target);
}

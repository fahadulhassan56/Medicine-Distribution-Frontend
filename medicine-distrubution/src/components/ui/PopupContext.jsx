import React, { createContext, useContext, useState, useCallback } from 'react';

// Types: 'info' | 'success' | 'error' | 'warning'
const PopupContext = createContext(null);

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState(null);

  const showPopup = useCallback(
    ({ type = 'info', title, message, duration = 3000 }) => {
      setPopup({ type, title, message });

      if (duration) {
        // auto-hide after duration
        setTimeout(() => {
          setPopup(null);
        }, duration);
      }
    },
    []
  );

  const hidePopup = () => setPopup(null);

  return (
    <PopupContext.Provider value={{ showPopup, hidePopup }}>
      {children}

      {/* This renders the popup UI globally */}
      {popup && (
        <div className="popup-root">
          <div className={`popup-card popup-${popup.type}`}>
            {popup.title && <h4 className="popup-title">{popup.title}</h4>}
            {popup.message && <p className="popup-message">{popup.message}</p>}
            <button className="popup-close" onClick={hidePopup}>
              ✕
            </button>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
};

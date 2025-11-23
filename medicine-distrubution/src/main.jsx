import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { store } from './store/store.js';
import { PopupProvider } from './components/ui/PopupContext.jsx';
import './components/ui/Popup.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PopupProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </PopupProvider>
  </React.StrictMode>
);

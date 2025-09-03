import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../../store';
import { ThemeProvider } from './ThemeProvider';

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          {children}
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default Providers;

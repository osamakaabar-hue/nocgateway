import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider';
import { NocBrandingProvider } from './components/NocLogo';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <NocBrandingProvider>
        <App />
      </NocBrandingProvider>
    </ThemeProvider>
  </StrictMode>,
);

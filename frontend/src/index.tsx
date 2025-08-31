import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import App from './App';
import { ColorModeContext, createAppTheme } from './theme';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

function Root() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => {
    const persisted = (typeof window !== 'undefined' && localStorage.getItem('color-mode')) as 'light' | 'dark' | null;
    return persisted ?? (prefersDark ? 'dark' : 'light');
  });

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode(prev => {
          const next = prev === 'light' ? 'dark' : 'light';
          if (typeof window !== 'undefined') localStorage.setItem('color-mode', next);
          return next;
        });
      },
    }),
    []
  );

  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <BrowserRouter>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </BrowserRouter>
  );
}

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

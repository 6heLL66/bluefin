import { ThemeOptions, ThemeProvider, createTheme } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useContext } from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import { GlobalProvider } from './context'
import { OwnThemeProvider, Theme, ThemeContext } from './themeContext'

const darkTheme = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: 'rgb(33, 33, 33)',
      paper: '#212121',
    },
  },
  typography: {
    fontFamily: 'Ubuntu Mono',
    h1: {
      fontFamily: 'Ubuntu Mono',
    },
    h2: {
      fontFamily: 'Ubuntu Mono',
    },
    h3: {
      fontFamily: 'Ubuntu Mono',
    },
    h4: {
      fontFamily: 'Ubuntu Mono',
    },
    h6: {
      fontFamily: 'Ubuntu Mono',
    },
    h5: {
      fontFamily: 'Ubuntu Mono',
    },
    subtitle1: {
      fontFamily: 'Ubuntu Mono',
    },
    subtitle2: {
      fontFamily: 'Ubuntu Mono',
    },
    button: {
      fontFamily: 'Ubuntu Mono',
      fontWeight: 900,
    },
    overline: {
      fontFamily: 'Ubuntu Mono',
    },
  },
} as ThemeOptions

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const AppWithThemeProvider = () => {
  const { theme } = useContext(ThemeContext)
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={createTheme(theme === Theme.Dark ? darkTheme : undefined)}>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GlobalProvider>
    <OwnThemeProvider>
      <AppWithThemeProvider />
    </OwnThemeProvider>
  </GlobalProvider>,
)

import { createMuiTheme } from '@material-ui/core'

export const light = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: 'rgba(0, 0, 0, 0.87)',
    },
    secondary: {
      main: '#f6e05e',
      dark: '#ecc94b',
    },
    background: {
      paper: '#f5f5f5',
      default: '#f5f5f5'
    }
  },
  typography: {
    h5: {
      fontWeight: 800,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        html: {
          WebkitFontSmoothing: 'auto',
          overflowY: 'hidden'
        },
        pre: {
          padding: '1rem',
          background: '#eaeaea',
          borderRadius: '4px',
          border: '1px solid #ccc',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        },
        '.markdown-body blockquote': {
          borderLeft: '0.25em solid #dfe2e5',
          padding: '0 1rem',
          margin: 0
        },
        '.public-DraftStyleDefault-block': {
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'pre-wrap',
        },
        '.emoji-mart-search': {
          marginBottom: '10px',
          '& input': {
            fontSize: '14px'
          }
        }
      },
    },
  },
})
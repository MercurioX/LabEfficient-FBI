import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary:    { main: '#2EA3F2', contrastText: '#fff' },
    secondary:  { main: '#974DF3', contrastText: '#fff' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    text:       { primary: '#333333', secondary: '#666666' },
  },
  typography: {
    fontFamily: '"Open Sans", Arial, sans-serif',
    h4:        { fontWeight: 700 },
    h5:        { fontWeight: 700 },
    h6:        { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button:    { fontWeight: 600 },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F5F7FA' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F5F7FA',
            fontWeight: 600,
            color: '#333333',
            borderBottom: '2px solid #e0e0e0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6 },
      },
    },
  },
})

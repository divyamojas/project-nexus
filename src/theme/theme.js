import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#388e3c', // Leaflet green
    },
    secondary: {
      main: '#81c784',
    },
    background: {
      default: '#f0fdf4',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;

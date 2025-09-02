// src/pages/browseBooks/components/BookCover.jsx
import { Box, CardMedia, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function BookCover({ title, cover_url }) {
  const theme = useTheme();
  const gradients = [
    `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
    `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.primary.main} 100%)`,
    `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.secondary.main} 100%)`,
    `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.primary.main} 100%)`,
    `linear-gradient(135deg, ${theme.palette.grey[200]} 0%, ${theme.palette.grey[300]} 100%)`,
  ];
  const gradientIndex = (title || '').length % gradients.length;

  if (cover_url) {
    return (
      <CardMedia
        component="img"
        height="160"
        image={cover_url}
        alt={`${title} cover`}
        sx={{
          objectFit: 'cover',
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: '4px 4px 0 0',
        }}
      />
    );
  }

  return (
    <Box
      height={160}
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ background: gradients[gradientIndex] }}
    >
      <Typography variant="body2" color="text.secondary">
        No cover image
      </Typography>
    </Box>
  );
}

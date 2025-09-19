// src/features/books/components/BookCover.jsx
import { Box, CardMedia, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
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

  const sheen = keyframes`
    0% { transform: translateX(-120%); }
    100% { transform: translateX(120%); }
  `;

  if (cover_url) {
    return (
      <Box position="relative" height={160}>
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
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(100deg, transparent 10%, rgba(255,255,255,0.25) 25%, transparent 40%)',
            transform: 'translateX(-120%)',
            animation: `${sheen} 2.2s ease-in-out infinite`,
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      height={160}
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ position: 'relative', background: gradients[gradientIndex], overflow: 'hidden' }}
    >
      <Typography variant="body2" color="text.secondary">
        No cover image
      </Typography>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(100deg, transparent 10%, rgba(255,255,255,0.28) 25%, transparent 40%)',
          transform: 'translateX(-120%)',
          animation: `${sheen} 2.2s ease-in-out infinite`,
        }}
      />
    </Box>
  );
}

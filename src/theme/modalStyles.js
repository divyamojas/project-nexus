// src/theme/modalStyles.js
import { alpha } from '@mui/material/styles';

export const modalPaperMotion = {
  initial: { opacity: 0, scale: 0.96, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 16 },
  transition: { type: 'spring', damping: 22, stiffness: 240 },
};

export const getModalPaperSx = (t) => ({
  borderRadius: 16,
  overflow: 'hidden',
  backgroundColor: alpha(t.palette.background.paper, t.palette.mode === 'dark' ? 0.95 : 0.98),
  backdropFilter: 'blur(10px) saturate(120%)',
  boxShadow: 12,
  border: `1px solid ${alpha(t.palette.divider, 0.5)}`,
  willChange: 'transform, opacity',
  // Near-square shape on sm+ screens
  aspectRatio: '4 / 3',
});

export const getModalTitleSx = (t) => ({
  pr: 6,
  py: 1.5,
  fontWeight: 700,
  fontSize: '1.5rem',
  position: 'relative',
  background: `linear-gradient(180deg, ${alpha(
    t.palette.background.paper,
    t.palette.mode === 'dark' ? 0.9 : 0.94,
  )}, ${alpha(t.palette.background.paper, t.palette.mode === 'dark' ? 0.86 : 0.92)})`,
  borderBottom: `1px solid ${alpha(t.palette.divider, 0.6)}`,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
});

export const getModalContentSx = (t) => ({
  p: 0,
  backgroundColor: alpha(t.palette.background.paper, t.palette.mode === 'dark' ? 0.9 : 0.94),
  backdropFilter: 'blur(4px)',
});

export const getModalActionsSx = (t) => ({
  px: 3,
  py: 2,
  justifyContent: 'space-between',
  background: `linear-gradient(0deg, ${alpha(
    t.palette.background.paper,
    t.palette.mode === 'dark' ? 0.9 : 0.94,
  )}, ${alpha(t.palette.background.paper, t.palette.mode === 'dark' ? 0.85 : 0.9)})`,
  backdropFilter: 'blur(6px) saturate(120%)',
  borderTop: `1px solid ${alpha(t.palette.divider, 0.6)}`,
  boxShadow: `0 -6px 14px ${alpha(t.palette.common.black, 0.12)}`,
  borderBottomLeftRadius: 16,
  borderBottomRightRadius: 16,
});

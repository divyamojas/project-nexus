// src/commonComponents/RefreshIconButton.jsx

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { keyframes } from '@mui/system';
import { alpha } from '@mui/material/styles';

export default function RefreshIconButton({
  onClick,
  refreshing = false,
  disabled = false,
  tooltip = 'Refresh',
  size = 'small',
  color = 'primary',
  sx,
  ...props
}) {
  const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `;

  return (
    <Tooltip title={refreshing ? 'Refreshing…' : tooltip}>
      <span>
        <IconButton
          color={color}
          size={size}
          onClick={onClick}
          disabled={disabled || refreshing}
          sx={(t) => ({
            borderRadius: 2,
            boxShadow: 1,
            transition: 'transform 160ms ease, box-shadow 160ms ease, filter 160ms ease',
            background: `linear-gradient(180deg, ${alpha(t.palette.background.paper, 0.8)}, ${alpha(
              t.palette.background.default,
              0.6,
            )})`,
            border: `1px solid ${alpha(t.palette.divider, 0.6)}`,
            '&:hover': { transform: 'scale(1.05)', boxShadow: 2 },
            ...(refreshing && { animation: `${spin} 0.8s linear infinite` }),
            ...sx,
          })}
          aria-label={tooltip}
          {...props}
        >
          <AutorenewIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        </IconButton>
      </span>
    </Tooltip>
  );
}

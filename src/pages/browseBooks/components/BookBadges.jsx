// src/pages/browseBooks/components/BookBadges.jsx
import { Stack, Chip } from '@mui/material';
import { STATUS_COLOR } from '../../../constants/constants';

export default function BookBadges({ condition, status }) {
  return (
    <Stack direction="row" spacing={1} mt={1}>
      <Chip
        label={condition || 'Unknown'}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 500 }}
      />
      <Chip
        label={status || 'unknown'}
        size="small"
        color={STATUS_COLOR[status] || 'default'}
        variant="filled"
        sx={{ fontWeight: 500 }}
      />
    </Stack>
  );
}

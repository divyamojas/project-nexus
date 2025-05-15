// src/components/books/BookCard.jsx

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Box,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Fade,
  Grow,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PropTypes from 'prop-types';

const statusColor = {
  available: 'success',
  scheduled: 'warning',
  lent: 'default',
};

const fallbackGradients = [
  'linear-gradient(135deg, #fdeff9 0%, #ec38bc 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
];

export default function BookCard({
  book,
  onClick,
  onDelete = () => {},
  onArchive = () => {},
  editable = true,
}) {
  const [hovered, setHovered] = useState(false);
  const catalog = book.books_catalog || book.catalog || {};
  const { title, author, cover_image_url } = catalog;
  const condition = book.condition;
  const status = book.status || 'available';
  const archived = book.archived;

  const gradientIndex = (title || author || '').length % fallbackGradients.length;

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(book);
  };

  const handleArchiveToggle = (e) => {
    e.stopPropagation();
    onArchive(book);
  };

  return (
    <Box
      sx={{
        transition: 'transform 0.2s ease',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        zIndex: hovered ? 10 : 1,
      }}
    >
      <Grow in timeout={300}>
        <Card
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            cursor: 'pointer',
            width: 240,
            height: 360,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            transition: 'box-shadow 0.2s ease',
            bgcolor: '#fffefc',
            boxShadow: hovered ? '0 12px 24px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.08)',
          }}
          elevation={0}
        >
          {editable && (
            <Fade in={hovered}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  display: 'flex',
                  gap: 1,
                }}
              >
                <Tooltip title={archived ? 'Unarchive' : 'Archive'}>
                  <IconButton
                    size="small"
                    onClick={handleArchiveToggle}
                    sx={{
                      bgcolor: '#fff',
                      boxShadow: 2,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': { bgcolor: '#f0e6ff', color: '#6a1b9a' },
                    }}
                  >
                    {archived ? (
                      <UnarchiveIcon fontSize="small" />
                    ) : (
                      <ArchiveIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={handleDelete}
                    sx={{
                      bgcolor: '#fff',
                      boxShadow: 2,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': { bgcolor: '#ffebee', color: '#c62828' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Fade>
          )}

          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 2,
            }}
          >
            <BookmarkBorderIcon fontSize="small" sx={{ color: '#d1c4e9' }} />
          </Box>

          {cover_image_url ? (
            <CardMedia
              component="img"
              height="160"
              image={cover_image_url}
              alt={`${title} cover`}
              sx={{
                objectFit: 'cover',
                borderBottom: '1px solid #eee',
                borderRadius: '4px 4px 0 0',
              }}
            />
          ) : (
            <Box
              height={160}
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                background: fallbackGradients[gradientIndex],
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No cover image
              </Typography>
            </Box>
          )}

          <CardContent sx={{ px: 2, py: 1.5, flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>
              {title || 'Untitled'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {author || 'Unknown author'}
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip
                label={condition || 'Unknown'}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
              <Chip
                label={status}
                size="small"
                color={statusColor[status] || 'default'}
                variant="filled"
                sx={{ fontWeight: 500 }}
              />
            </Stack>
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
}

BookCard.propTypes = {
  book: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  onArchive: PropTypes.func,
  editable: PropTypes.bool,
};

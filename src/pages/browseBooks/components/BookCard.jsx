// ./src/components/BookCard.jsx

import { useState, useEffect } from 'react';
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
  Grow,
  Collapse,
  Button,
} from '@mui/material';
import {
  ACTION_CONFIGS,
  STATUS_COLOR,
  FALLBACK_GRADIENTS,
  ACTION_STYLES,
} from '../../../constants/constants';
import { useBookContext } from '../../../contexts/hooks/useBookContext';
import { useAuth } from '../../../contexts/hooks/useAuth';

export default function BookCard({
  book,
  onClick,
  onDelete = () => {},
  onArchive = () => {},
  onToggleSave = () => {},
  onAccept = () => {},
  onReject = () => {},
  onCancelRequest = () => {},
  onRequestReturn = () => {},
  onRequest = () => {},
  editable = false,
  isSaved: isSavedProp,
  context = '',
}) {
  const [hovered, setHovered] = useState(false);
  const [isSavedState, setIsSavedState] = useState(
    context === 'saved' ? true : (isSavedProp ?? book?.is_saved ?? false),
  );
  const [showCard, setShowCard] = useState(true);
  const catalog = book.catalog || {};
  const { title, author, cover_url } = catalog;
  const condition = book.condition;
  const status = book.status || 'available';
  const archived = book.archived;
  const gradientIndex = (title || author || '').length % FALLBACK_GRADIENTS.length;

  const { sendBookRequest } = useBookContext();
  const { user } = useAuth();

  useEffect(() => {
    setIsSavedState(context === 'saved' ? true : (isSavedProp ?? book?.is_saved ?? false));
  }, [context, isSavedProp, book?.is_saved]);

  const handlers = {
    onDelete,
    onArchive,
    onToggleSave: (b) => {
      const newState = !isSavedState;
      setIsSavedState(newState);
      onToggleSave(b);
      if (!newState && context === 'saved') {
        setTimeout(() => setShowCard(false), 2000);
      }
    },
    onAccept,
    onReject,
    onCancelRequest,
    onRequestReturn,
  };

  const actions = ACTION_CONFIGS[context] || [];
  const isRequestPending = book.request_status === 'pending' && book.requested_by === user?.id;

  return (
    <Collapse in={showCard} timeout={300} unmountOnExit>
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
            {editable && hovered && (
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
                {actions.map((action, idx) => {
                  const styleKey =
                    typeof action.styleKey === 'function'
                      ? action.styleKey(book, action.toggleState ? isSavedState : undefined)
                      : action.styleKey;

                  const actionStyle = ACTION_STYLES[styleKey] || {};
                  return (
                    <Tooltip
                      key={idx}
                      title={
                        typeof action.title === 'function'
                          ? action.title(book, action.toggleState ? isSavedState : undefined)
                          : action.title
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlers[action.handler]?.(book);
                        }}
                        sx={{
                          bgcolor: '#fff',
                          color: 'action.active',
                          boxShadow: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: actionStyle.hover || '#f5f5f5',
                            color: actionStyle.hoverText || 'inherit',
                          },
                        }}
                      >
                        {typeof action.icon === 'function'
                          ? action.icon(book, action.toggleState ? isSavedState : undefined)
                          : action.icon}
                      </IconButton>
                    </Tooltip>
                  );
                })}
              </Box>
            )}

            {cover_url ? (
              <CardMedia
                component="img"
                height="160"
                image={cover_url}
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
                sx={{ background: FALLBACK_GRADIENTS[gradientIndex] }}
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
                  color={STATUS_COLOR[status] || 'default'}
                  variant="filled"
                  sx={{ fontWeight: 500 }}
                />
              </Stack>
            </CardContent>

            {/* Request/Withdraw Button */}
            {status === 'available' && user?.id && book.user_id !== user.id && (
              <Box px={2} pb={2}>
                {isRequestPending ? (
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelRequest(book);
                    }}
                  >
                    Withdraw Request
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequest(book);
                    }}
                  >
                    Request Book
                  </Button>
                )}
              </Box>
            )}
          </Card>
        </Grow>
      </Box>
    </Collapse>
  );
}

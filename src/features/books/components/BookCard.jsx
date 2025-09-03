// src/features/books/components/BookCard.jsx

import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grow, Collapse, Button } from '@mui/material';
import { ACTION_CONFIGS } from '../../../constants/constants';
import { useAuth } from '../../../contexts/hooks/useAuth';
import BookCardActions from './BookCardActions';
import BookCover from './BookCover';
import BookBadges from './BookBadges';

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
  onApproveReturn = () => {},
  onCompleteTransfer = () => {},
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
    onApproveReturn,
    onCompleteTransfer,
  };

  const actions = (ACTION_CONFIGS[context] || []).filter((action) => {
    if (context === 'lentOwned' && action.handler === 'onApproveReturn') {
      return Boolean(book.return_request_id);
    }
    return true;
  });
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
              transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
              bgcolor: 'background.paper',
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: hovered ? 6 : 1,
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
                <BookCardActions
                  actions={actions}
                  book={book}
                  isSavedState={isSavedState}
                  onAction={(handler) => handlers[handler]?.(book)}
                />
              </Box>
            )}

            <BookCover title={title} cover_url={cover_url} />

            <CardContent sx={{ px: 2, py: 1.5, flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>
                {title || 'Untitled'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {author || 'Unknown author'}
              </Typography>
              <BookBadges condition={condition} status={status} />
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

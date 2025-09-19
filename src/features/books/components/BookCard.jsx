// src/features/books/components/BookCard.jsx

import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grow, Collapse, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { keyframes } from '@mui/system';
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
  const pulse = keyframes`
    0% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 0.6; }
  `;
  const isRequestPending = book.request_status === 'pending' && book.requested_by === user?.id;
  const isIncomingPending =
    book.request_status === 'pending' &&
    (book.requested_to === user?.id || book.user_id === user?.id);

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

  // Slightly compact cards on dashboard contexts to fit more per row.
  const isDashboard = context !== 'browse';
  const cardWidth = isDashboard ? 220 : 240;
  const cardHeight = isDashboard ? 330 : 360;

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
            component={motion.div}
            whileHover={{
              y: -3,
              rotate: isDashboard ? -0.25 : 0,
              transition: { type: 'spring', stiffness: 260, damping: 16 },
            }}
            whileTap={{ scale: 0.985 }}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
              cursor: 'pointer',
              width: cardWidth,
              height: cardHeight,
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
            {(isRequestPending || isIncomingPending) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  bgcolor: isRequestPending ? 'warning.light' : 'info.light',
                  color: 'common.black',
                  px: 1,
                  py: 0.25,
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'warning.contrastText',
                    animation: `${pulse} 1.2s ease-in-out infinite`,
                  }}
                />
                <Typography variant="caption" fontWeight={700}>
                  {isRequestPending ? 'Request sent' : 'Incoming request'}
                </Typography>
              </Box>
            )}
            {editable && (
              <Grow in={hovered} timeout={180} unmountOnExit>
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
              </Grow>
            )}

            <BookCover title={title} cover_url={cover_url} />

            <CardContent
              sx={{ px: isDashboard ? 1.5 : 2, py: isDashboard ? 1.25 : 1.5, flexGrow: 1 }}
            >
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
              <Box px={isDashboard ? 1.5 : 2} pb={isDashboard ? 1.5 : 2}>
                {isRequestPending ? (
                  <Button
                    component={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
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
                    component={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    variant="contained"
                    size="small"
                    fullWidth
                    sx={{
                      backgroundImage: (t) =>
                        `linear-gradient(90deg, ${t.palette.success.main}, ${t.palette.primary.main})`,
                      color: 'common.white',
                    }}
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

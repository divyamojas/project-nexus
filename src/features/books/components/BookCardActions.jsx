// src/features/books/components/BookCardActions.jsx
import { IconButton, Tooltip } from '@mui/material';
import { ACTION_STYLES } from '../../../constants/constants';

export default function BookCardActions({ actions, book, isSavedState, onAction }) {
  return (
    <>
      {actions.map((action, idx) => {
        const styleKey =
          typeof action.styleKey === 'function'
            ? action.styleKey(book, action.toggleState ? isSavedState : undefined)
            : action.styleKey;
        const actionStyle = ACTION_STYLES[styleKey] || {};
        const IconComp = action.icon(book, action.toggleState ? isSavedState : undefined);

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
                onAction(action.handler);
              }}
              sx={{
                bgcolor: 'background.paper',
                color: 'action.active',
                boxShadow: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: actionStyle.hover || 'action.hover',
                  color: actionStyle.hoverText || 'inherit',
                },
              }}
            >
              {IconComp ? <IconComp fontSize="small" /> : null}
            </IconButton>
          </Tooltip>
        );
      })}
    </>
  );
}

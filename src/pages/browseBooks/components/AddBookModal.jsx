// ./src/components/AddBookModal.jsx

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Autocomplete,
  MenuItem,
  Divider,
  Typography,
  Avatar,
  Stack,
  Fade,
  Popper,
  Paper,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';

import { useBookForm } from '../../../contexts/BookContext';
import { BOOK_FORM_FIELDS } from '../../../constants/constants';
import { searchBooksCatalogByTitle } from '../../../services';
import { validateAndSubmitBookForm } from '../../../utilities';

export default function AddBookModal({ open, onClose }) {
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    imageStatus,
    setImageStatus,
    searchResults,
    setSearchResults,
    formLoading,
    setFormLoading,
    resetForm,
  } = useBookForm();

  useEffect(() => {
    if (formData.title.length > 2) {
      setFormLoading(true);
      searchBooksCatalogByTitle(formData.title).then((results) => {
        setSearchResults(results);
        setFormLoading(false);
      });
    }
  }, [formData.title]);

  const handleSelectMatch = (option) => {
    setFormData((prev) => ({
      ...prev,
      title: option.title,
      author: option.author,
      isbn: option.isbn || '',
      coverUrl: option.cover_url || '',
    }));
  };

  const handleSubmit = () => {
    validateAndSubmitBookForm(formData, {
      setErrors,
      resetForm,
      onSuccess: onClose,
    });
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.96, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { duration: 0.35, ease: 'easeInOut' },
        sx: {
          borderRadius: 4,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          transform: 'perspective(1200px) translateZ(10px)',
          background: 'linear-gradient(180deg, #ffffff, #f7f8fc)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: '1.4rem',
          position: 'relative',
          backgroundColor: '#388e3c',
          color: '#fff',
        }}
      >
        Add a Book
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent dividers sx={{ pt: 2, backgroundColor: '#fcfcfd' }}>
        <Stack spacing={2.5}>
          <Autocomplete
            freeSolo
            options={searchResults}
            getOptionLabel={(option) => option.title || ''}
            onInputChange={(e, value) => setFormData((prev) => ({ ...prev, title: value }))}
            onChange={(e, value) => value && handleSelectMatch(value)}
            loading={formLoading}
            PopperComponent={(props) => (
              <Popper
                {...props}
                placement="bottom-start"
                modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
                style={{ zIndex: 1300 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 2,
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
                    maxHeight: 240,
                    overflowY: 'auto',
                    px: 1,
                    py: 0.5,
                    backgroundColor: '#ffffff',
                  }}
                >
                  {props.children}
                </Paper>
              </Popper>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="e.g. The Alchemist"
                label="Title*"
                error={!!errors.title}
                helperText={errors.title}
                size="small"
                fullWidth
                variant="standard"
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: true,
                  sx: {
                    backgroundColor: '#f9f9f9',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    boxShadow: 1,
                  },
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />

          {BOOK_FORM_FIELDS.map((field) => (
            <React.Fragment key={field.stateKey}>
              <TextField
                placeholder={field.placeholder}
                label={field.label}
                size="small"
                fullWidth
                variant="standard"
                multiline={field.multiline || false}
                rows={field.rows || 1}
                select={field.select || false}
                error={!!errors[field.stateKey]}
                helperText={errors[field.stateKey]}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    backgroundColor: '#f9f9f9',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    boxShadow: 1,
                  },
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData[field.stateKey]}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, [field.stateKey]: value }));
                  if (field.stateKey === 'coverUrl') {
                    setImageStatus('loading');
                    const img = new Image();
                    img.onload = () => setImageStatus('success');
                    img.onerror = () => setImageStatus('error');
                    img.src = value;
                  }
                }}
              >
                {field.select &&
                  field.options?.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
              </TextField>

              {field.stateKey === 'coverUrl' && (
                <Box mt={1} textAlign="center">
                  {formData.coverUrl.trim() && formData.coverUrl.startsWith('http') ? (
                    imageStatus === 'loading' ? (
                      <CircularProgress size={24} sx={{ mt: 1 }} />
                    ) : imageStatus === 'success' ? (
                      <Fade in={true}>
                        <Box>
                          <Avatar
                            variant="rounded"
                            src={formData.coverUrl}
                            sx={{
                              width: 80,
                              height: 120,
                              mx: 'auto',
                              mb: 1,
                              borderRadius: 2,
                              boxShadow: 1,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Cover preview
                          </Typography>
                        </Box>
                      </Fade>
                    ) : (
                      <Typography variant="caption" color="error">
                        Invalid image URL
                      </Typography>
                    )
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Add URL to preview image
                    </Typography>
                  )}
                </Box>
              )}
            </React.Fragment>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Add Book
        </Button>
      </DialogActions>
    </Dialog>
  );
}

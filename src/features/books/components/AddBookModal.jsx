// ./src/components/AddBookModal.jsx

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  searchBooksCatalogByTitle,
  addBookToCatalogAndStock,
} from '@features/books/services/bookService';
import PropTypes from 'prop-types';

const conditionOptions = ['new', 'good', 'worn', 'damaged'];

export default function AddBookModal({ open, onClose }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (title.length > 2) {
      setLoading(true);
      searchBooksCatalogByTitle(title).then((results) => {
        setSearchResults(results);
        setLoading(false);
      });
    }
  }, [title]);

  const handleSelectMatch = (option) => {
    setTitle(option.title);
    setAuthor(option.author);
    setIsbn(option.isbn || '');
    setCoverUrl(option.cover_url || '');
  };

  const handleSubmit = async () => {
    if (!title || !author || !condition) {
      alert('Please fill in all required fields (title, author, condition).');
      return;
    }
    const success = await addBookToCatalogAndStock({
      title,
      author,
      isbn,
      cover_url: coverUrl,
      condition,
      notes,
    });
    if (success) onClose();
    else alert('Something went wrong while adding your book.');
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setIsbn('');
    setCoverUrl('');
    setCondition('');
    setNotes('');
    setSearchResults([]);
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Add a Book
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Autocomplete
            freeSolo
            options={searchResults}
            getOptionLabel={(option) => option.title || ''}
            onInputChange={(e, value) => setTitle(value)}
            onChange={(e, value) => value && handleSelectMatch(value)}
            loading={loading}
            renderInput={(params) => (
              <TextField {...params} label="Title*" fullWidth variant="outlined" />
            )}
          />
          <TextField
            label="Author*"
            fullWidth
            variant="outlined"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <TextField
            label="ISBN"
            fullWidth
            variant="outlined"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
          />
          <TextField
            label="Cover Image URL"
            fullWidth
            variant="outlined"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
          />
          <TextField
            label="Condition*"
            select
            fullWidth
            variant="outlined"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            {conditionOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Add Book
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddBookModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

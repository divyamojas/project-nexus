// src/components/AddBookModal.jsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  fetchCatalogBooks,
  uploadCoverImage,
  addBookToCatalog,
  addBookInstance,
} from '@/services/bookService';
import { supabase } from '@/services/supabaseClient';

export default function AddBookModal({ onClose }) {
  const [catalogBooks, setCatalogBooks] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [condition, setCondition] = useState('good');
  const [notes, setNotes] = useState('');
  const [customBook, setCustomBook] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    cover_image_url: '',
  });
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const books = await fetchCatalogBooks();
      setCatalogBooks(books);
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedCatalog && !customBook.title.trim()) {
      alert('Please select an existing book or enter a new title.');
      return;
    }
    if (!selectedCatalog && !customBook.author.trim()) {
      alert('Author is required for new titles.');
      return;
    }

    setLoading(true);
    const user = await supabase.auth.getUser();
    let catalog_id = selectedCatalog?.id;

    // Upload cover image if file exists
    let uploadedImageUrl = customBook.cover_image_url;
    if (coverFile) {
      const result = await uploadCoverImage(coverFile);
      if (result) uploadedImageUrl = result;
    }

    if (!catalog_id) {
      const newCatalog = await addBookToCatalog({
        ...customBook,
        cover_image_url: uploadedImageUrl,
        added_by: user.data.user.id,
      });
      if (!newCatalog) {
        setLoading(false);
        return;
      }
      catalog_id = newCatalog.id;
    }

    const success = await addBookInstance({
      catalog_id,
      owner_id: user.data.user.id,
      condition,
      notes,
    });

    if (success) {
      setLoading(false);
      onClose();
    } else {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add a Book</DialogTitle>
      <DialogContent dividers>
        <Autocomplete
          options={catalogBooks}
          getOptionLabel={(option) => option.title}
          onChange={(_, value) => setSelectedCatalog(value)}
          renderInput={(params) => (
            <TextField {...params} label="Search Existing Titles" margin="normal" />
          )}
        />

        <TextField
          required
          error={!selectedCatalog && !customBook.title.trim()}
          helperText={!selectedCatalog && !customBook.title.trim() ? 'Title is required' : ''}
          label="Or enter a new title *"
          fullWidth
          margin="normal"
          value={customBook.title}
          onChange={(e) => setCustomBook({ ...customBook, title: e.target.value })}
        />

        <TextField
          required
          error={!selectedCatalog && !customBook.author.trim()}
          helperText={!selectedCatalog && !customBook.author.trim() ? 'Author is required' : ''}
          label="Author *"
          fullWidth
          margin="normal"
          value={customBook.author}
          onChange={(e) => setCustomBook({ ...customBook, author: e.target.value })}
        />

        <TextField
          label="ISBN"
          fullWidth
          margin="normal"
          value={customBook.isbn}
          onChange={(e) => setCustomBook({ ...customBook, isbn: e.target.value })}
        />

        <TextField
          label="Description"
          fullWidth
          margin="normal"
          multiline
          minRows={2}
          value={customBook.description}
          onChange={(e) => setCustomBook({ ...customBook, description: e.target.value })}
        />

        <TextField
          label="Cover Image URL"
          fullWidth
          margin="normal"
          value={customBook.cover_image_url}
          onChange={(e) => setCustomBook({ ...customBook, cover_image_url: e.target.value })}
        />

        <Button variant="outlined" component="label" sx={{ my: 1 }}>
          Upload Cover Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files[0])}
          />
        </Button>

        <TextField
          select
          label="Condition"
          fullWidth
          margin="normal"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <MenuItem value="new">New</MenuItem>
          <MenuItem value="good">Good</MenuItem>
          <MenuItem value="worn">Worn</MenuItem>
          <MenuItem value="damaged">Damaged</MenuItem>
        </TextField>

        <TextField
          label="Notes (optional)"
          fullWidth
          margin="normal"
          multiline
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Adding...' : 'Add Book'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

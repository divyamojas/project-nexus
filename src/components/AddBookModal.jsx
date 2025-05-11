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
import { supabase } from '@/services/supabaseClient';

export default function AddBookModal({ onClose }) {
  const [catalogBooks, setCatalogBooks] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [condition, setCondition] = useState('good');
  const [notes, setNotes] = useState('');
  const [customBook, setCustomBook] = useState({ title: '', author: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      const { data } = await supabase.from('books_catalog').select('*').order('title');
      setCatalogBooks(data || []);
    };
    fetchCatalog();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    let catalog_id = selectedCatalog?.id;

    if (!catalog_id) {
      const { data, error } = await supabase
        .from('books_catalog')
        .insert([customBook])
        .select()
        .single();
      if (error) {
        console.error('Catalog insert error:', error);
        setLoading(false);
        return;
      }
      catalog_id = data.id;
    }

    const user = await supabase.auth.getUser();
    await supabase.from('books').insert([
      {
        catalog_id,
        owner_id: user.data.user.id,
        condition,
        notes,
      },
    ]);

    setLoading(false);
    onClose();
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
          label="Or enter a new title"
          fullWidth
          margin="normal"
          value={customBook.title}
          onChange={(e) => setCustomBook({ ...customBook, title: e.target.value })}
        />
        <TextField
          label="Author"
          fullWidth
          margin="normal"
          value={customBook.author}
          onChange={(e) => setCustomBook({ ...customBook, author: e.target.value })}
        />

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

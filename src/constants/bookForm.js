// src/constants/bookForm.js
export const BOOK_FORM_FIELDS = [
  {
    label: 'Author*',
    placeholder: 'e.g. Paulo Coelho',
    stateKey: 'author',
    required: true,
  },
  {
    label: 'Condition*',
    placeholder: "Select the book's condition",
    stateKey: 'condition',
    select: true,
    options: ['new', 'good', 'worn', 'damaged'],
    required: true,
  },
  {
    label: 'Cover URL',
    placeholder: 'Paste image URL here',
    stateKey: 'coverUrl',
  },
  {
    label: 'ISBN',
    placeholder: 'e.g. 978-0061122415',
    stateKey: 'isbn',
  },
  {
    label: 'Notes',
    placeholder: 'Optional — share any thoughts or details.',
    stateKey: 'notes',
    multiline: true,
    rows: 2,
  },
];

export const INITIAL_BOOK_FORM_DATA = {
  title: '',
  author: '',
  isbn: '',
  coverUrl: '',
  condition: 'new',
  notes: '',
};

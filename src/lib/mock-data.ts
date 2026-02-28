
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description: string;
  copies: number;
  available: number;
  status: 'Available' | 'Low Stock' | 'Unavailable';
}

export interface Patron {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  status: 'Active' | 'Suspended';
}

export interface Loan {
  id: string;
  bookId: string;
  patronId: string;
  checkoutDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'Active' | 'Returned' | 'Overdue';
}

export const BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    genre: 'Classic',
    description: 'A story of wealth, love, and the American dream in the 1920s.',
    copies: 5,
    available: 3,
    status: 'Available',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780446310789',
    genre: 'Fiction',
    description: 'The story of racial injustice and the loss of innocence in the American South.',
    copies: 4,
    available: 1,
    status: 'Low Stock',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    genre: 'Dystopian',
    description: 'A chilling look at a future totalitarian society.',
    copies: 8,
    available: 0,
    status: 'Unavailable',
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '9780141439518',
    genre: 'Romance',
    description: 'A classic tale of manners, upbringing, and marriage in early 19th-century England.',
    copies: 6,
    available: 6,
    status: 'Available',
  }
];

export const PATRONS: Patron[] = [
  {
    id: 'p1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '555-0101',
    joinedDate: '2023-01-15',
    status: 'Active',
  },
  {
    id: 'p2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '555-0102',
    joinedDate: '2023-03-22',
    status: 'Active',
  },
  {
    id: 'p3',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    phone: '555-0103',
    joinedDate: '2022-11-05',
    status: 'Suspended',
  }
];

export const LOANS: Loan[] = [
  {
    id: 'l1',
    bookId: '1',
    patronId: 'p1',
    checkoutDate: '2024-05-01',
    dueDate: '2024-05-15',
    fineAmount: 0,
    status: 'Active',
  },
  {
    id: 'l2',
    bookId: '2',
    patronId: 'p2',
    checkoutDate: '2024-04-10',
    dueDate: '2024-04-24',
    fineAmount: 15.50,
    status: 'Overdue',
  }
];

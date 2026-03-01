// src/lib/db.ts
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('./data/fredpt.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    age INTEGER,
    height REAL,
    weight REAL,
    fitness_goals TEXT,
    experience TEXT,
    injuries TEXT,
    preferred_times TEXT,
    trial_completed BOOLEAN DEFAULT 0,
    sessions_remaining INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL, -- 'trial' or 'regular'
    status TEXT DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'completed', 'no-show'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    sessions INTEGER NOT NULL,
    price_paid REAL NOT NULL,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );
`);

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  height?: number;
  weight?: number;
  fitness_goals?: string;
  experience?: string;
  injuries?: string;
  preferred_times?: string;
  trial_completed: boolean;
  sessions_remaining: number;
  created_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  date: string;
  time: string;
  type: 'trial' | 'regular';
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  created_at: string;
}

export const dbClient = {
  // Create new client from questionnaire
  createClient: (data: Omit<Client, 'id' | 'created_at' | 'trial_completed' | 'sessions_remaining'>): Client => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO clients (id, name, email, phone, age, height, weight, fitness_goals, experience, injuries, preferred_times)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.name, data.email, data.phone, data.age, data.height, data.weight, 
             data.fitness_goals, data.experience, data.injuries, data.preferred_times);
    return dbClient.getClient(id)!;
  },

  getClient: (id: string): Client | undefined => {
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as Client | undefined;
  },

  getClientByEmail: (email: string): Client | undefined => {
    return db.prepare('SELECT * FROM clients WHERE email = ?').get(email) as Client | undefined;
  },

  // Check if client has used trial
  hasUsedTrial: (email: string): boolean => {
    const client = dbClient.getClientByEmail(email);
    return client ? client.trial_completed : false;
  },

  // Mark trial as completed
  completeTrial: (clientId: string) => {
    db.prepare('UPDATE clients SET trial_completed = 1 WHERE id = ?').run(clientId);
  },

  // Add sessions (when they buy a package)
  addSessions: (clientId: string, sessions: number) => {
    db.prepare('UPDATE clients SET sessions_remaining = sessions_remaining + ? WHERE id = ?')
      .run(sessions, clientId);
  },

  // Deduct session (when they book)
  useSession: (clientId: string): boolean => {
    const client = dbClient.getClient(clientId);
    if (!client || client.sessions_remaining <= 0) return false;
    
    db.prepare('UPDATE clients SET sessions_remaining = sessions_remaining - 1 WHERE id = ?')
      .run(clientId);
    return true;
  },

  // Create booking
  createBooking: (clientId: string, date: string, time: string, type: 'trial' | 'regular'): Booking => {
    const id = uuidv4();
    db.prepare('INSERT INTO bookings (id, client_id, date, time, type) VALUES (?, ?, ?, ?, ?)')
      .run(id, clientId, date, time, type);
    
    // Deduct session if regular booking
    if (type === 'regular') {
      dbClient.useSession(clientId);
    }
    
    return dbClient.getBooking(id)!;
  },

  getBooking: (id: string): Booking | undefined => {
    return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Booking | undefined;
  },

  getClientBookings: (clientId: string): Booking[] => {
    return db.prepare('SELECT * FROM bookings WHERE client_id = ? ORDER BY date DESC, time DESC')
      .all(clientId) as Booking[];
  },

  // Cancel booking (with 24h check)
  cancelBooking: (bookingId: string): { success: boolean; message: string } => {
    const booking = dbClient.getBooking(bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };
    
    const bookingDate = new Date(`${booking.date}T${booking.time}`);
    const now = new Date();
    const hoursDiff = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      return { success: false, message: 'Cannot cancel within 24 hours of session' };
    }
    
    // Refund session if regular booking
    if (booking.type === 'regular') {
      dbClient.addSessions(booking.client_id, 1);
    }
    
    db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(bookingId);
    return { success: true, message: 'Booking cancelled' };
  },

  // Record package purchase
  recordPackage: (clientId: string, sessions: number, price: number) => {
    const id = uuidv4();
    db.prepare('INSERT INTO packages (id, client_id, sessions, price_paid) VALUES (?, ?, ?, ?)')
      .run(id, clientId, sessions, price);
    dbClient.addSessions(clientId, sessions);
  },

  // Get all clients (for admin)
  getAllClients: (): Client[] => {
    return db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all() as Client[];
  },

  // Get upcoming bookings (for admin)
  getUpcomingBookings: (): (Booking & { client_name: string })[] => {
    return db.prepare(`
      SELECT b.*, c.name as client_name 
      FROM bookings b 
      JOIN clients c ON b.client_id = c.id 
      WHERE b.date >= date('now') AND b.status = 'confirmed'
      ORDER BY b.date, b.time
    `).all() as (Booking & { client_name: string })[];
  }
};

export default dbClient;

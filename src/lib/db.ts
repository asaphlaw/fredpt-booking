// src/lib/db.ts
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

export interface ClientData {
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
  trial_completed: number;
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

// Initialize tables - run this manually in Vercel Postgres console
const initSQL = `
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
    trial_completed INTEGER DEFAULT 0,
    sessions_remaining INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    sessions INTEGER NOT NULL,
    price_paid REAL NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

function toClientData(row: any): ClientData {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: row.phone ? String(row.phone) : undefined,
    age: row.age ? Number(row.age) : undefined,
    height: row.height ? Number(row.height) : undefined,
    weight: row.weight ? Number(row.weight) : undefined,
    fitness_goals: row.fitness_goals ? String(row.fitness_goals) : undefined,
    experience: row.experience ? String(row.experience) : undefined,
    injuries: row.injuries ? String(row.injuries) : undefined,
    preferred_times: row.preferred_times ? String(row.preferred_times) : undefined,
    trial_completed: Number(row.trial_completed || 0),
    sessions_remaining: Number(row.sessions_remaining || 0),
    created_at: String(row.created_at)
  };
}

function toBooking(row: any): Booking {
  return {
    id: String(row.id),
    client_id: String(row.client_id),
    date: String(row.date),
    time: String(row.time),
    type: String(row.type) as 'trial' | 'regular',
    status: String(row.status) as 'confirmed' | 'cancelled' | 'completed' | 'no-show',
    created_at: String(row.created_at)
  };
}

export const dbClient = {
  createClient: async (data: Omit<ClientData, 'id' | 'created_at' | 'trial_completed' | 'sessions_remaining'>): Promise<ClientData> => {
    const id = uuidv4();
    await sql`
      INSERT INTO clients (id, name, email, phone, age, height, weight, fitness_goals, experience, injuries, preferred_times)
      VALUES (${id}, ${data.name}, ${data.email}, ${data.phone ?? null}, ${data.age ?? null}, ${data.height ?? null}, ${data.weight ?? null}, 
             ${data.fitness_goals ?? null}, ${data.experience ?? null}, ${data.injuries ?? null}, ${data.preferred_times ?? null})
    `;
    return dbClient.getClient(id) as Promise<ClientData>;
  },

  getClient: async (id: string): Promise<ClientData | undefined> => {
    const result = await sql`SELECT * FROM clients WHERE id = ${id}`;
    return result.rows[0] ? toClientData(result.rows[0]) : undefined;
  },

  getClientByEmail: async (email: string): Promise<ClientData | undefined> => {
    const result = await sql`SELECT * FROM clients WHERE email = ${email}`;
    return result.rows[0] ? toClientData(result.rows[0]) : undefined;
  },

  hasUsedTrial: async (email: string): Promise<boolean> => {
    const c = await dbClient.getClientByEmail(email);
    return c ? c.trial_completed === 1 : false;
  },

  completeTrial: async (clientId: string) => {
    await sql`UPDATE clients SET trial_completed = 1 WHERE id = ${clientId}`;
  },

  addSessions: async (clientId: string, sessions: number) => {
    await sql`UPDATE clients SET sessions_remaining = sessions_remaining + ${sessions} WHERE id = ${clientId}`;
  },

  useSession: async (clientId: string): Promise<boolean> => {
    const c = await dbClient.getClient(clientId);
    if (!c || c.sessions_remaining <= 0) return false;
    
    await sql`UPDATE clients SET sessions_remaining = sessions_remaining - 1 WHERE id = ${clientId}`;
    return true;
  },

  createBooking: async (clientId: string, date: string, time: string, type: 'trial' | 'regular'): Promise<Booking> => {
    const id = uuidv4();
    await sql`INSERT INTO bookings (id, client_id, date, time, type) VALUES (${id}, ${clientId}, ${date}, ${time}, ${type})`;
    
    if (type === 'regular') {
      await dbClient.useSession(clientId);
    }
    
    const result = await sql`SELECT * FROM bookings WHERE id = ${id}`;
    return toBooking(result.rows[0]);
  },

  getBooking: async (id: string): Promise<Booking | undefined> => {
    const result = await sql`SELECT * FROM bookings WHERE id = ${id}`;
    return result.rows[0] ? toBooking(result.rows[0]) : undefined;
  },

  getClientBookings: async (clientId: string): Promise<Booking[]> => {
    const result = await sql`SELECT * FROM bookings WHERE client_id = ${clientId} ORDER BY date DESC, time DESC`;
    return result.rows.map(toBooking);
  },

  cancelBooking: async (bookingId: string): Promise<{ success: boolean; message: string }> => {
    const booking = await dbClient.getBooking(bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };
    
    const bookingDate = new Date(`${booking.date}T${booking.time}`);
    const now = new Date();
    const hoursDiff = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      return { success: false, message: 'Cannot cancel within 24 hours of session' };
    }
    
    if (booking.type === 'regular') {
      await dbClient.addSessions(booking.client_id, 1);
    }
    
    await sql`UPDATE bookings SET status = 'cancelled' WHERE id = ${bookingId}`;
    return { success: true, message: 'Booking cancelled' };
  },

  recordPackage: async (clientId: string, sessions: number, price: number) => {
    const id = uuidv4();
    await sql`INSERT INTO packages (id, client_id, sessions, price_paid) VALUES (${id}, ${clientId}, ${sessions}, ${price})`;
    await dbClient.addSessions(clientId, sessions);
  },

  getAllClients: async (): Promise<ClientData[]> => {
    const result = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
    return result.rows.map(toClientData);
  },

  getUpcomingBookings: async (): Promise<(Booking & { client_name: string })[]> => {
    const result = await sql`
      SELECT b.*, c.name as client_name 
      FROM bookings b 
      JOIN clients c ON b.client_id = c.id 
      WHERE b.date >= CURRENT_DATE AND b.status = 'confirmed'
      ORDER BY b.date, b.time
    `;
    return result.rows.map(row => ({
      ...toBooking(row),
      client_name: String(row.client_name)
    }));
  }
};

export default dbClient;
export { initSQL };

import { pool } from '../../config/database';
import { User, CreateUserDTO } from '../../types/user.types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class UserModel {
  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as User) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length ? (rows[0] as User) : null;
  }

  async create(user: CreateUserDTO & { password_hash: string }): Promise<User> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user.name, user.email, user.password_hash, user.role, user.phone || null, 'active']
    );
    
    const newUser = await this.findById(result.insertId);
    if (!newUser) throw new Error('Failed to create user');
    return newUser;
  }

  async update(id: number, updates: any): Promise<User | null> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    
    if (keys.length === 0) return this.findById(id);

    const updateClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE users SET ${updateClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<{ users: User[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM users'
    );

    return {
      users: rows as User[],
      total: (countResult[0] as any).total,
    };
  }
}

export const userModel = new UserModel();

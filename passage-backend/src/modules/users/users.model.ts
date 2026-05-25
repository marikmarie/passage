import { pool } from '../../config/database';
import { User, UpdateUserDTO } from '../../types/user.types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class UsersModel {
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

  async findAll(limit: number = 10, offset: number = 0, role?: string): Promise<{ users: User[]; total: number }> {
    let query = 'SELECT * FROM users';
    const params: any[] = [];

    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM users';
    if (role) {
      countQuery += ' WHERE role = ?';
    }

    const countParams = role ? [role] : [];
    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);

    return {
      users: rows as User[],
      total: (countResult[0] as any).total,
    };
  }

  async update(id: number, updates: UpdateUserDTO): Promise<User | null> {
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
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      ['deleted', id]
    );
    return result.affectedRows > 0;
  }
}

export const usersModel = new UsersModel();

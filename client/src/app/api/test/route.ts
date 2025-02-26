import { NextResponse } from 'next/server';
import pool from '../db';

export async function GET() {
  try {
    // Simple test query
    const result = await pool.query('SELECT NOW() as time');
    
    // Get table names to verify connection
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    return NextResponse.json({
      status: 'connected',
      time: result.rows[0].time,
      tables: tables.rows.map(row => row.table_name)
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
} 
// ─────────────────────────────────────────────────────────────
//  POST /api/auth/reset-password
//  Body: { token, newPassword }
//
//  Validates the reset token against the DB, checks expiry,
//  hashes the new password, updates the user, clears the token.
//
//  Token is the raw hex string from the reset email URL.
//  Tokens are single-use and expire after 1 hour.
// ─────────────────────────────────────────────────────────────
const { app }          = require('@azure/functions');
const bcrypt           = require('bcryptjs');
const { getPool, sql } = require('../shared/db');

const CORS = {
  'Access-Control-Allow-Origin':  process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

app.http('auth-reset-password', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/reset-password',
  handler: async (request, context) => {
    if (request.method === 'OPTIONS') return { status: 204, headers: CORS };

    try {
      const { token, newPassword } = await request.json();

      if (!token || !newPassword) {
        return {
          status: 400,
          headers: CORS,
          body: JSON.stringify({ error: 'Token and new password are required.' }),
        };
      }

      if (newPassword.length < 8) {
        return {
          status: 400,
          headers: CORS,
          body: JSON.stringify({ error: 'Password must be at least 8 characters.' }),
        };
      }

      const pool = await getPool();

      // Look up user by token — also check expiry in the query
      const result = await pool.request()
        .input('token', sql.NVarChar(255), token)
        .query(`
          SELECT id, email, name
          FROM Users
          WHERE reset_token = @token
            AND reset_token_expiry > GETUTCDATE()
        `);

      const user = result.recordset[0];

      if (!user) {
        return {
          status: 400,
          headers: CORS,
          body: JSON.stringify({ error: 'This reset link is invalid or has expired. Please request a new one.' }),
        };
      }

      // Hash new password — cost factor 12 matches registration
      const hash = await bcrypt.hash(newPassword, 12);

      // Update password and clear the reset token in one statement
      await pool.request()
        .input('id',   sql.UniqueIdentifier, user.id)
        .input('hash', sql.NVarChar(255),    hash)
        .query(`
          UPDATE Users
          SET password_hash      = @hash,
              reset_token        = NULL,
              reset_token_expiry = NULL
          WHERE id = @id
        `);

      context.log(`Password reset successful for user ${user.id}`);

      return {
        status: 200,
        headers: CORS,
        body: JSON.stringify({ message: 'Password updated successfully. You can now sign in.' }),
      };
    } catch (err) {
      context.error('auth-reset-password:', err);
      return {
        status: 500,
        headers: CORS,
        body: JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      };
    }
  },
});

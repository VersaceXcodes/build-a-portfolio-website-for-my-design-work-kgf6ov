import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import morgan from 'morgan';
import cors from 'cors';
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment configuration
dotenv.config();
const { Pool } = pkg;
const { PORT = 3000, JWT_SECRET } = process.env;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Initialize server
const app = express();

// Middleware setup
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Function to generate JWT tokens
function generateToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

// Middleware to authenticate tokens
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// POST /api/register - Register a new user
app.post('/api/register', async (req, res) => {
  const { email, password, role } = req.body;
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO users (user_id, email, password_hash, user_role, created_at) VALUES ($1, $2, $3, $4, NOW())`,
      [userId, email, hashedPassword, role]
    );
    client.release();
    res.status(200).json({ success: true, user_id: userId, message: 'User registration successful' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error registering user' });
  }
});

// POST /api/login - Log in a user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT * FROM users WHERE email = $1`, [email]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    if (await bcrypt.compare(password, user.password_hash)) {
      const token = generateToken({ user_id: user.user_id, user_role: user.user_role });
      res.status(200).json({ success: true, token, user_role: user.user_role, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
});

// GET /api/projects - Get a list of projects for the authenticated designer
app.get('/api/projects', authenticateToken, async (req, res) => {
  const designer_id = req.user.user_id;

  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT * FROM projects WHERE designer_id = $1`, [designer_id]);
    client.release();

    res.status(200).json({ projects: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching projects' });
  }
});

// POST /api/projects - Create a new project for the designer
app.post('/api/projects', authenticateToken, async (req, res) => {
  const designer_id = req.user.user_id;
  const { title, description, category, media } = req.body;
  const project_id = uuidv4();

  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO projects (project_id, designer_id, title, description, category, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [project_id, designer_id, title, description, category]
    );

    if (media && media.length > 0) {
      for (let i = 0; i < media.length; i++) {
        const media_id = uuidv4();
        await client.query(
          `INSERT INTO project_media (media_id, project_id, media_type, media_url, display_order) VALUES ($1, $2, $3, $4, $5)`,
          [media_id, project_id, media[i].type, media[i].url, i + 1]
        );
      }
    }

    client.release();
    res.status(200).json({ success: true, project_id, message: 'Project created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating project' });
  }
});

// PUT /api/projects/:project_id - Update existing project details for the designer
app.put('/api/projects/:project_id', authenticateToken, async (req, res) => {
  const { project_id } = req.params;
  const { title, description, category } = req.body;

  try {
    const client = await pool.connect();
    await client.query(
      `UPDATE projects SET title = $1, description = $2, category = $3, updated_at = NOW() WHERE project_id = $4`,
      [title, description, category, project_id]
    );
    client.release();
    res.status(200).json({ success: true, message: 'Project updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating project' });
  }
});

// DELETE /api/projects/:project_id - Delete a specific project from the designer's portfolio
app.delete('/api/projects/:project_id', authenticateToken, async (req, res) => {
  const { project_id } = req.params;

  try {
    const client = await pool.connect();
    await client.query(`DELETE FROM project_media WHERE project_id = $1`, [project_id]);
    await client.query(`DELETE FROM projects WHERE project_id = $1`, [project_id]);
    client.release();

    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting project' });
  }
});

// GET /api/designer-profile - Retrieve the designer's profile and customization settings
app.get('/api/designer-profile', authenticateToken, async (req, res) => {
  const designer_id = req.user.user_id;

  try {
    const client = await pool.connect();
    const profileResult = await client.query(
      `SELECT * FROM designer_profiles WHERE user_id = $1`,
      [designer_id]
    );
    const customizationResult = await client.query(
      `SELECT * FROM customization_options WHERE designer_id = $1`,
      [profileResult.rows[0].profile_id]
    );
    client.release();

    if (profileResult.rows.length === 0 || customizationResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({
      profile: profileResult.rows[0],
      customization: customizationResult.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// PUT /api/designer-profile - Update the designer's profile information and customization settings
app.put('/api/designer-profile', authenticateToken, async (req, res) => {
  const designer_id = req.user.user_id;
  const { bio, resume_link, profile_picture, social_media_links, customization } = req.body;

  try {
    const client = await pool.connect();
    await client.query(
      `UPDATE designer_profiles SET bio = $1, resume_link = $2, profile_picture = $3, social_media_links = $4 WHERE user_id = $5`,
      [bio, resume_link, profile_picture, JSON.stringify(social_media_links), designer_id]
    );

    await client.query(
      `UPDATE customization_options SET theme_choice = $1, color_palette = $2, logo_url = $3 WHERE designer_id = $4`,
      [customization.theme_choice, JSON.stringify(customization.color_palette), customization.logo_url, designer_id]
    );

    client.release();
    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// POST /api/contact - Send a message to the designer through the contact form
app.post('/api/contact', async (req, res) => {
  const { designer_id, sender_name, sender_email, subject, message_body } = req.body;
  const message_id = uuidv4();

  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO contact_messages (message_id, designer_id, sender_name, sender_email, subject, message_body, sent_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [message_id, designer_id, sender_name, sender_email, subject, message_body]
    );
    client.release();

    res.status(200).json({ success: true, message: 'Contact message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
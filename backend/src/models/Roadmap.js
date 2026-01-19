const pool = require('../config/database');

class Roadmap {
  static async getAll() {
    const query = `
      SELECT r.*, 
        json_agg(
          json_build_object(
            'id', ri.id,
            'title', ri.title,
            'order_index', ri.order_index
          ) ORDER BY ri.order_index
        ) as items
      FROM roadmaps r
      LEFT JOIN roadmap_items ri ON r.id = ri.roadmap_id
      GROUP BY r.id
      ORDER BY r.id
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const roadmapQuery = 'SELECT * FROM roadmaps WHERE id = $1';
    const roadmap = await pool.query(roadmapQuery, [id]);

    if (roadmap.rows.length === 0) return null;

    const itemsQuery = `
      SELECT * FROM roadmap_items 
      WHERE roadmap_id = $1 
      ORDER BY order_index
    `;
    const items = await pool.query(itemsQuery, [id]);

    const projectsQuery = 'SELECT * FROM projects WHERE roadmap_id = $1';
    const projects = await pool.query(projectsQuery, [id]);

    return {
      ...roadmap.rows[0],
      items: items.rows,
      projects: projects.rows
    };
  }

  static async create({ title, description, items }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const roadmapQuery = `
        INSERT INTO roadmaps (title, description)
        VALUES ($1, $2)
        RETURNING *
      `;
      const roadmap = await client.query(roadmapQuery, [title, description]);
      const roadmapId = roadmap.rows[0].id;

      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const itemQuery = `
            INSERT INTO roadmap_items (roadmap_id, title, order_index)
            VALUES ($1, $2, $3)
          `;
          await client.query(itemQuery, [roadmapId, items[i], i]);
        }
      }

      await client.query('COMMIT');
      return await this.getById(roadmapId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Roadmap;
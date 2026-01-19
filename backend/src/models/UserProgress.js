const pool = require('../config/database');

class UserProgress {
  static async getUserProgress(userId, roadmapId) {
    const query = `
      SELECT ri.id, ri.title, ri.order_index,
        COALESCE(up.status, 'not-started') as status
      FROM roadmap_items ri
      LEFT JOIN user_progress up ON ri.id = up.roadmap_item_id AND up.user_id = $1
      WHERE ri.roadmap_id = $2
      ORDER BY ri.order_index
    `;
    const result = await pool.query(query, [userId, roadmapId]);
    return result.rows;
  }

  static async updateStatus(userId, itemId, status) {
    const query = `
      INSERT INTO user_progress (user_id, roadmap_item_id, status, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, roadmap_item_id)
      DO UPDATE SET status = $3, updated_at = NOW()
      RETURNING *
    `;
    const result = await pool.query(query, [userId, itemId, status]);
    return result.rows[0];
  }

  static async getAllUserProgress(userId) {
    const query = `
      SELECT r.id as roadmap_id, r.title, r.description,
        COUNT(ri.id) as total_items,
        COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_items,
        COUNT(CASE WHEN up.status = 'studying' THEN 1 END) as studying_items
      FROM roadmaps r
      LEFT JOIN roadmap_items ri ON r.id = ri.roadmap_id
      LEFT JOIN user_progress up ON ri.id = up.roadmap_item_id AND up.user_id = $1
      GROUP BY r.id, r.title, r.description
      ORDER BY r.id
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

module.exports = UserProgress;
const pool = require("../db");

let schemaEnsured = false;

function asNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

async function ensureNotificationSchema() {
  if (schemaEnsured) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK (target_type IN ('all', 'flat')),
      target_id UUID NULL REFERENCES flats(id) ON DELETE SET NULL,
      sent_by INTEGER NULL,
      sent_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notification_device_tokens (
      id SERIAL PRIMARY KEY,
      flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
      fcm_token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE flats
    ADD COLUMN IF NOT EXISTS last_read_notifications_at TIMESTAMP
  `);

  // Migrate existing tables if they were created with INTEGER columns instead of UUID
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'notification_device_tokens'
            AND column_name = 'flat_id'
            AND data_type = 'integer'
        ) THEN
          ALTER TABLE notification_device_tokens DROP CONSTRAINT IF EXISTS notification_device_tokens_flat_id_fkey;
          ALTER TABLE notification_device_tokens ALTER COLUMN flat_id TYPE UUID USING flat_id::text::uuid;
          ALTER TABLE notification_device_tokens ADD CONSTRAINT notification_device_tokens_flat_id_fkey
            FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE CASCADE;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'notifications'
            AND column_name = 'target_id'
            AND data_type = 'integer'
        ) THEN
          ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_target_id_fkey;
          ALTER TABLE notifications ALTER COLUMN target_id TYPE UUID USING NULL;
          ALTER TABLE notifications ADD CONSTRAINT notifications_target_id_fkey
            FOREIGN KEY (target_id) REFERENCES flats(id) ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);
  } catch (migrationErr) {
    console.warn("Schema migration warning (non-fatal):", migrationErr.message);
  }

  schemaEnsured = true;
}

// Body: { title: string, message: string, targetType?: "all"|"flat", flatId?: number|string, flat_id?: number|string, flatNumber?: string, sentBy?: number }
exports.sendNotification = async (req, res) => {
  try {
    await ensureNotificationSchema();

    const { title, message, targetType, flatId, flat_id, flatNumber, sentBy } = req.body || {};
    const titleStr = asNonEmptyString(title);
    const messageStr = asNonEmptyString(message);

    if (!titleStr || !messageStr) {
      return res
        .status(400)
        .json({ success: false, message: "Both 'title' and 'message' are required" });
    }

    const resolvedTargetType = targetType === "flat" ? "flat" : "all";
    let targetId = null;

    if (resolvedTargetType === "flat") {
      const rawFlatRef = flatId ?? flat_id ?? flatNumber ?? null;
      const flatRefStr = rawFlatRef !== null && rawFlatRef !== undefined ? `${rawFlatRef}`.trim() : "";

      if (!flatRefStr) {
        return res.status(400).json({ success: false, message: "Please select a flat." });
      }

      // Try by UUID/id first
      const flatById = await pool.query(`SELECT id FROM flats WHERE id::text = $1`, [flatRefStr]);
      if (flatById.rows.length > 0) {
        targetId = flatById.rows[0].id;
      }

      // Fallback: try by flat_number
      if (!targetId) {
        const flatByNumber = await pool.query(
          `SELECT id FROM flats WHERE flat_number::text = $1 LIMIT 1`,
          [flatRefStr]
        );
        if (flatByNumber.rows.length > 0) {
          targetId = flatByNumber.rows[0].id;
        }
      }

      if (!targetId) {
        return res.status(400).json({
          success: false,
          message: "Invalid flat selection. Please choose a valid flat from dropdown.",
        });
      }
    }

    const insertResult = await pool.query(
      `
      INSERT INTO notifications (title, message, target_type, target_id, sent_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, message, target_type, target_id, sent_by, sent_at
      `,
      [titleStr, messageStr, resolvedTargetType, targetId, sentBy ? Number(sentBy) : null]
    );

    return res.json({ success: true, notification: insertResult.rows[0] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/notifications?flatId=1
exports.getNotifications = async (req, res) => {
  try {
    await ensureNotificationSchema();

    const { flatId } = req.query;
    let result;

    if (flatId !== undefined && flatId !== null && `${flatId}`.trim() !== "") {
      const flatIdStr = `${flatId}`.trim();

      result = await pool.query(
        `SELECT id, title, message, target_type, target_id, sent_at
         FROM notifications
         WHERE target_type = 'all' OR target_id::text = $1
         ORDER BY sent_at DESC LIMIT 100`,
        [flatIdStr]
      );
    } else {
      // Admin requesting all notifications
      result = await pool.query(
        `SELECT id, title, message, target_type, target_id, sent_at
         FROM notifications
         ORDER BY sent_at DESC LIMIT 200`
      );
    }

    return res.json({ success: true, notifications: result.rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Body: { flatId: string }
exports.markAsRead = async (req, res) => {
  try {
    await ensureNotificationSchema();

    const { flatId } = req.body || {};
    const flatIdStr = asNonEmptyString(String(flatId ?? ""));

    if (!flatIdStr) {
      return res.status(400).json({ success: false, message: "Invalid flatId" });
    }

    await pool.query(
      `UPDATE flats SET last_read_notifications_at = NOW() WHERE id::text = $1`,
      [flatIdStr]
    );

    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/notifications/unread-count?flatId=...
exports.getUnreadCount = async (req, res) => {
  try {
    await ensureNotificationSchema();

    const { flatId } = req.query;
    const flatIdStr = asNonEmptyString(String(flatId ?? ""));

    if (!flatIdStr) {
      return res.status(400).json({ success: false, message: "Invalid flatId" });
    }

    const result = await pool.query(
      `SELECT COUNT(*)::int AS unread_count
       FROM notifications n
       JOIN flats f ON f.id::text = $1
       WHERE (n.target_type = 'all' OR n.target_id::text = $1)
       AND n.sent_at > COALESCE(f.last_read_notifications_at, '1970-01-01'::timestamp)`,
      [flatIdStr]
    );

    return res.json({ success: true, count: result.rows[0]?.unread_count || 0 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

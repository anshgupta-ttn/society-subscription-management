const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

let initializedAdmin = null;

function normalizeServiceAccount(serviceAccount) {
  if (!serviceAccount || typeof serviceAccount !== "object") {
    throw new Error("Invalid Firebase service account payload.");
  }

  const normalized = { ...serviceAccount };

  if (typeof normalized.private_key === "string") {
    // Most env injectors store newlines as "\\n"; Firebase expects real newlines.
    normalized.private_key = normalized.private_key.replace(/\\n/g, "\n");
  }

  if (
    !normalized.project_id ||
    !normalized.client_email ||
    !normalized.private_key
  ) {
    throw new Error(
      "Firebase service account must include project_id, client_email, and private_key."
    );
  }

  return normalized;
}

function loadServiceAccount() {
  const jsonFromEnv = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON?.trim();
  const pathFromEnv = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH?.trim();

  if (pathFromEnv) {
    const abs = path.isAbsolute(pathFromEnv)
      ? pathFromEnv
      : path.join(process.cwd(), pathFromEnv);
    try {
      const raw = fs.readFileSync(abs, "utf8");
      return normalizeServiceAccount(JSON.parse(raw));
    } catch (err) {
      throw new Error(
        `Unable to load Firebase service account from path '${abs}': ${err.message}`
      );
    }
  }

  if (jsonFromEnv) {
    try {
      return normalizeServiceAccount(JSON.parse(jsonFromEnv));
    } catch (err) {
      throw new Error(
        `Unable to parse FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON: ${err.message}`
      );
    }
  }

  // Dev fallback: auto-detect a Firebase service account JSON in the backend cwd.
  try {
    const searchDirs = [process.cwd(), path.resolve(__dirname, "..")];

    for (const dir of searchDirs) {
      const candidate = fs
        .readdirSync(dir)
        .find((name) => /firebase-adminsdk.*\.json$/i.test(name));

      if (candidate) {
        const abs = path.join(dir, candidate);
        const raw = fs.readFileSync(abs, "utf8");
        return normalizeServiceAccount(JSON.parse(raw));
      }
    }
  } catch (err) {
    // Ignore fallback scan errors and throw the standard missing-credentials error below.
  }

  throw new Error(
    "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON or FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH."
  );
}

function getFirebaseAdmin() {
  if (initializedAdmin || admin.apps.length > 0) {
    initializedAdmin = admin;
    return initializedAdmin;
  }

  const serviceAccount = loadServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initializedAdmin = admin;
  return initializedAdmin;
}

module.exports = { getFirebaseAdmin };

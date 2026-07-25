import fs from 'fs';
import path from 'path';

const jsonPath = path.resolve(process.cwd(), 'database.json');

function migrate() {
  if (!fs.existsSync(jsonPath)) {
    console.log("No database.json found. Skipping migration.");
    return;
  }

  try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const db = JSON.parse(rawData);
    let changed = false;

    // Migrate Users: add sanctions_status
    if (db.users && Array.isArray(db.users)) {
      db.users.forEach((user) => {
        if (user.sanctions_status === undefined) {
          user.sanctions_status = 'CLEARED';
          changed = true;
        }
      });
    }

    if (changed) {
      fs.writeFileSync(jsonPath, JSON.stringify(db, null, 2), 'utf8');
      console.log("Migration complete: Added sanctions_status to existing users.");
    } else {
      console.log("Database is already up to date.");
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();

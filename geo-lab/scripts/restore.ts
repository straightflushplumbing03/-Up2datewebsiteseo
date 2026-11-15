import { restoreDatabase } from "../src/lib/backup";

const [backup, dest] = process.argv.slice(2);
if (!backup || !dest) {
  console.error("Usage: npm run restore -- <backup-file> <new-db-file>");
  console.error("This never overwrites the live GEO_LAB_DB. Point GEO_LAB_DB at the new file and restart.");
  process.exit(1);
}
const result = restoreDatabase(backup, dest);
console.log(`restored: ${result.path} (integrity ${result.integrity})`);

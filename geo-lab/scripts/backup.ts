import { backupDatabase } from "../src/lib/backup";

const dest = process.argv[2];
if (!dest) {
  console.error("Usage: npm run backup -- data/backups/geo-lab.db");
  process.exit(1);
}
const result = backupDatabase(dest);
console.log(`backup written: ${result.path} (${result.bytes} bytes)`);

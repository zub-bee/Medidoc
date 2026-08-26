import main from "./seed.ts";

try {
  await main();
} catch (err) {
  console.error("Seeding failed:", err);
  process.exit(1);
}

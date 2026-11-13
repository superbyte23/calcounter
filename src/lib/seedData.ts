import { storage } from "./storage";
import { SEED_FOODS, SEED_USER, seedDemoEntries, seedWeights, seedWater, seedPlans } from "./seed";

export function seedAll() {
  // Users
  const users = storage.getUsers();
  if (!users.some((u) => u.email === SEED_USER.email)) {
    users.push(SEED_USER);
    storage.setUsers(users);
  }
  // Food database
  if (storage.getFoods().length === 0) {
    storage.setFoods(SEED_FOODS);
  }
  // Demo entries, weights, water, plans for the demo user
  const demoId = SEED_USER.id;
  if (storage.getEntries().filter((e) => e.userId === demoId).length === 0) {
    storage.setEntries(seedDemoEntries(demoId));
  }
  if (storage.getWeights().filter((w) => w.userId === demoId).length === 0) {
    storage.setWeights(seedWeights(demoId));
  }
  if (storage.getWater().filter((w) => w.userId === demoId).length === 0) {
    storage.setWater(seedWater(demoId));
  }
  if (storage.getPlans().filter((p) => p.userId === demoId).length === 0) {
    storage.setPlans(seedPlans(demoId));
  }
}

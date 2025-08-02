export default class NPC {
  constructor(name, type, x, zone, img, maxHp = 100, defeated = false, respawnChance = 0.5) {
    Object.assign(this, { name, type, x, zone, img, maxHp, defeated, respawnChance });
    this.hp = maxHp;             // ✅ initialize with full HP
    this.respawnAt = null;       // ⏱ timestamp for delayed respawn
  }

  get isEnemy() {
    return this.type === 'enemy';
  }

  get isFriendly() {
    return this.type === 'friendly';
  }
}

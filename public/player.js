// public/player.js
export default class Player {
  /* ── core stats ─────────────────────── */
  maxHp = 200;
  hp    = 200;
  level    = 1;
  maxLevel = 110;
  xp       = 0;
  xpToNext = 100;        // first level-up at 100 xp
  gold = 10;

  /* ── bags & talents ─────────────────── */
  items   = [];
  talents = [];

  constructor(name = 'Artemis'){
    this.name = name;
  }

  /* ── helpers ────────────────────────── */
  addXp(amount){
    if (this.level >= this.maxLevel) return;
    this.xp += amount;

    while (this.xp >= this.xpToNext && this.level < this.maxLevel){
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.floor(this.xpToNext * 1.15);   // harder each time
    }
  }

  takeDamage(dmg){ this.hp  = Math.max(0, this.hp  - dmg); }
  heal(amount)    { this.hp  = Math.min(this.maxHp, this.hp + amount); }
  addGold(n)      { this.gold += n; }
  addItem(i)      { this.items.push(i); }
  addTalent(t)    { this.talents.push(t); }
}

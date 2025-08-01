export default class NPC {
  constructor(name, type, x, zone, img) {
    Object.assign(this, { name, type, x, zone, img });
  }

  get isEnemy() {
    return this.type === 'enemy';
  }

  get isFriendly() {
    return this.type === 'friendly';
  }
}

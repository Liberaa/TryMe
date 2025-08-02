/* public/script.js – loaded with type="module" */
import Player from './player.js';
import NPC from './npc.js';

export const hero = new Player('Artemis');

/* UI refs */
const hpBar   = document.querySelector('#hud .hp span');
const xpBar   = document.querySelector('#hud .xp span');
const xpLbl   = document.getElementById('xp-label');
const lvlLbl  = document.getElementById('lvl');
const hpLabel = document.getElementById('hp-label');

const goldSpan = document.getElementById('gold');
const bagGrid  = document.getElementById('bag-grid');
const bagBtn   = document.getElementById('bag-btn');
const bagWin   = document.getElementById('bag-window');

const talentBtn  = document.getElementById('talent-btn');
const talentWin  = document.getElementById('talent-window');
const talentList = document.getElementById('talent-list');

const hambBtn   = document.getElementById('hamburger');
const sidePanel = document.getElementById('side-panel');

bagBtn.addEventListener   ('click', () => bagWin.classList.toggle('open'));
talentBtn.addEventListener('click', () => talentWin.classList.toggle('open'));
hambBtn.addEventListener  ('click', () => sidePanel.classList.toggle('open'));

function drawHUD() {
  hpBar.style.width = (hero.hp / hero.maxHp) * 100 + '%';
  hpLabel.textContent = `${hero.hp}/${hero.maxHp}`;

  xpBar.style.width = (hero.xp / hero.xpToNext) * 100 + '%';
  xpLbl.textContent = `${hero.xp}/${hero.xpToNext}`;

  lvlLbl.textContent = `Lv ${hero.level}`;
  goldSpan.textContent = hero.gold;

  const BAG_SIZE = 24;
  bagGrid.innerHTML = Array.from({ length: BAG_SIZE }, (_, i) => {
    const item = hero.items[i];
    if (!item) return '<div class="slot empty"></div>';
    const icon = item.icon ?? item.name[0];
    return `<div class="slot">${icon}</div>`;
  }).join('');

  talentList.innerHTML = hero.talents.map(t => `<li>${t}</li>`).join('');
}
drawHUD();

/* ── Zones and NPCs ── */
const gameArea  = document.getElementById('game-area');
const wrapper   = document.getElementById('character-wrapper');
const sprite    = document.getElementById('character');
const SPRITE_W  = 65;
const AREA_W    = 950;
const SPEED     = 480;

const zones = [
  { backgroundImage: 'url(assets/bg.png)' },
  { backgroundImage: 'url(assets/bg1.png)' },
  { backgroundImage: 'url(assets/bg2.png)' },
  { backgroundImage: 'url(assets/bg3.png)' },
    { backgroundImage: 'url(assets/bg4.png)' }

];
let zone = 0;

const npcs = [
  new NPC('Boblin', 'friendly', 300, 0, 'assets/friendly.png'),
  new NPC('Kukas', 'friendly', 600, 0, 'assets/friendly.png'),
  new NPC('Merchant', 'enemy', 200, 1, 'assets/enemy.png', 320, false, 0.01), // 50% spawn chance
  new NPC('Merchant', 'enemy', 500, 1, 'assets/enemy.png', 120, false, 0.01), // 20% spawn chance
  new NPC('BOB', 'friendly', 450, 2, 'assets/friendly.png'),
    new NPC('Merchant', 'enemy', 500, 4, 'assets/boss.png', 720, false, 0.01), // 20% spawn chance

];


const npcContainer = document.createElement('div');
npcContainer.id = 'npc-container';
gameArea.appendChild(npcContainer);

function paintZone() {
  gameArea.style.background = zones[zone].backgroundImage;
  gameArea.style.backgroundSize = 'cover';
  drawNPCs();
}

function drawNPCs() {
  npcContainer.innerHTML = '';

  for (const npc of npcs.filter(n => n.zone === zone)) {
    // Skip defeated enemies unless they respawn
    if (npc.isEnemy && npc.defeated) {
      const chance = npc.respawnChance ?? 0.5; // default 50% chance
      if (Math.random() >= chance) continue;
      npc.defeated = false;
    }

    const el = document.createElement('div');
    el.className = `npc ${npc.type}`;
    el.style.left = npc.x + 'px';
    el.innerHTML = `<img src="${npc.img}" /><div class="name">${npc.name}</div>`;
    npcContainer.appendChild(el);
  }
}
paintZone();

/* ── Movement ── */
let x = 100, leftHeld = false, rightHeld = false;

document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'a' || k === 'arrowleft')  { leftHeld = true;  sprite.classList.add('face-left'); }
  if (k === 'd' || k === 'arrowright') { rightHeld = true; sprite.classList.remove('face-left'); }
});
document.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (k === 'a' || k === 'arrowleft')  leftHeld = false;
  if (k === 'd' || k === 'arrowright') rightHeld = false;
});

let lastT = performance.now();
function loop(t) {
  const dt = (t - lastT) / 1000; lastT = t;

  let nx = x;
  if (leftHeld)  nx -= SPEED * dt;
  if (rightHeld) nx += SPEED * dt;

  if (nx < 0) {
    if (zone > 0) { zone--; paintZone(); nx = AREA_W - SPRITE_W; }
    else nx = 0;
  }
  if (nx + SPRITE_W > AREA_W) {
    if (zone < zones.length - 1) { zone++; paintZone(); nx = 0; }
    else nx = AREA_W - SPRITE_W;
  }

x = nx;

for (const npc of npcs) {
  if (
    npc.zone === zone &&
    npc.type === 'enemy' &&
    !npc.defeated &&
    Math.abs(npc.x - x) < 60
  ) {
    startBattle(npc);
    return;
  }
}

  wrapper.style.transform = `translateX(${x}px)`;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ── Battle ── */
let currentEnemy = null;

function startBattle(npc) {
  if (!('hp' in npc)) npc.hp = npc.maxHp;

  currentEnemy = {
    ...npc,
    ref: npc,
    hp: npc.hp,
    maxHp: npc.maxHp
  };

  // Portrait icons (top-left/top-right)
  document.getElementById('battle-enemy-img').src = npc.img || 'assets/enemy.png';
  document.getElementById('battle-hero-img').src  = 'assets/player.png';

  // Full-body sprites (center of scene)
  document.getElementById('battle-enemy-sprite').src = npc.img || 'assets/enemy.png';
  document.getElementById('battle-hero-sprite').src  = 'assets/player.png';

  gameArea.style.display = 'none';
  document.getElementById('battle-scene').classList.add('visible');

  updateBattleUI();
}


function updateBattleUI() {
  document.getElementById('battle-hero-hp').textContent = `${hero.hp}/${hero.maxHp}`;
  document.getElementById('battle-hero-hp-bar').style.width = (hero.hp / hero.maxHp * 100) + '%';

  document.getElementById('battle-enemy-hp').textContent = `${currentEnemy.name}: ${currentEnemy.hp}/${currentEnemy.maxHp}`;
  document.getElementById('battle-enemy-hp-bar').style.width = (currentEnemy.hp / currentEnemy.maxHp * 100) + '%';
}

function showDamagePopup(amount) {
  const popup = document.getElementById('damage-popup');
  popup.textContent = `-${amount}`;
  popup.classList.remove('hidden');
  popup.style.animation = 'none'; // reset animation
  void popup.offsetWidth;         // force reflow
  popup.style.animation = '';     // restart animation

  setTimeout(() => {
    popup.classList.add('hidden');
  }, 600);
}

function showHeroDamagePopup(amount) {
  const popup = document.getElementById('hero-damage-popup');
  popup.textContent = `-${amount}`;
  popup.classList.remove('hidden');
  popup.style.animation = 'none';
  void popup.offsetWidth;
  popup.style.animation = '';
  setTimeout(() => {
    popup.classList.add('hidden');
  }, 600);
}


window.attackEnemy = () => {
  const heroSprite  = document.getElementById('battle-hero-sprite');
  const enemySprite = document.getElementById('battle-enemy-sprite');

  // Hero attack
  currentEnemy.hp -= 30;
  heroSprite.classList.add('attack');
  showDamagePopup(30);
  setTimeout(() => heroSprite.classList.remove('attack'), 250);

  // Delay enemy retaliation
  setTimeout(() => {
    hero.takeDamage(15);
    enemySprite.classList.add('attack');
    showHeroDamagePopup(15);
    updateBattleUI();

    setTimeout(() => enemySprite.classList.remove('attack'), 250);

    // Only check for death after UI updates
    if (currentEnemy.hp <= 0) return endBattle(true);
    if (hero.hp <= 0) return endBattle(false);
  }, 300);
};



window.fleeBattle = () => endBattle(false);

function endBattle(won) {
  const battleEl = document.getElementById('battle-scene');
  battleEl.classList.remove('visible');
  gameArea.style.display = 'block';

  if (won) {
    hero.addXp(50);
    hero.addGold(20);

    // Mark the enemy as defeated
    if (currentEnemy.ref) {
      currentEnemy.ref.defeated = true;
    }
  } else {
    zone = 0;
    x = 100;
    hero.hp = hero.maxHp;
    paintZone();
  }

  currentEnemy = null;
drawHUD();
paintZone(); // 🔁 redraw to hide defeated NPC
requestAnimationFrame(loop);

}


/* ── Dev shortcut ── */
document.addEventListener('keypress', e => {
  if (e.key === 'k') {
    hero.addXp(20);
    hero.addGold(5);
    drawHUD();
  }
});



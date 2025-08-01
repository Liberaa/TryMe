/* public/script.js  – loaded with type="module" */
import Player from './player.js';
import NPC from './npc.js';

/* ──────────────────────────────
   1.  Boot hero & UI handles
──────────────────────────────── */
export const hero = new Player('Artemis');

/* bars & labels */
const hpBar   = document.querySelector('#hud .hp span');
const xpBar   = document.querySelector('#hud .xp span');
const xpLbl   = document.getElementById('xp-label');
const lvlLbl  = document.getElementById('lvl');
const hpLabel = document.getElementById('hp-label');

/* bag elements */
const goldSpan = document.getElementById('gold');
const bagGrid  = document.getElementById('bag-grid');
const bagBtn   = document.getElementById('bag-btn');
const bagWin   = document.getElementById('bag-window');

/* NPC */
const npcs = [
  new NPC('Boblin', 'friendly', 300, 0, 'assets/friendly.png'),
    new NPC('Kukas', 'friendly', 600, 0, 'assets/friendly.png'),
  new NPC('Merchant', 'enemy', 200, 1, 'assets/enemy.png'),
    new NPC('Merchant', 'enemy', 500, 1, 'assets/enemy.png'),
    new NPC('BOB', 'friendly', 450, 2, 'assets/friendly.png'),

  // Add more as needed
];

/* talents elements */
const talentBtn  = document.getElementById('talent-btn');
const talentWin  = document.getElementById('talent-window');
const talentList = document.getElementById('talent-list');

/* hamburger */
const hambBtn   = document.getElementById('hamburger');
const sidePanel = document.getElementById('side-panel');

/* simple toggles */
bagBtn.addEventListener   ('click', () => bagWin.classList.toggle('open'));
talentBtn.addEventListener('click', () => talentWin.classList.toggle('open'));
hambBtn.addEventListener  ('click', () => sidePanel.classList.toggle('open'));

/* ──────────────────────────────
   2.  Redraw HUD & panels
──────────────────────────────── */
function drawHUD(){
  /* HP */
  hpBar.style.width = (hero.hp/hero.maxHp)*100 + '%';
    hpLabel.textContent = `${hero.hp}/${hero.maxHp}`;    // ⬅️ centre overlay


  /* XP */
  xpBar.style.width = (hero.xp/hero.xpToNext)*100 + '%';
  xpLbl.textContent = `${hero.xp}/${hero.xpToNext}`;

  /* Level & gold */
  lvlLbl.textContent = `Lv ${hero.level}`;
  goldSpan.textContent = hero.gold;

  /* Bag slots (6×4) */
  const BAG_SIZE = 24;
  bagGrid.innerHTML = Array.from({length:BAG_SIZE}, (_,i)=>{
    const item = hero.items[i];
    if(!item) return '<div class="slot empty"></div>';
    const icon = item.icon ?? item.name[0];
    return `<div class="slot">${icon}</div>`;
  }).join('');

  /* Talents */
  talentList.innerHTML = hero.talents.map(t=>`<li>${t}</li>`).join('');
}
drawHUD();

/* ──────────────────────────────
   3.  Movement & zones
──────────────────────────────── */
const wrapper   = document.getElementById('character-wrapper');
const sprite    = document.getElementById('character');
const gameArea  = document.getElementById('game-area');

const SPRITE_W  = 65;
const AREA_W    = 950;
const SPEED     = 480;

const zones = [
  { backgroundImage: 'url(assets/bg.png)' },
  { backgroundImage: 'url(assets/bg1.png)' },
  { backgroundImage: 'url(assets/bg2.png)' },
  { backgroundImage: 'url(assets/bg3.png)' }
];
let zone = 0;

const npcContainer = document.createElement('div');
npcContainer.id = 'npc-container';
gameArea.appendChild(npcContainer);

const paintZone = () => {
  gameArea.style.background = '';
  gameArea.style.backgroundImage = zones[zone].backgroundImage;
  gameArea.style.backgroundSize = 'cover'; // optional
    drawNPCs();
};
paintZone();



function drawNPCs() {
  npcContainer.innerHTML = '';
  for (const npc of npcs.filter(n => n.zone === zone)) {
    const el = document.createElement('div');
    el.className = `npc ${npc.type}`;
    el.style.left = npc.x + 'px';
    el.innerHTML = `<img src="${npc.img}" /><div class="name">${npc.name}</div>`;
    npcContainer.appendChild(el);
  }
}


let x=100, leftHeld=false, rightHeld=false;

document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(k==='a'||k==='arrowleft'){leftHeld=true; sprite.classList.add('face-left');}
  if(k==='d'||k==='arrowright'){rightHeld=true;sprite.classList.remove('face-left');}
});
document.addEventListener('keyup',e=>{
  const k=e.key.toLowerCase();
  if(k==='a'||k==='arrowleft') leftHeld=false;
  if(k==='d'||k==='arrowright') rightHeld=false;
});

let lastT=performance.now();
function loop(t){
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

  // 🔻 Check for enemy NPC collision
  for (const npc of npcs) {
    if (npc.zone === zone && npc.type === 'enemy' && Math.abs(npc.x - nx) < 60) {
      startBattle(npc);
      return; // Pause movement loop
    }
  }

  x = nx;
  wrapper.style.transform = `translateX(${x}px)`;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);


let currentEnemy = null;

function startBattle(npc) {
  currentEnemy = { ...npc, hp: 100 };

  // Hide overworld scene
  gameArea.style.display = 'none';

  // Show battle scene
  const battleEl = document.getElementById('battle-scene');
  battleEl.classList.add('visible');

  updateBattleUI();
}

function updateBattleUI() {
  document.getElementById('battle-hero-hp').textContent = `${hero.hp}/${hero.maxHp}`;
  document.getElementById('battle-hero-hp-bar').style.width = (hero.hp / hero.maxHp * 100) + '%';

  document.getElementById('battle-enemy-hp').textContent = `${currentEnemy.name}: ${currentEnemy.hp}/100`;
  document.getElementById('battle-enemy-hp-bar').style.width = (currentEnemy.hp / 100 * 100) + '%';
}


window.attackEnemy = () => {
  currentEnemy.hp -= 30;
  hero.takeDamage(15);

  if (currentEnemy.hp <= 0) return endBattle(true);
  if (hero.hp <= 0) return endBattle(false);

  updateBattleUI();
};

window.fleeBattle = () => {
  endBattle(false);
};


function endBattle(won) {
  const battleEl = document.getElementById('battle-scene');

  // Hide battle, show overworld again
  battleEl.classList.remove('visible');
  gameArea.style.display = 'block';

  if (won) {
    hero.addXp(50);
    hero.addGold(20);

    // Remove defeated enemy if still in list
    const i = npcs.indexOf(currentEnemy);
    if (i !== -1) npcs.splice(i, 1);
  } else {
    zone = 0;
    x = 100;
    hero.hp = hero.maxHp;
    paintZone();
  }

  drawHUD();
  requestAnimationFrame(loop);
}




/* ──────────────────────────────
   4.  Demo: press “k” → +20 XP, +5 Gold
──────────────────────────────── */
document.addEventListener('keypress',e=>{
  if(e.key==='k'){
    hero.addXp(20);
    hero.addGold(5);
    drawHUD();
  }
});

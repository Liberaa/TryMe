/* public/script.js  – loaded with type="module" */
import Player from './player.js';

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
const SPEED     = 280;

const zones = [
  { background:'#444' },
  { background:'#225' },
  { background:'#175e3a' },
  { background:'#641414'}
];
let zone = 0;
const paintZone = () => gameArea.style.background = zones[zone].background;
paintZone();

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
  const dt=(t-lastT)/1000; lastT=t;

  let nx=x;
  if(leftHeld)  nx-=SPEED*dt;
  if(rightHeld) nx+=SPEED*dt;

  if(nx<0){
    if(zone>0){zone--;paintZone();nx=AREA_W-SPRITE_W;}else nx=0;
  }
  if(nx+SPRITE_W>AREA_W){
    if(zone<zones.length-1){zone++;paintZone();nx=0;}else nx=AREA_W-SPRITE_W;
  }

  x=nx;
  wrapper.style.transform=`translateX(${x}px)`;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

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

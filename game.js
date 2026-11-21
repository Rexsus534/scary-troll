import * as THREE from "three";
import { Player } from "./player.js";
import { TrollWorld } from "./enemies.js";
import { EventDirector } from "./events.js";
import { SoundFX } from "./sounds.js";

const canvas = document.querySelector("#view");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08090e);
scene.fog = new THREE.FogExp2(0x08090e, 0.035);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 90);
const renderer = new THREE.WebGLRenderer({canvas, antialias:false, powerPreference:"low-power"});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const clock = new THREE.Clock();
const sound = new SoundFX();
const world = new TrollWorld(scene);
const player = new Player(camera, canvas, scene);
const director = new EventDirector(scene, sound, showToast, showSubtitle, flash);
let running = false, keys = 0, gameOver = false, near = null, elapsed = 0;
const keyObjects = [];
const interactables = [];

function mat(color, roughness=1){ return new THREE.MeshStandardMaterial({color,roughness}); }
function addBox(x,y,z,sx,sy,sz,material, opts={}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), material);
  mesh.position.set(x,y,z); mesh.castShadow=false; mesh.receiveShadow=false;
  if(opts.rotationY) mesh.rotation.y=opts.rotationY;
  scene.add(mesh); return mesh;
}
function buildRoom(){
  const floor=mat(0x29282a), wall=mat(0x393337), dark=mat(0x151419), wood=mat(0x493126), trim=mat(0x211b1a);
  addBox(0,-.18,0,25,.35,25,floor);
  // perimeter walls and interior partitions, with walkable door gaps
  addBox(0,2,-12.5,25,4,.35,wall); addBox(0,2,12.5,25,4,.35,wall);
  addBox(-12.5,2,0,.35,4,25,wall); addBox(12.5,2,0,.35,4,25,wall);
  addBox(-5,2,-5,.35,4,15,wall); addBox(5,2,4,.35,4,17,wall);
  addBox(0,2,2,10,4,.35,wall);
  addBox(-8,2,5,5,4,.35,wall); addBox(8,2,-5,5,4,.35,wall);
  // ceiling beams and scattered furniture
  for(let x=-10;x<=10;x+=5) addBox(x,3.85,0,.12,.18,24,trim);
  addBox(-8,.55,-8,2.6,1.1,1.3,wood); addBox(8,.45,8,2.8,.9,1.5,wood);
  addBox(8,1.2,-8,1.3,2.4,1.1,dark); addBox(-8,.8,8,1.4,1.6,1.1,dark);
  // ominous lamps
  for(const [x,z] of [[-9,-9],[0,-9],[9,-9],[-9,0],[0,0],[9,0],[-9,9],[0,9],[9,9]]){
    const bulb=new THREE.PointLight(0xffc58a, 8, 8, 2); bulb.position.set(x,3.2,z); scene.add(bulb);
    addBox(x,3.78,z,.35,.12,.35,mat(0x65513c));
  }
  // exit door and key objects
  const door=addBox(0,1.25,12.25,2.5,2.5,.22,mat(0x593323));
  const knob=addBox(.8,1.2,12.08,.12,.12,.12,mat(0xc99b4c));
  interactables.push({mesh:door, label:"Çıkış kapısı", action:()=>{
    if(keys>=3){ winGame(); } else { showToast(`Kapı kilitli! ${3-keys} anahtar daha lazım.`); sound.nope(); }
  }});
  const positions=[[-9,0,-9],[9,0,2],[0,0,9]];
  positions.forEach((p,i)=>{
    const group=new THREE.Group();
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.22,.065,8,16),mat(0xffd45e));
    ring.rotation.x=Math.PI/2; group.add(ring);
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.48,8),mat(0xffd45e));
    stem.rotation.z=Math.PI/2; group.add(stem);
    group.position.set(p[0],.75,p[2]); scene.add(group);
    keyObjects.push({group, collected:false});
    interactables.push({mesh:group, label:"Anahtarı al", action:()=>{
      const item=keyObjects[i]; if(item.collected)return;
      item.collected=true; scene.remove(item.group); keys++;
      document.querySelector("#keyCount").textContent=`${keys}/3`;
      showToast(["Bir anahtar buldun!","Anahtar sende. Ev bunu fark etti…","Son anahtar! Artık kaçabilirsin."][keys-1]);
      sound.pickup(); if(keys===3) document.querySelector("#objective").textContent="Görev: Çıkış kapısına git!";
    }});
  });
  // little comic props
  const chair=addBox(-2,.55,-8,.7,1.1,.7,wood); chair.rotation.y=.5;
  const rug=addBox(0,.015,0,4,.03,3,mat(0x4b2025));
}
function showToast(text){
  const el=document.querySelector("#toast"); el.textContent=text; el.classList.add("show");
  clearTimeout(showToast.t); showToast.t=setTimeout(()=>el.classList.remove("show"),2400);
}
function showSubtitle(text){
  const el=document.querySelector("#subtitle"); el.textContent=text; el.classList.add("show");
  clearTimeout(showSubtitle.t); showSubtitle.t=setTimeout(()=>el.classList.remove("show"),2600);
}
function flash(){const f=document.querySelector("#flash");f.classList.remove("active");void f.offsetWidth;f.classList.add("active");}
function winGame(){gameOver=true;running=false;document.exitPointerLock?.();document.querySelector("#endEyebrow").textContent="BAŞARDIN";document.querySelector("#endTitle").textContent="KURTULDUN!";document.querySelector("#endText").textContent="Kapıdan çıktın… ama arkandan biri 'Daha yeni başlıyorduk' diye bağırdı.";document.querySelector("#endScreen").classList.remove("hidden");sound.win();}
function loseGame(){gameOver=true;running=false;document.exitPointerLock?.();document.querySelector("#endEyebrow").textContent="YAKALANDIN";document.querySelector("#endTitle").textContent="OYUN BİTTİ";document.querySelector("#endText").textContent="Canavar seni yakaladı. Bir dahaki sefere daha az gürültü yap!";document.querySelector("#endScreen").classList.remove("hidden");sound.scare();}
function restart(){location.reload();}

buildRoom();
world.spawn();
player.setPosition(0,0,10.5);

function start(){
  document.querySelector("#startScreen").classList.add("hidden");
  running=true; sound.init(); sound.ambience();
  if(matchMedia("(pointer:fine)").matches) canvas.requestPointerLock?.();
  showToast("Fenerin titriyor. Harika, daha oyun başlamadan bozuldu.");
}
document.querySelector("#startBtn").addEventListener("click",start);
document.querySelector("#restartBtn").addEventListener("click",restart);
document.addEventListener("pointerlockchange",()=>{ if(document.pointerLockElement!==canvas && running && matchMedia("(pointer:fine)").matches){ /* pause look only */ }});
document.addEventListener("keydown",e=>{if(e.code==="KeyE" && running) interact(); if(e.code==="Escape" && running){showToast("Kaçış yok. Menüye dönmek için sayfayı yenile.");}});
document.querySelector("#useBtn").addEventListener("pointerdown",e=>{e.preventDefault();if(running)interact();});
function interact(){
  if(!near)return;
  near.action(); near=null; document.querySelector("#interaction").classList.remove("show");
}
function findNearby(){
  near=null; let best=2.15;
  for(const item of interactables){
    if(item.mesh.parent===null) continue;
    const pos=new THREE.Vector3(); item.mesh.getWorldPosition(pos);
    const d=player.position.distanceTo(pos);
    if(d<best){best=d;near=item;}
  }
  const ui=document.querySelector("#interaction");
  if(near){ui.textContent=`E — ${near.label}`;ui.classList.add("show");} else ui.classList.remove("show");
}
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.04);
  if(running && !gameOver){
    elapsed+=dt;
    player.update(dt);
    findNearby();
    world.update(dt,player.position,loseGame);
    director.update(dt,elapsed,player.position,world);
    keyObjects.forEach(k=>{if(!k.collected){k.group.rotation.y+=dt*1.4;k.group.position.y=.75+Math.sin(elapsed*2)*.08;}});
  }
  renderer.render(scene,camera);
}
animate();

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
});

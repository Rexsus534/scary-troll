import * as THREE from "three";

const standard = (color, roughness=.9, metalness=0) =>
  new THREE.MeshStandardMaterial({color, roughness, metalness});
function part(parent, geometry, material, position, scale=null, rotation=null){
  const m=new THREE.Mesh(geometry,material);m.position.set(...position);
  if(scale)m.scale.set(...scale);if(rotation)m.rotation.set(...rotation);
  m.castShadow=false;m.receiveShadow=false;parent.add(m);return m;
}
function makeMonster(){
  const g=new THREE.Group();
  const hide=standard(0x17151b), bone=standard(0xb9b0a1), dark=standard(0x080609), red=new THREE.MeshBasicMaterial({color:0xff101c});
  // hunched torso and long limbs
  part(g,new THREE.CapsuleGeometry(.43,.95,5,10),hide,[0,1.2,0],[1.15,1.12,.78],[.18,0,-.12]);
  part(g,new THREE.SphereGeometry(.47,12,10),hide,[0,2.05,.12],[.9,1.12,.82],[.25,0,0]);
  const head=new THREE.Group();head.position.set(0,2.65,.18);g.add(head);
  part(head,new THREE.SphereGeometry(.43,16,12),hide,[0,0,0],[1.05,1.22,.92],[.18,0,0]);
  // split jaw / open mouth cavity
  part(head,new THREE.SphereGeometry(.3,12,10),dark,[0,-.22,.32],[.85,.9,.35]);
  part(head,new THREE.BoxGeometry(.56,.09,.08),bone,[0,-.03,.61]);
  for(let i=0;i<7;i++){
    const x=-.24+i*.08;
    part(head,new THREE.ConeGeometry(.045,.17,5),bone,[x,-.11,.63],[1,1,1],[Math.PI,0,0]);
    part(head,new THREE.ConeGeometry(.04,.14,5),bone,[x,-.36,.63]);
  }
  for(const x of [-.19,.19]){
    part(head,new THREE.SphereGeometry(.09,10,8),red,[x,.09,.39],[1,1,.5]);
    part(head,new THREE.SphereGeometry(.035,8,8),dark,[x,.09,.43]);
    // cheek spikes
    for(let j=0;j<2;j++)part(head,new THREE.ConeGeometry(.09,.32,5),hide,[x*2,-.05-j*.18,.05],[1,1,1],[0,0,x>0?-.8:.8]);
  }
  // horns
  for(const x of [-.28,.28])part(head,new THREE.ConeGeometry(.13,.62,7),hide,[x,.55,-.02],[1,1,1],[0,0,x>0?-.35:.35]);
  // arms with elbows and claws
  for(const side of [-1,1]){
    const arm=part(g,new THREE.CapsuleGeometry(.15,.82,4,7),hide,[side*.58,1.35,.03],[1,1,1],[0,0,side*-.22]);
    part(g,new THREE.SphereGeometry(.2,8,8),hide,[side*.77,.72,.12],[1.1,1.3,.9]);
    for(let k=0;k<4;k++){
      const x=side*.77+(k-1.5)*.095;
      part(g,new THREE.ConeGeometry(.045,.25,5),bone,[x,.53,.23],[1,1,1],[Math.PI*.85,0,0]);
    }
  }
  // crooked legs
  for(const side of [-1,1]){
    part(g,new THREE.CapsuleGeometry(.19,.68,4,7),hide,[side*.24,.42,0],[1,1,1],[0,0,side*.12]);
    part(g,new THREE.BoxGeometry(.35,.16,.56),hide,[side*.25,.08,.13]);
  }
  g.userData.head=head;
  return g;
}
function makeJester(){
  const g=new THREE.Group(), green=standard(0x267746), skin=standard(0xb98f79), cloth=standard(0x4c1725);
  part(g,new THREE.CapsuleGeometry(.32,.72,4,8),cloth,[0,.8,0]);
  part(g,new THREE.SphereGeometry(.31,12,10),skin,[0,1.55,.03]);
  for(const x of [-.11,.11])part(g,new THREE.SphereGeometry(.045,8,8),new THREE.MeshBasicMaterial({color:0x090909}),[x,1.61,.29]);
  part(g,new THREE.BoxGeometry(.17,.045,.025),new THREE.MeshBasicMaterial({color:0x5d1010}),[0,1.43,.31]);
  const hat=part(g,new THREE.ConeGeometry(.42,.75,8),standard(0xd8ad2c),[0,2.1,0]);
  part(g,new THREE.SphereGeometry(.09,8,8),standard(0xf1d46b),[0,2.48,0]);
  g.userData.jester=true;return g;
}
export class TrollWorld{
  constructor(scene){this.scene=scene;this.monster=null;this.joker=null;this.time=0;this.hitCooldown=0;this.monsterActive=false;this.lastCatch=0;}
  spawn(){
    this.monster=makeMonster();this.monster.position.set(-9,0,-9);this.scene.add(this.monster);
    this.joker=makeJester();this.joker.position.set(8,0,-8);this.scene.add(this.joker);
  }
  update(dt,pos,onCaught){
    this.time+=dt;this.hitCooldown=Math.max(0,this.hitCooldown-dt);
    if(this.joker){
      this.joker.position.x=8+Math.sin(this.time*.55)*1.2;
      this.joker.position.z=-8+Math.cos(this.time*.55)*.8;
      this.joker.rotation.y=Math.sin(this.time*.8)*.5;
    }
    if(this.time>20)this.monsterActive=true;
    if(this.monsterActive&&this.monster){
      const dx=pos.x-this.monster.position.x,dz=pos.z-this.monster.position.z,d=Math.hypot(dx,dz);
      const speed=d<6?2.8:1.35;
      if(d>.8){this.monster.position.x+=dx/d*speed*dt;this.monster.position.z+=dz/d*speed*dt;}
      this.monster.rotation.y=Math.atan2(dx,dz);
      this.monster.position.y=Math.abs(Math.sin(this.time*7))*.055;
      if(d<1.55&&this.hitCooldown===0){this.hitCooldown=5;onCaught(this.monster);}
    }
  }
  prank(){
    if(!this.joker)return;
    this.joker.position.set(0,0,-2.4);this.joker.rotation.y=Math.PI;
  }
  scareModel(){return makeMonster();}
}

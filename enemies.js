import * as THREE from "three";
export class TrollWorld{
  constructor(scene){this.scene=scene;this.monster=null;this.joker=null;this.monsterActive=false;this.time=0;this.hitCooldown=0;}
  makeCharacter(color,scale=1){
    const g=new THREE.Group(),body=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.75,4,8),new THREE.MeshStandardMaterial({color,roughness:.9}));
    body.position.y=.9;g.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),new THREE.MeshStandardMaterial({color:0xd9b49b}));
    head.position.y=1.65;g.add(head);
    const eyeMat=new THREE.MeshBasicMaterial({color:0x090909});
    for(const x of [-.12,.12]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.045,8,8),eyeMat);eye.position.set(x,1.7,.29);g.add(eye);}
    const mouth=new THREE.Mesh(new THREE.BoxGeometry(.18,.045,.025),new THREE.MeshBasicMaterial({color:0x5d1010}));mouth.position.set(0,1.48,.32);g.add(mouth);
    g.scale.setScalar(scale);return g;
  }
  spawn(){
    this.monster=this.makeCharacter(0x24202c,1.15);this.monster.position.set(-9,0,-9);this.scene.add(this.monster);
    this.joker=this.makeCharacter(0x3a9b58,.95);this.joker.position.set(8,0,-8);this.scene.add(this.joker);
    // silly oversized hat on troll
    const hat=new THREE.Mesh(new THREE.ConeGeometry(.42,.55,8),new THREE.MeshStandardMaterial({color:0xe4c13c}));hat.position.y=2.25;this.joker.add(hat);
  }
  update(dt,pos,onCaught){
    this.time+=dt;this.hitCooldown=Math.max(0,this.hitCooldown-dt);
    if(this.joker){
      this.joker.position.x=8+Math.sin(this.time*.7)*1.2;
      this.joker.position.z=-8+Math.cos(this.time*.7)*.8;
      this.joker.rotation.y=Math.sin(this.time)*.5;
    }
    if(this.time>17)this.monsterActive=true;
    if(this.monsterActive&&this.monster){
      const dx=pos.x-this.monster.position.x,dz=pos.z-this.monster.position.z,d=Math.hypot(dx,dz);
      const speed=d<5?2.5:1.35;
      if(d>.7){this.monster.position.x+=dx/d*speed*dt;this.monster.position.z+=dz/d*speed*dt;}
      this.monster.rotation.y=Math.atan2(dx,dz);
      this.monster.position.y=Math.abs(Math.sin(this.time*8))*.08;
      if(d<1.05&&this.hitCooldown===0){this.hitCooldown=2;onCaught();}
    }
  }
  prank(){
    if(!this.joker)return;
    this.joker.position.set(0,0,-2);
    this.joker.rotation.y=Math.PI;
  }
}

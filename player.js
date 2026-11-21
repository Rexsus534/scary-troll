import * as THREE from "three";
export class Player{
  constructor(camera,canvas,scene){
    this.camera=camera;this.canvas=canvas;this.scene=scene;this.position=new THREE.Vector3(0,0,10.5);
    this.yaw=Math.PI;this.pitch=0;this.keys={};this.move=new THREE.Vector2();this.running=false;this.mobileLook=null;
    this.camera.position.set(0,1.65,10.5);this.camera.rotation.order="YXZ";
    addEventListener("keydown",e=>this.keys[e.code]=true);
    addEventListener("keyup",e=>this.keys[e.code]=false);
    canvas.addEventListener("click",()=>{if(document.querySelector("#startScreen").classList.contains("hidden")&&matchMedia("(pointer:fine)").matches)canvas.requestPointerLock?.();});
    document.addEventListener("mousemove",e=>{if(document.pointerLockElement===canvas){this.yaw-=e.movementX*.0022;this.pitch-=e.movementY*.0022;this.pitch=Math.max(-1.35,Math.min(1.35,this.pitch));}});
    this.setupTouch();
  }
  setPosition(x,y,z){this.position.set(x,y,z);}
  setupTouch(){
    const joy=document.querySelector("#joystick"),stick=document.querySelector("#stick"),run=document.querySelector("#runBtn");
    let active=false,origin={x:0,y:0};
    joy.addEventListener("pointerdown",e=>{active=true;joy.setPointerCapture(e.pointerId);const r=joy.getBoundingClientRect();origin={x:r.left+r.width/2,y:r.top+r.height/2};this.touchId=e.pointerId;});
    joy.addEventListener("pointermove",e=>{if(!active||e.pointerId!==this.touchId)return;let dx=e.clientX-origin.x,dy=e.clientY-origin.y;const len=Math.hypot(dx,dy),max=38;if(len>max){dx=dx/len*max;dy=dy/len*max;}stick.style.left=`calc(50% + ${dx}px)`;stick.style.top=`calc(50% + ${dy}px)`;this.move.set(dx/max,-dy/max);});
    const end=()=>{active=false;this.move.set(0,0);stick.style.left="50%";stick.style.top="50%";};
    joy.addEventListener("pointerup",end);joy.addEventListener("pointercancel",end);
    run.addEventListener("pointerdown",e=>{e.preventDefault();this.running=true;});run.addEventListener("pointerup",()=>this.running=false);run.addEventListener("pointercancel",()=>this.running=false);
    const view=document.querySelector("#view");let look=null;
    view.addEventListener("pointerdown",e=>{if(e.pointerType==="touch" && e.clientX>innerWidth*.35){look={x:e.clientX,y:e.clientY,id:e.pointerId};view.setPointerCapture(e.pointerId);}});
    view.addEventListener("pointermove",e=>{if(!look||e.pointerId!==look.id)return;this.yaw-=(e.clientX-look.x)*.006;this.pitch-=(e.clientY-look.y)*.006;this.pitch=Math.max(-1.25,Math.min(1.25,this.pitch));look={x:e.clientX,y:e.clientY,id:e.pointerId};});
    const stop=()=>look=null;view.addEventListener("pointerup",stop);view.addEventListener("pointercancel",stop);
  }
  update(dt){
    const forward=(this.keys.KeyW?1:0)-(this.keys.KeyS?1:0)+this.move.y;
    const side=(this.keys.KeyD?1:0)-(this.keys.KeyA?1:0)+this.move.x;
    const sprint=this.running||this.keys.ShiftLeft||this.keys.ShiftRight;
    const speed=sprint?5.1:3.15;
    const dir=new THREE.Vector3(Math.sin(this.yaw),0,Math.cos(this.yaw));
    const right=new THREE.Vector3(dir.z,0,-dir.x);
    const delta=dir.multiplyScalar(forward).add(right.multiplyScalar(side));
    if(delta.lengthSq()>1)delta.normalize();
    this.position.addScaledVector(delta,speed*dt);
    this.position.x=THREE.MathUtils.clamp(this.position.x,-11.7,11.7);
    this.position.z=THREE.MathUtils.clamp(this.position.z,-11.7,11.7);
    // simple wall collision around partitions
    const p=this.position;
    if(Math.abs(p.x+5)<.65 && p.z>-12 && p.z<2) p.x=Math.abs(p.x+5)<.65?(p.x<-5?-5.7:-4.3):p.x;
    if(Math.abs(p.x-5)<.65 && p.z>-4.5 && p.z<12) p.x=p.x<5?4.3:5.7;
    if(Math.abs(p.z-2)<.65 && p.x>-5 && p.x<5) p.z=p.z<2?1.3:2.7;
    this.camera.position.set(p.x,1.65,p.z);
    this.camera.rotation.set(this.pitch,this.yaw,0,"YXZ");
  }
}

import * as THREE from "three";
export class EventDirector{
  constructor(scene,sound,toast,subtitle,flash){this.scene=scene;this.sound=sound;this.toast=toast;this.subtitle=subtitle;this.flash=flash;this.next=8;this.events=0;this.fake=null;}
  update(dt,t,pos,world){
    if(t<this.next)return;
    this.next=t+12+Math.random()*12;this.events++;
    const r=Math.random();
    if(r<.22){this.toast("Bir şey arkanda hareket etti… Şaka şaka. Belki.");this.sound.creak();}
    else if(r<.43){this.flash();this.subtitle("EV SAHİBİ: AYAKKABILARINI ÇIKAR!");this.sound.sting();}
    else if(r<.62){this.toast("Sistem mesajı: Korku seviyesi güncelleniyor… %404");this.sound.pop();}
    else if(r<.82){world.prank();this.subtitle("TROLL: Pardon, yanlış odaymış.");this.sound.laugh();}
    else {this.toast("Bir kapı kendi kendine kapandı. Ev biraz alıngan.");this.sound.door();}
  }
}

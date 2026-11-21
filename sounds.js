export class SoundFX{
  constructor(){this.ctx=null;this.master=null;}
  init(){if(this.ctx)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=.22;this.master.connect(this.ctx.destination);}
  tone(freq,duration=.15,type="sine",volume=.3,slide=0){
    if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain(),now=this.ctx.currentTime;
    o.type=type;o.frequency.setValueAtTime(freq,now);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),now+duration);
    g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.001,now+duration);
    o.connect(g);g.connect(this.master);o.start(now);o.stop(now+duration);
  }
  ambience(){this.tone(48,2,"sine",.07,-8);}
  pickup(){this.tone(660,.12,"triangle",.22,220);setTimeout(()=>this.tone(880,.16,"triangle",.16,120),100);}
  nope(){this.tone(140,.25,"sawtooth",.15,-60);}
  creak(){this.tone(90,.7,"sawtooth",.1,-45);}
  sting(){this.tone(780,.35,"sawtooth",.25,-650);}
  pop(){this.tone(300,.08,"square",.15,400);}
  laugh(){this.tone(260,.12,"square",.15,150);setTimeout(()=>this.tone(330,.16,"square",.13,-100),150);}
  door(){this.tone(75,.5,"triangle",.2,-35);}
  scare(){this.tone(110,.8,"sawtooth",.35,700);}
  win(){this.tone(523,.18,"triangle",.2);setTimeout(()=>this.tone(659,.18,"triangle",.2),180);setTimeout(()=>this.tone(784,.3,"triangle",.2),360);}
}

export class SoundFX{
  constructor(){this.ctx=null;this.master=null;this.ambientOsc=null;}
  init(){if(this.ctx)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=.3;this.master.connect(this.ctx.destination);}
  tone(freq,duration=.15,type="sine",volume=.3,slide=0){
    if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain(),now=this.ctx.currentTime;
    o.type=type;o.frequency.setValueAtTime(freq,now);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),now+duration);
    g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.001,now+duration);
    o.connect(g);g.connect(this.master);o.start(now);o.stop(now+duration);
  }
  noise(duration=.5,volume=.2){
    if(!this.ctx)return;const n=this.ctx.createBufferSource(),len=Math.floor(this.ctx.sampleRate*duration),b=this.ctx.createBuffer(1,len,this.ctx.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
    n.buffer=b;const f=this.ctx.createBiquadFilter();f.type="lowpass";f.frequency.value=950;
    const g=this.ctx.createGain();g.gain.value=volume;n.connect(f);f.connect(g);g.connect(this.master);n.start();
  }
  ambience(){this.tone(43,3,"sine",.08,-4);setTimeout(()=>this.tone(57,2,"sine",.04,-8),1100);}
  pickup(){this.tone(660,.12,"triangle",.22,220);setTimeout(()=>this.tone(880,.16,"triangle",.16,120),100);}
  nope(){this.tone(140,.25,"sawtooth",.15,-60);}
  creak(){this.tone(90,.7,"sawtooth",.1,-45);this.noise(.45,.08);}
  sting(){this.tone(780,.35,"sawtooth",.25,-650);this.noise(.4,.16);}
  pop(){this.tone(300,.08,"square",.15,400);}
  laugh(){this.tone(260,.12,"square",.15,150);setTimeout(()=>this.tone(330,.16,"square",.13,-100),150);}
  door(){this.tone(75,.5,"triangle",.2,-35);this.noise(.25,.06);}
  scare(){this.tone(95,1.1,"sawtooth",.45,900);this.noise(.9,.45);setTimeout(()=>this.tone(48,.8,"square",.28,-20),120);}
  win(){this.tone(523,.18,"triangle",.2);setTimeout(()=>this.tone(659,.18,"triangle",.2),180);setTimeout(()=>this.tone(784,.3,"triangle",.2),360);}
}

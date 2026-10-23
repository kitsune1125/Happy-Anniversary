// Plays the included song on the first deliberate interaction. Browsers block autoplay.
(function () {
  'use strict';
  const btn=document.getElementById('musicBtn');
  const label=document.getElementById('musicLabel');
  let audio=null,ctx=null,master=null,interval=null,step=0,wasTouched=false,on=false;
  const tones=[523.25,659.25,783.99,659.25,587.33,783.99,880,783.99,523.25,659.25,783.99,1046.5,880,783.99,659.25,0];
  const bass=[130.81,130.81,146.83,146.83,110,110,98,98];
  function updateUI(){btn.setAttribute('aria-pressed',String(on));btn.setAttribute('aria-label',on?'Pause music':'Play music');label.textContent=on?'Pause our song':'Play our song'}
  function segmentStart(){return Math.max(0,Number(CONFIG.musicStart)||0)}
  function segmentEnd(){return Number(CONFIG.musicEnd)||0}
  function note(hz,t,duration,type,gain){if(!hz)return;const oscillator=ctx.createOscillator(),volume=ctx.createGain();oscillator.type=type;oscillator.frequency.value=hz;volume.gain.setValueAtTime(.0001,t);volume.gain.linearRampToValueAtTime(gain,t+.03);volume.gain.exponentialRampToValueAtTime(.0001,t+duration);oscillator.connect(volume);volume.connect(master);oscillator.start(t);oscillator.stop(t+duration+.05)}
  function tick(){const t=ctx.currentTime+.03,beat=.42;note(tones[step%tones.length],t,beat*1.8,'triangle',.16);if(step%2===0)note(bass[(step/2)%bass.length],t,beat*3.2,'sine',.12);step++}
  function fallbackStart(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC){on=false;updateUI();return;}if(!ctx){ctx=new AC();master=ctx.createGain();master.gain.value=.7;master.connect(ctx.destination)}ctx.resume();if(!interval){tick();interval=setInterval(tick,420)}on=true;updateUI()}
  function getAudio(){
    if(audio)return audio;
    audio=new Audio(CONFIG.musicFile);
    audio.preload='auto';audio.volume=Math.min(1,Math.max(0,Number(CONFIG.musicVolume) || .4));
    audio.addEventListener('loadedmetadata',()=>{if(audio.duration&&audio.currentTime<1&&segmentStart()<audio.duration)audio.currentTime=segmentStart()});
    audio.addEventListener('timeupdate',()=>{if(segmentEnd()>segmentStart()&&audio.currentTime>=segmentEnd()){audio.currentTime=segmentStart();if(on&&audio.paused)audio.play().catch(()=>{})}});
    audio.addEventListener('ended',()=>{audio.currentTime=segmentStart();if(on)audio.play().catch(()=>{on=false;updateUI()})});
    audio.addEventListener('error',()=>{on=false;updateUI();label.textContent='Music unavailable'});
    return audio;
  }
  function start(){
    wasTouched=true;
    if(CONFIG.musicFile){
      const song=getAudio();
      if(song.readyState>=1&&(song.ended||(song.currentTime<segmentStart()&&segmentStart()<song.duration))){song.currentTime=segmentStart()}
      on=true;updateUI();
      song.play().catch(()=>{on=false;updateUI();});
    }else fallbackStart();
  }
  function stop(){on=false;updateUI();if(audio)audio.pause();if(interval){clearInterval(interval);interval=null}if(ctx&&ctx.state==='running')ctx.suspend()}
  btn.addEventListener('click',()=>on?stop():start());
  window.Music={autoStart(){if(!wasTouched)start()},isOn(){return on},pause:stop,play:start};
  updateUI();
})();

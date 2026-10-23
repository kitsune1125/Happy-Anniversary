// Background hearts, celebration confetti, and a skippable typewriter letter.
(function () {
  'use strict';
  const canvas = document.getElementById('fx');
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0, height = 0, drifting = [], sparks = [];
  let typingTimer = null, typingFinish = null;

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function heart(x, y, size, rotate) {
    ctx.save();ctx.translate(x,y);ctx.rotate(rotate);ctx.scale(size/24,size/24);
    ctx.beginPath();ctx.moveTo(0,9);
    ctx.bezierCurveTo(-2,6,-12,0,-12,-6);
    ctx.bezierCurveTo(-12,-14,-2,-14,0,-8);
    ctx.bezierCurveTo(2,-14,12,-14,12,-6);
    ctx.bezierCurveTo(12,0,2,6,0,9);
    ctx.fill();ctx.restore();
  }
  function spawn(initial) {
    drifting.push({x:Math.random()*width,y:initial?Math.random()*height:height+25,size:8+Math.random()*13,velocity:.24+Math.random()*.38,phase:Math.random()*10});
  }
  if (!reduced) for (let i=0;i<12;i++) spawn(true);
  function frame() {
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle='#db8396';ctx.globalAlpha=.15;
    drifting.forEach(h=>{h.y-=h.velocity;h.phase+=.015;heart(h.x+Math.sin(h.phase)*14,h.y,h.size,Math.sin(h.phase)*.17)});
    drifting=drifting.filter(h=>h.y>-25);
    while (drifting.length<12) spawn(false);
    sparks.forEach(p=>{p.vy+=.1;p.x+=p.vx;p.y+=p.vy;p.spin+=.07;p.life-=.015;ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;heart(p.x,p.y,p.size,p.spin)});
    sparks=sparks.filter(p=>p.life>0 && p.y<height+30);
    ctx.globalAlpha=1;
    requestAnimationFrame(frame);
  }
  if (!reduced) requestAnimationFrame(frame);

  function cancelTyping(showAll) {
    if (typingFinish) typingFinish(Boolean(showAll));
  }
  function typewrite(container, paragraphs) {
    cancelTyping(false);
    const lines=Array.isArray(paragraphs)?paragraphs:[];
    container.replaceChildren();
    const nodes=lines.map(()=>{const p=document.createElement('p');container.appendChild(p);return p});
    return new Promise(resolve=>{
      let line=0,character=0;
      function finish(showAll) {
        if(typingTimer!==null){clearInterval(typingTimer);typingTimer=null;}
        nodes.forEach(n=>n.classList.remove('caret'));
        if(showAll) nodes.forEach((n,i)=>n.textContent=lines[i]);
        typingFinish=null;resolve();
      }
      typingFinish=finish;
      if(reduced || !lines.length){finish(true);return;}
      typingTimer=setInterval(()=>{
        if(line>=lines.length){finish(true);return;}
        const p=nodes[line];
        p.textContent=lines[line].slice(0,++character);
        p.classList.add('caret');
        if(character>=lines[line].length){p.classList.remove('caret');line++;character=0;}
        if(line>=lines.length)finish(true);
      },23);
    });
  }
  window.Anim={
    burst(el){
      if(reduced || !el)return;
      const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      const colors=['#db6c83','#f5b1bd','#f2c78f','#fff4de','#ad4f67'];
      for(let i=0;i<65;i++){
        const a=Math.random()*Math.PI*2,s=2+Math.random()*6;
        sparks.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-3,size:7+Math.random()*12,spin:Math.random()*6,life:1,color:colors[i%colors.length]});
      }
    },
    typewrite,cancelTyping,
    scrollTo(el){if(el)el.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});},
    reduced
  };
})();

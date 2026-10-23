(function () {
  'use strict';
  const cfg=window.CONFIG,$=id=>document.getElementById(id);
  const cols=Math.max(2,Math.min(8,Number(cfg.grid?.cols)||4));
  const rows=Math.max(2,Math.min(8,Number(cfg.grid?.rows)||5));
  const count=rows*cols;
  let target=0,tries=0,remainingHints=2,found=false,lastGuess=null,round=0;
  const grid=$('grid');
  $('gameProgress').setAttribute('aria-valuemax',String(count));
  $('sub').textContent='I hid my heart somewhere in the squares, '+cfg.her+'. Tap around, and I’ll tell you if you’re getting warmer.';
  $('photo').src=cfg.photo;
  $('photo').addEventListener('error',function(){if(!this.src.endsWith('/images/photo.svg'))this.src='images/photo.svg'});
  $('caption').textContent=cfg.caption;

  function updateProgress(){
    $('tries').textContent=tries+' / '+count+' explored';
    $('gameProgress').setAttribute('aria-valuenow',String(tries));
    $('gameFill').style.width=(tries/count*100)+'%';
    $('hintLabel').textContent='Need a hint? ('+remainingHints+')';
    $('hintBtn').disabled=found||remainingHints===0;
  }
  function createTile(i){
    const btn=document.createElement('button');btn.className='tile';btn.type='button';btn.dataset.i=i;
    btn.setAttribute('aria-label','Hidden square '+(i+1));
    const mark=document.createElement('span');mark.className='tile-mark';mark.textContent='?';btn.appendChild(mark);
    btn.addEventListener('click',pick);
    return btn;
  }
  function restart(){
    round++;Anim.cancelTyping(false);
    target=Math.floor(Math.random()*count);tries=0;remainingHints=2;found=false;lastGuess=null;
    grid.style.gridTemplateColumns='repeat('+cols+',minmax(0,1fr))';
    grid.replaceChildren(...Array.from({length:count},(_,i)=>createTile(i)));
    $('status').textContent='Where could it be?';$('tempIcon').textContent='♡';$('clueText').textContent='';
    $('tinyNote').hidden=true;
    for(const id of ['letter','letterPaper','photoReveal','extras','lastSurprise'])$(id).hidden=true;
    $('envelopeArea').hidden=false;$('openLetter').disabled=false;
    $('skipTyping').hidden=true;$('lb').replaceChildren();$('sig').textContent='';
    updateProgress();Surprises.reset();
  }
  function putStatus(text,icon){$('status').textContent=text;$('tempIcon').textContent=icon}
  function pick(e){
    const tile=e.currentTarget,i=Number(tile.dataset.i);
    if(found||tile.disabled)return;
    Music.autoStart();tries++;lastGuess=i;
    if(i===target){win(tile);return;}
    const dx=i%cols-target%cols,dy=Math.floor(i/cols)-Math.floor(target/cols);
    const distance=Math.hypot(dx,dy);
    const kind=distance<1.5?'hot':distance<2.6?'warm':'cold';
    const text=kind==='hot'?'Very close!':kind==='warm'?'Getting warmer...':'Not quite, try again.';
    tile.classList.add(kind);tile.disabled=true;tile.replaceChildren();
    const icon=document.createElement('span');icon.className='tile-mark';icon.textContent=kind==='hot'?'♥':kind==='warm'?'~':'✳';
    const tiny=document.createElement('span');tiny.className='tile-small';tiny.textContent=kind==='hot'?'HOT!':kind==='warm'?'WARM':'COLD';
    tile.append(icon,tiny);tile.setAttribute('aria-label',kind+' square '+(i+1));
    putStatus(text,kind==='hot'?'♥':kind==='warm'?'☀':'❄');
    $('clueText').textContent=kind==='hot'?'You could almost touch it... ♡':kind==='warm'?'Something tells me you are getting closer.':'Somewhere else, love. Keep looking.';
    const notes=cfg.tinyNotes||[];
    if(notes.length&&[2,4,7].includes(tries)){
      const note=$('tinyNote');note.hidden=false;note.textContent='✉ Little note: '+notes[[2,4,7].indexOf(tries)%notes.length];
    }
    updateProgress();
  }
  function win(tile){
    found=true;
    tile.classList.add('found');tile.disabled=true;tile.replaceChildren();
    const heart=document.createElement('span');heart.className='tile-mark';heart.textContent='♥';tile.appendChild(heart);
    tile.setAttribute('aria-label','You found the heart!');
    Array.from(grid.children).forEach(b=>b.disabled=true);
    putStatus('You found it in '+tries+(tries===1?' try!':' tries!'),'♥');
    $('clueText').textContent='It was always yours to find. ♡';
    $('tinyNote').hidden=true;
    updateProgress();Anim.burst(tile);
    $('letter').hidden=false;
    setTimeout(()=>{if(found)Anim.scrollTo($('letter'))},650);
  }
  function directionHint(){
    if(found||remainingHints<=0)return;
    if(lastGuess===null){$('clueText').textContent='Choose a square first, then I can point the way!';return;}
    const guessCol=lastGuess%cols,guessRow=Math.floor(lastGuess/cols);
    const heartCol=target%cols,heartRow=Math.floor(target/cols);
    let parts=[];
    if(heartRow<guessRow)parts.push('up ↑');else if(heartRow>guessRow)parts.push('down ↓');
    if(heartCol<guessCol)parts.push('left ←');else if(heartCol>guessCol)parts.push('right →');
    $('clueText').textContent='✦ Secret hint: From your last square, look '+parts.join(' and ')+'.';
    remainingHints--;updateProgress();
  }
  $('hintBtn').addEventListener('click',directionHint);
  $('openLetter').addEventListener('click',()=>{
    if(!found)return;
    const currentRound=round;
    $('openLetter').disabled=true;$('envelopeArea').hidden=true;
    $('letterPaper').hidden=false;
    $('lh').textContent='Dear '+cfg.her+',';
    $('sig').textContent='Always yours, '+cfg.me+' ♡';
    $('skipTyping').hidden=false;
    Anim.burst($('letterPaper'));
    Anim.scrollTo($('letterPaper'));
    Anim.typewrite($('lb'),cfg.message).then(()=>{
      if(round!==currentRound||!found)return;
      $('skipTyping').hidden=true;
      $('sig').classList.add('sig-ready');
      $('photoReveal').hidden=false;
      Surprises.unlockExtras();
      setTimeout(()=>{if(round===currentRound&&found)Anim.scrollTo($('photoReveal'))},450);
    });
  });
  $('skipTyping').addEventListener('click',()=>Anim.cancelTyping(true));
  $('again').addEventListener('click',()=>{restart();Anim.scrollTo($('hunt'))});
  restart();
})();

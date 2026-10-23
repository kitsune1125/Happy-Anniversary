// Postcard, love-jar, memories, open-when letters, and a touch-friendly scratch-off finale.
(function () {
  'use strict';
  const cfg=window.CONFIG;
  const $=id=>document.getElementById(id);
  let memoryIndex=0,reasonIndex=-1,letterIndex=-1,scratchRevealed=false;
  let scratchCtx=null,scratching=false,lastPoint=null;
  const scratch=$('scratchCanvas'),scratchArea=$('scratchArea');
  const lightbox=$('photoLightbox'),lightboxImage=$('lightboxImage'),lightboxCaption=$('lightboxCaption');
  let returnFocus=null;
  function openPhoto(path,caption){
    if(!path||!lightbox)return;
    returnFocus=document.activeElement;
    lightboxImage.src=path;
    lightboxImage.alt=caption||'Our photograph';
    lightboxCaption.textContent=caption||'';
    if(typeof lightbox.showModal==='function')lightbox.showModal();else lightbox.setAttribute('open','');
    $('closeLightbox').focus();
  }
  function closePhoto(){
    if(typeof lightbox.close==='function')lightbox.close();else lightbox.removeAttribute('open');
    if(returnFocus&&returnFocus.isConnected)returnFocus.focus();
  }
  $('closeLightbox').addEventListener('click',closePhoto);
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)closePhoto()});
  lightbox.addEventListener('close',()=>{if(returnFocus&&returnFocus.isConnected)returnFocus.focus()});
  lightboxImage.addEventListener('error',()=>{lightboxCaption.textContent='Sorry, this photo could not be loaded.'});
  $('photo').addEventListener('click',()=>openPhoto(cfg.photo,cfg.caption||'Our favorite photo'));
  $('photo').tabIndex=0;
  $('photo').setAttribute('role','button');
  $('photo').setAttribute('aria-label','View our photo larger');
  $('photo').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPhoto(cfg.photo,cfg.caption||'Our photo')}});

  $('introText').textContent=cfg.intro;
  $('postcardMessage').textContent=cfg.postcardMessage;
  $('footerName').textContent='always yours, '+cfg.me;
  $('scratchSecret').textContent=cfg.finalMessage;
  $('postcardBtn').addEventListener('click',()=>{
    const card=$('postcardBtn');const flipped=card.classList.toggle('flipped');
    card.setAttribute('aria-label',flipped?'Flip postcard to the front':'Flip postcard to read the secret note');
    if(flipped)Anim.burst(card);
  });
  $('beginBtn').addEventListener('click',()=>{Anim.scrollTo($('hunt'));document.querySelector('.tile:not(:disabled)')?.focus({preventScroll:true})});

  function drawMemory(){
    const list=cfg.memories||[];
    if(!list.length)return;
    const m=list[memoryIndex];
    $('memoryNumber').textContent=String(memoryIndex+1).padStart(2,'0')+' / '+String(list.length).padStart(2,'0');
    const memoryVisual=$('memoryEmoji');
    memoryVisual.replaceChildren();
    if (m.image) {
      const button=document.createElement('button');
      button.type='button';button.className='memory-photo-button';
      button.title='See this photo in full';
      button.setAttribute('aria-label','Enlarge photo: '+(m.title||'Our memory'));
      const picture=document.createElement('img');
      picture.src=m.image;picture.alt=m.title||'Our memory';
      picture.className='memory-picture';
      picture.loading='lazy';picture.decoding='async';
      picture.onerror=()=>{picture.alt='Photo unavailable';};
      const zoom=document.createElement('span');zoom.className='photo-expand';zoom.textContent='↗';zoom.setAttribute('aria-hidden','true');
      button.append(picture,zoom);
      button.addEventListener('click',()=>openPhoto(m.image,m.title));
      memoryVisual.appendChild(button);
    } else {
      memoryVisual.textContent=m.emoji||'♡';
    }
    $('memoryTitle').textContent=m.title||'';
    $('memoryText').textContent=m.text||'';
    $('memoryDots').replaceChildren();
    list.forEach((_,i)=>{
      const dot=document.createElement('button');dot.type='button';dot.className='memory-dot'+(i===memoryIndex?' active':'');dot.setAttribute('aria-label','Go to memory '+(i+1));dot.setAttribute('aria-current',i===memoryIndex?'true':'false');dot.addEventListener('click',()=>{memoryIndex=i;drawMemory()});$('memoryDots').appendChild(dot);
    });
  }
  $('memoryPrev').addEventListener('click',()=>{memoryIndex=(memoryIndex-1+(cfg.memories||[]).length)%(cfg.memories||[]).length;drawMemory()});
  $('memoryNext').addEventListener('click',()=>{memoryIndex=(memoryIndex+1)%(cfg.memories||[]).length;drawMemory()});
  drawMemory();

  $('jarBtn').addEventListener('click',()=>{
    const list=cfg.reasons||[];if(!list.length)return;
    let next=Math.floor(Math.random()*list.length);
    if(list.length>1&&next===reasonIndex)next=(next+1+Math.floor(Math.random()*(list.length-1)))%list.length;
    reasonIndex=next;
    const paper=$('jarNote');paper.textContent='“'+list[next]+'”';
    paper.classList.remove('popped');void paper.offsetWidth;paper.classList.add('popped');
    Anim.burst($('jarBtn'));
    $('jarBtn').firstChild.textContent='Another little note ';
  });

  function buildLetters(){
    const root=$('openWhens');root.replaceChildren();
    (cfg.openWhens||[]).forEach((item,i)=>{
      const btn=document.createElement('button');btn.type='button';btn.className='open-when';btn.setAttribute('aria-expanded','false');
      const visual=document.createElement('span');visual.className='open-when-icon';
      if (item.image) {
        const picture=document.createElement('img');
        picture.src=item.image;
        picture.alt='';
        picture.className='open-when-picture';
        picture.onerror=()=>{picture.alt='Photo unavailable';};
        visual.appendChild(picture);
      } else {
        visual.textContent=item.emoji||'💌';
      }
      const label=document.createElement('span');label.className='open-when-label';label.textContent='Open when '+item.title;
      const tap=document.createElement('span');tap.className='open-when-tap';tap.textContent='TAP TO OPEN ↗';
      btn.append(visual,label,tap);
      btn.addEventListener('click',()=>{
        if(letterIndex===i){letterIndex=-1;$('openWhenMessage').hidden=true;}
        else{
          letterIndex=i;
          const panel=$('openWhenMessage');panel.replaceChildren();
          const heading=document.createElement('strong');heading.textContent='For when '+item.title+' ♡';
          const p=document.createElement('p');p.textContent=item.message;
          if (item.image) {
            const pictureButton=document.createElement('button');
            pictureButton.type='button';pictureButton.className='open-when-photo-button';
            pictureButton.setAttribute('aria-label','Enlarge photo for this letter');
            const largePicture=document.createElement('img');
            largePicture.src=item.image;largePicture.alt='A picture for this letter';
            largePicture.className='open-when-message-picture';
            largePicture.loading='lazy';
            const zoom=document.createElement('span');zoom.className='photo-expand';zoom.textContent='↗';zoom.setAttribute('aria-hidden','true');
            pictureButton.append(largePicture,zoom);
            pictureButton.addEventListener('click',()=>openPhoto(item.image,'Open when '+item.title));
            panel.appendChild(pictureButton);
          }
          panel.append(heading,p);panel.hidden=false;
          Anim.burst(btn);
        }
        Array.from(root.children).forEach((b,j)=>{b.setAttribute('aria-expanded',String(j===letterIndex));b.lastChild.textContent=j===letterIndex?'CLOSE LETTER ↶':'TAP TO OPEN ↗'});
      });
      root.appendChild(btn);
    });
  }
  buildLetters();

  function paintScratch(){
    if(scratchRevealed||$('lastSurprise').hidden)return;
    const rect=scratchArea.getBoundingClientRect();if(!rect.width||!rect.height)return;
    const scale=Math.min(window.devicePixelRatio||1,2);
    scratch.width=Math.ceil(rect.width*scale);scratch.height=Math.ceil(rect.height*scale);
    scratchCtx=scratch.getContext('2d',{willReadFrequently:true});scratchCtx.setTransform(scale,0,0,scale,0,0);
    const gradient=scratchCtx.createLinearGradient(0,0,rect.width,rect.height);
    gradient.addColorStop(0,'#cc8396');gradient.addColorStop(.5,'#dca2ae');gradient.addColorStop(1,'#bd7389');
    scratchCtx.globalCompositeOperation='source-over';scratchCtx.fillStyle=gradient;scratchCtx.fillRect(0,0,rect.width,rect.height);
    scratchCtx.fillStyle='rgba(255,255,255,.12)';
    for(let i=0;i<100;i++){const x=(i*97.17)%rect.width,y=(i*53.67)%rect.height;scratchCtx.fillRect(x,y,2,2)}
  }
  function pointerPos(event){const r=scratch.getBoundingClientRect();return {x:event.clientX-r.left,y:event.clientY-r.top}}
  function brush(from,to){if(!scratchCtx)return;scratchCtx.globalCompositeOperation='destination-out';scratchCtx.lineWidth=49;scratchCtx.lineCap='round';scratchCtx.lineJoin='round';scratchCtx.beginPath();scratchCtx.moveTo(from.x,from.y);scratchCtx.lineTo(to.x,to.y);scratchCtx.stroke();scratchCtx.globalCompositeOperation='source-over'}
  function scratchedEnough(){
    if(!scratchCtx)return false;
    const {data}=scratchCtx.getImageData(0,0,scratch.width,scratch.height);
    let total=0,blank=0;
    for(let i=3;i<data.length;i+=4*24){total++;if(data[i]<90)blank++}
    return total>0&&blank/total>.31;
  }
  function revealScratch(){
    if(scratchRevealed)return;
    scratchRevealed=true;
    scratchArea.classList.add('revealed');
    $('revealScratch').hidden=true;$('finalActions').hidden=false;
    Anim.burst(scratchArea);
  }
  scratch.addEventListener('pointerdown',e=>{
    if(scratchRevealed)return;
    scratching=true;lastPoint=pointerPos(e);scratch.setPointerCapture(e.pointerId);brush(lastPoint,lastPoint);
  });
  scratch.addEventListener('pointermove',e=>{
    if(!scratching||scratchRevealed)return;
    const p=pointerPos(e);brush(lastPoint,p);lastPoint=p;
  });
  function stopScratch(){if(!scratching)return;scratching=false;lastPoint=null;if(scratchedEnough())revealScratch()}
  scratch.addEventListener('pointerup',stopScratch);scratch.addEventListener('pointercancel',stopScratch);
  $('revealScratch').addEventListener('click',revealScratch);
  let resizeId;window.addEventListener('resize',()=>{clearTimeout(resizeId);resizeId=setTimeout(()=>{if(!$('lastSurprise').hidden&&!scratchRevealed)paintScratch()},220)}, {passive:true});

  function reset(){
    memoryIndex=0;reasonIndex=-1;letterIndex=-1;scratchRevealed=false;scratching=false;
    $('jarNote').textContent='Press the button and pull out a little love note.';
    $('jarBtn').firstChild.textContent='Pick a little note ';
    $('openWhenMessage').hidden=true;
    Array.from($('openWhens').children).forEach(b=>{b.setAttribute('aria-expanded','false');b.lastChild.textContent='TAP TO OPEN ↗'});
    if(lightbox.open)closePhoto();
    scratchArea.classList.remove('revealed');$('revealScratch').hidden=false;$('finalActions').hidden=true;
    $('copyStatus').textContent='';drawMemory();
  }
  function unlockExtras(){
    $('extras').hidden=false;$('lastSurprise').hidden=false;
    requestAnimationFrame(paintScratch);
  }
  function copyNote(){
    const value='Just a reminder: '+cfg.finalMessage+' ♡ — '+cfg.me;
    const success=()=>{$('copyStatus').textContent='Copied! A little love note is ready to paste ♡'};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(value).then(success).catch(fallback)}
    else fallback();
    function fallback(){
      const input=document.createElement('textarea');input.value=value;input.style.cssText='position:fixed;left:-9999px';document.body.appendChild(input);input.select();
      try{document.execCommand('copy');success()}catch(e){$('copyStatus').textContent='Copy this: '+value}input.remove();
    }
  }
  $('shareBtn').addEventListener('click',copyNote);
  window.Surprises={unlockExtras,reset};
})();

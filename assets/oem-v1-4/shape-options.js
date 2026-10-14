(() => {
  'use strict';
  const panel=document.getElementById('oem-shape-options');
  const dialog=document.getElementById('oem-shape-dialog');
  if(!panel||!dialog)return;
  const scroll=dialog.querySelector('.shape-scroll'),zoom=dialog.querySelector('.shape-zoom'),help=dialog.querySelector('#oem-shape-dialog-help');
  let fit=false,previousOverflow='',opener=null;
  function setFit(value){
    fit=value;scroll.classList.toggle('is-fit',fit);
    zoom.textContent=fit?'Read dimensions':'Fit full chart';
    zoom.setAttribute('aria-pressed',String(fit));
    help.textContent=fit?'Full chart overview. Choose “Read dimensions” for the original image size.':'Scroll to explore shapes and dimension labels at the original image resolution.';
    scroll.scrollTo(0,0);
  }
  panel.querySelectorAll('.shape-open').forEach(button=>button.addEventListener('click',()=>{
    opener=button;setFit(false);previousOverflow=document.documentElement.style.overflow;
    document.documentElement.style.overflow='hidden';dialog.showModal();scroll.scrollTo(0,0);
  }));
  zoom.addEventListener('click',()=>setFit(!fit));
  dialog.querySelector('.shape-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    document.documentElement.style.overflow=previousOverflow;
    if(!panel.hidden)opener?.focus({preventScroll:true});
  });
})();

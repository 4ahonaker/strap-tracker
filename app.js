
function maybeShowWhatsNew(){
  const s = loadState();
  const modal = document.getElementById("whatsNewModal");
  const list = document.getElementById("whatsNewList");
  const pill = document.getElementById("whatsNewVersionPill");
  const btn = document.getElementById("whatsNewDismissBtn");
  if(!modal || !list || !pill || !btn) return;

  const notes = CHANGELOG[APP_VERSION];
  const shouldShow = notes && s.lastSeenVersion !== APP_VERSION;
  if(!shouldShow) return;

  pill.textContent = `v${APP_VERSION}`;
  list.innerHTML = "";
  notes.forEach(n=>{
    const li = document.createElement("li");
    li.textContent = n;
    list.appendChild(li);
  });

  const dismiss = ()=>{
    modal.classList.add("hidden");
    try {
      const state = loadState();
      state.lastSeenVersion = APP_VERSION;
      saveState(state);
    } catch(e) {}
  };

  btn.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); dismiss(); }, { once:true });
  btn.addEventListener("touchend", (e)=>{ e.preventDefault(); e.stopPropagation(); dismiss(); }, { once:true });
  modal.addEventListener("click", (e)=>{ if(e.target === modal) dismiss(); }, { once:true });
  modal.addEventListener("touchend", (e)=>{ if(e.target === modal) dismiss(); }, { once:true });

  modal.classList.remove("hidden");
}
maybeShowWhatsNew();

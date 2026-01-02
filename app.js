// ---------- App Version ----------
const APP_VERSION = "2.1.0";

// ---------- What's New (changelog) ----------
const CHANGELOG = {
  "2.1.0": [
    "On-screen version number (helps confirm you’re on the newest build).",
    "What’s New popup after updates (auto-shows once per version).",
    "Version stamp added to CSV exports and printed PDF pages.",
    "Force Refresh button in Settings (clears cached app files, keeps workouts)."
  ]
};

// ---------- Program Templates (validated against cheat sheets) ----------
const PROGRAM = {
  name: "3-Day Strap Program",
  weeks: 6,
  prompts: {
    1: "Week 1: Form consistency + log angle/tempo every exercise.",
    2: "Week 2: Add reps within the hypertrophy range.",
    3: "Week 3: Increase angle/lean slightly (if ready).",
    4: "Week 4: Add 1 set to main arm lifts (keep session < 60 min).",
    5: "Week 5: Slower negatives (4–5 sec) on last 1–2 sets.",
    6: "Week 6: Top reps + optional isometric hold on final set."
  },
  workouts: {
    1: {
      title: "Workout 1 — Chest • Biceps • Shoulders",
      exercises: [
        { name:"Chest Press", focus:"Chest/Delts", repMin:10, repMax:15, sets:3, youtube:"https://www.youtube.com/watch?v=6b3hFjzjG7Y" },
        { name:"Chest Fly", focus:"Chest", repMin:12, repMax:15, sets:3, youtube:"https://www.youtube.com/watch?v=JpJ4x4U2Lx8" },
        { name:"Supinated Curl", focus:"Biceps", repMin:8, repMax:12, sets:4, youtube:"https://www.youtube.com/watch?v=GQ3x1Qy6K6I" },
        { name:"High Curl", focus:"Biceps Peak", repMin:12, repMax:15, sets:3, youtube:"https://www.youtube.com/watch?v=J3xH8n5Kp4Q" },
        { name:"Lateral Raise", focus:"Medial Delts", repMin:12, repMax:15, sets:3, youtube:"https://www.youtube.com/watch?v=3VcKaXpzqRo" },
        { name:"Wrist Curl", focus:"Forearms", repMin:15, repMax:20, sets:2, youtube:"https://www.youtube.com/watch?v=Yk0Z9B6j6zI" },
      ]
    },
    2: {
      title: "Workout 2 — Back • Triceps • Forearms",
      exercises: [
        { name:"Supinated Row", focus:"Lats", repMin:8, repMax:12, sets:4, youtube:"https://www.youtube.com/watch?v=R0mMyV5OtcM" },
        { name:"Face Pull", focus:"Rear Delts", repMin:12, repMax:15, sets:3, youtube:"https://www.youtube.com/watch?v=rep-qVOkqgk" },
        { name:"Overhead Triceps Ext", focus:"Triceps (Long Head)", repMin:10, repMax:15, sets:4, youtube:"https://www.youtube.com/watch?v=2-LAMcpzODU" },
        { name:"Pressdown", focus:"Triceps", repMin:12, repMax:15, sets:3, youtube:"https://www.youtube.com/watch?v=KZ6m9m9JpY0" },
        { name:"Pronated Wrist Curl", focus:"Forearms", repMin:15, repMax:20, sets:3, youtube:"https://www.youtube.com/watch?v=FGuVJAj96SE" },
        { name:"Farmer Hold", focus:"Grip/Core", repMin:30, repMax:30, sets:2, youtube:"https://www.youtube.com/watch?v=ZKZK8JX8y8E" },
      ]
    },
    3: {
      title: "Workout 3 — Arms • Shoulders • Pump",
      exercises: [
        { name:"Lean-Back Curl", focus:"Biceps (Long Head)", repMin:8, repMax:10, sets:4, youtube:"https://www.youtube.com/watch?v=J3yZzPz0jYc" },
        { name:"Narrow Push-Up", focus:"Triceps", repMin:8, repMax:12, sets:4, youtube:"https://www.youtube.com/watch?v=FQ9V8nZKQvA" },
        { name:"Offset Curl", focus:"Biceps", repMin:10, repMax:12, sets:3, youtube:"https://www.youtube.com/watch?v=Hn5R8ZsKk6A" },
        { name:"High Triceps Ext", focus:"Triceps", repMin:12, repMax:15, sets:3, youtube:"https://www.youtube.com/watch?v=2-LAMcpzODU" },
        { name:"Rear Delt Fly", focus:"Rear Delts", repMin:15, repMax:15, sets:3, youtube:"https://www.youtube.com/watch?v=Y1kzJ7z8gRM" },
        { name:"Fly + Row", focus:"Chest/Back", repMin:15, repMax:20, sets:2, youtube:"https://www.youtube.com/watch?v=JpJ4x4U2Lx8" },
      ]
    }
  }
};

// ---------- Storage (local-only) ----------
const KEY = "strap_tracker_v3";

function loadState(){
  const raw = localStorage.getItem(KEY);
  if(raw) return JSON.parse(raw);
  return {
    plan: { week: 1, nextWorkout: 1, wDone: {1:false,2:false,3:false}, lastCompleted: null },
    settings: { exportReminderDays: 14 },
    lastExportAt: null,
    lastSeenVersion: null,
    sessions: []
  };
}
function saveState(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
function uid(){ return Math.random().toString(16).slice(2)+Date.now().toString(16); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function daysBetween(aISO, bISO){
  const a = new Date(aISO);
  const b = new Date(bISO);
  return Math.floor((b - a)/(1000*60*60*24));
}

// ---------- Version Display ----------
function renderVersion(){
  const v1 = document.getElementById("appVersion");
  const v2 = document.getElementById("appVersionSettings");
  if (v1) v1.textContent = `v${APP_VERSION}`;
  if (v2) v2.textContent = `v${APP_VERSION}`;
}
renderVersion();

// ---------- What's New modal ----------
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

  modal.classList.remove("hidden");
  btn.onclick = ()=>{
    modal.classList.add("hidden");
    const state = loadState();
    state.lastSeenVersion = APP_VERSION;
    saveState(state);
  };
}
maybeShowWhatsNew();

// ---------- UI Tabs ----------
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
tabs.forEach(b=>b.addEventListener("click", ()=>{
  tabs.forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  const id=b.dataset.tab;
  panels.forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id==="history") renderHistory();
  if(id==="reports") renderReports();
  if(id==="integrity") renderIntegritySummary();
  if(id==="settings") renderSettings();
}));

// ---------- Home ----------
const weekTitle = document.getElementById("weekTitle");
const weekPrompt = document.getElementById("weekPrompt");
const nextWorkoutTitle = document.getElementById("nextWorkoutTitle");
const queueStatus = document.getElementById("queueStatus");
const startWorkoutBtn = document.getElementById("startWorkoutBtn");
const wk1s=document.getElementById("wk1s");
const wk2s=document.getElementById("wk2s");
const wk3s=document.getElementById("wk3s");
const streakPill=document.getElementById("streakPill");
const exportReminder=document.getElementById("exportReminder");

function approximateWeeklyCompletion(state){
  const have=new Set();
  let streak=0;
  for(let i=state.sessions.length-1;i>=0;i--){
    have.add(state.sessions[i].workout);
    if(have.has(1)&&have.has(2)&&have.has(3)){
      streak++;
      have.clear();
    }
  }
  return streak;
}

function renderHome(){
  const s=loadState();
  weekTitle.textContent = `Week ${s.plan.week} of ${PROGRAM.weeks}`;
  weekPrompt.textContent = PROGRAM.prompts[s.plan.week] || "";
  nextWorkoutTitle.textContent = `Workout ${s.plan.nextWorkout}`;
  queueStatus.textContent = PROGRAM.workouts[s.plan.nextWorkout].title;
  wk1s.textContent = s.plan.wDone[1] ? "✓" : "—";
  wk2s.textContent = s.plan.wDone[2] ? "✓" : "—";
  wk3s.textContent = s.plan.wDone[3] ? "✓" : "—";
  streakPill.textContent = `Streak: ${approximateWeeklyCompletion(s)}`;

  const remindDays = s.settings?.exportReminderDays ?? 14;
  const today = todayISO();
  let show = false;
  let msg = "";
  if(!s.lastExportAt){
    show = s.sessions.length >= 3;
    msg = `You haven't exported a backup yet. <b>Export CSV</b> or <b>Print/Save PDF</b> (counts as backup).`;
  } else {
    const d = daysBetween(s.lastExportAt, today);
    show = d >= remindDays;
    msg = `Last backup/export was <b>${s.lastExportAt}</b> (${d} days ago). Consider exporting again.`;
  }
  exportReminder.innerHTML = msg;
  exportReminder.classList.toggle("hidden", !show);
}
renderHome();

startWorkoutBtn.addEventListener("click", ()=> openWorkout(loadState().plan.nextWorkout));

// ---------- Workout ----------
const workoutKicker = document.getElementById("workoutKicker");
const workoutName = document.getElementById("workoutName");
const workoutHint = document.getElementById("workoutHint");
const exerciseList = document.getElementById("exerciseList");
const completeWorkoutBtn = document.getElementById("completeWorkoutBtn");
const backHomeBtn = document.getElementById("backHomeBtn");

let activeSession = null;

function openWorkout(n){
  tabs.forEach(x=>x.classList.remove("active"));
  panels.forEach(p=>p.classList.remove("active"));
  document.getElementById("workout").classList.add("active");

  const s=loadState();
  const w=PROGRAM.workouts[n];
  workoutKicker.textContent = `Week ${s.plan.week} • Workout ${n}`;
  workoutName.textContent = w.title;
  workoutHint.textContent = "Hypertrophy ranges only. Log angle + tempo consistently.";

  activeSession = {
    id: uid(),
    dateISO: todayISO(),
    week: s.plan.week,
    workout: n,
    exercises: w.exercises.map(ex => ({
      name: ex.name, focus: ex.focus, repMin: ex.repMin, repMax: ex.repMax, youtube: ex.youtube,
      angle: "", tempo: "", rpe: "", notes: "", sets: Array(ex.sets).fill("")
    }))
  };
  renderWorkout();
}

function lastExerciseRecord(state, exName){
  for(let i=state.sessions.length-1;i>=0;i--){
    const sess=state.sessions[i];
    const found=sess.exercises.find(e=>e.name===exName);
    if(found) return found;
  }
  return null;
}

function suggestionFor(ex, last){
  if(!last) return "First time logging this: keep angle consistent and stay in range.";
  const reps = (last.sets||[]).map(x=>parseInt(x||"0",10)).filter(n=>!isNaN(n));
  const hitTop = reps.length>0 && reps.every(r=>r>=ex.repMax);
  const rpe = parseFloat(last.rpe||"");
  const avgRpe = isNaN(rpe) ? null : rpe;

  if(hitTop && (avgRpe===null || avgRpe<=8.0)){
    return `Last: ${reps.join("/")}${avgRpe?` @RPE ${avgRpe}`:""} → Next: harder angle (feet closer / more lean). Keep ${ex.repMin}–${ex.repMax}.`;
  }
  if(!hitTop && (avgRpe===null || avgRpe<=9.0)){
    return `Last: ${reps.join("/")}${avgRpe?` @RPE ${avgRpe}`:""} → Next: same angle, add +1 rep total across sets.`;
  }
  return `Last: ${reps.join("/")}${avgRpe?` @RPE ${avgRpe}`:""} → Next: repeat or slightly easier angle; clean reps in ${ex.repMin}–${ex.repMax}.`;
}

function renderWorkout(){
  const state=loadState();
  exerciseList.innerHTML = "";
  activeSession.exercises.forEach((ex, idx)=>{
    const last = lastExerciseRecord(state, ex.name);
    const sug = suggestionFor(ex, last);

    const el = document.createElement("div");
    el.className="exerciseCard";
    el.innerHTML = `
      <div class="exHead">
        <div>
          <div class="exName">${idx+1}) ${ex.name} <span class="badge">(${ex.repMin}–${ex.repMax})</span></div>
          <div class="muted">${ex.focus}</div>
          <div class="muted"><b>Suggestion:</b> ${sug}</div>
          <div class="muted"><a href="${ex.youtube}" target="_blank" rel="noreferrer">Open YouTube demo</a></div>
        </div>
      </div>

      <div class="grid">
        <input placeholder="Angle / foot position" value="${ex.angle}" data-field="angle" data-i="${idx}">
        <input placeholder="Tempo (e.g., 4-1-1)" value="${ex.tempo}" data-field="tempo" data-i="${idx}">
        <input placeholder="RPE (1–10)" value="${ex.rpe}" inputmode="decimal" data-field="rpe" data-i="${idx}">
        <textarea placeholder="Notes" data-field="notes" data-i="${idx}">${ex.notes}</textarea>
      </div>

      <div class="sets">
        <div class="hdr">Set</div><div class="hdr">1</div><div class="hdr">2</div><div class="hdr">3</div><div class="hdr">4+</div>
        <div class="hdr">Reps</div>
        ${ex.sets.slice(0,3).map((v,sn)=>`<input value="${v}" inputmode="numeric" data-set="${sn}" data-i="${idx}">`).join("")}
        <button class="ghost" data-addset="${idx}">+ Set</button>
      </div>
      <div class="sets" style="grid-template-columns:repeat(6,1fr);margin-top:8px;">
        ${ex.sets.slice(3).map((v,sn)=>`<input value="${v}" inputmode="numeric" data-set="${sn+3}" data-i="${idx}">`).join("")}
      </div>
    `;
    exerciseList.appendChild(el);
  });

  document.querySelectorAll("[data-field]").forEach(inp=>{
    inp.addEventListener("input", (e)=>{
      const i=parseInt(e.target.dataset.i,10);
      const f=e.target.dataset.field;
      activeSession.exercises[i][f]=e.target.value;
    });
  });
  document.querySelectorAll("input[data-set]").forEach(inp=>{
    inp.addEventListener("input",(e)=>{
      const i=parseInt(e.target.dataset.i,10);
      const sn=parseInt(e.target.dataset.set,10);
      activeSession.exercises[i].sets[sn]=e.target.value;
    });
  });
  document.querySelectorAll("button[data-addset]").forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      const i=parseInt(e.target.dataset.addset,10);
      activeSession.exercises[i].sets.push("");
      renderWorkout();
    });
  });
}

completeWorkoutBtn.addEventListener("click", ()=>{
  const s=loadState();
  const anyRep = activeSession.exercises.some(ex => (ex.sets||[]).some(v => String(v||"").trim() !== ""));
  if(!anyRep && !confirm("No reps entered. Save workout anyway?")) return;

  s.sessions.push(activeSession);
  s.plan.wDone[activeSession.workout]=true;
  s.plan.lastCompleted = new Date().toISOString();

  const done=s.plan.wDone;
  if(!done[1]) s.plan.nextWorkout=1;
  else if(!done[2]) s.plan.nextWorkout=2;
  else if(!done[3]) s.plan.nextWorkout=3;
  else {
    s.plan.week = (s.plan.week % PROGRAM.weeks) + 1;
    s.plan.wDone={1:false,2:false,3:false};
    s.plan.nextWorkout=1;
  }

  saveState(s);
  activeSession=null;

  panels.forEach(p=>p.classList.remove("active"));
  document.getElementById("home").classList.add("active");
  tabs.forEach(x=>x.classList.remove("active"));
  document.querySelector('[data-tab="home"]').classList.add("active");
  renderHome();
});

backHomeBtn.addEventListener("click", ()=>{
  panels.forEach(p=>p.classList.remove("active"));
  document.getElementById("home").classList.add("active");
  tabs.forEach(x=>x.classList.remove("active"));
  document.querySelector('[data-tab="home"]').classList.add("active");
  renderHome();
});

// ---------- History ----------
function renderHistory(){
  const s=loadState();
  const box=document.getElementById("historyList");
  box.innerHTML="";
  if(s.sessions.length===0){
    box.innerHTML = `<div class="muted">No workouts logged yet.</div>`;
    return;
  }
  [...s.sessions].reverse().forEach(sess=>{
    const div=document.createElement("div");
    div.className="exerciseCard";
    div.innerHTML=`
      <div class="exName">${sess.dateISO} • Week ${sess.week} • Workout ${sess.workout}</div>
      <div class="muted">${PROGRAM.workouts[sess.workout].title}</div>
    `;
    box.appendChild(div);
  });
}

// ---------- Reports ----------
let chart1=null, chart2=null;

function sessionStreak(state){
  const dates = [...new Set(state.sessions.map(s=>s.dateISO))].sort();
  if(dates.length===0) return 0;
  let streak=1;
  for(let i=dates.length-1;i>0;i--){
    const d1=new Date(dates[i]);
    const d0=new Date(dates[i-1]);
    const diff=(d1-d0)/(1000*60*60*24);
    if(diff===1) streak++;
    else break;
  }
  return streak;
}

function renderReports(){
  const s=loadState();
  document.getElementById("weeklyCompletionPill").textContent = `Weekly completion streak: ${approximateWeeklyCompletion(s)}`;
  document.getElementById("sessionStreakPill").textContent = `Session streak: ${sessionStreak(s)}`;

  const counts = {};
  s.sessions.forEach(sess=>{
    counts[`W${sess.week}`]=(counts[`W${sess.week}`]||0)+1;
  });
  const labels=Object.keys(counts);
  const data=labels.map(k=>counts[k]);

  const rpeLabels = s.sessions.map(x=>x.dateISO);
  const rpeData = s.sessions.map(sess=>{
    const vals=[];
    sess.exercises.forEach(e=>{
      const r=parseFloat(e.rpe||"");
      if(!isNaN(r)) vals.push(r);
    });
    if(vals.length===0) return null;
    return Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10;
  });

  const ctx1=document.getElementById("chartSessions");
  const ctx2=document.getElementById("chartRpe");
  if(chart1) chart1.destroy();
  if(chart2) chart2.destroy();

  chart1=new Chart(ctx1, {
    type:"bar",
    data:{ labels, datasets:[{ label:"Sessions", data }] },
    options:{ responsive:true, maintainAspectRatio:false }
  });

  chart2=new Chart(ctx2, {
    type:"line",
    data:{ labels:rpeLabels, datasets:[{ label:"Avg RPE", data:rpeData }] },
    options:{ responsive:true, maintainAspectRatio:false, spanGaps:true }
  });
}

// ---------- Export ----------
document.getElementById("exportCsvBtn").addEventListener("click", ()=>{
  const weeks = parseInt(document.getElementById("exportWeeks").value,10) || 6;
  const state = loadState();
  const csv = buildCSV(state, weeks);
  downloadText(csv, `strap-tracker-${weeks}w.csv`, "text/csv");

  state.lastExportAt = todayISO();
  saveState(state);
  renderHome();
});

document.getElementById("printPdfBtn").addEventListener("click", ()=>{
  const weeks = parseInt(document.getElementById("exportWeeks").value,10) || 6;
  const state = loadState();
  buildPrintView(state, weeks);

  state.lastExportAt = todayISO();
  saveState(state);
  renderHome();
  window.print();
});

function buildCSV(state, weeks){
  const cutoff = cutoffByWeeks(state, weeks);
  const rows = [];
  rows.push(`# Strap Workout Tracker, version v${APP_VERSION}`);
  rows.push(`# Exported: ${new Date().toISOString()}`);
  rows.push(["date","week","workout","exercise","set","reps","angle","tempo","rpe","notes"].join(","));
  state.sessions.filter(s=>cutoff(s)).forEach(sess=>{
    sess.exercises.forEach(ex=>{
      (ex.sets||[]).forEach((rep, idx)=>{
        rows.push([
          sess.dateISO,
          sess.week,
          sess.workout,
          safe(ex.name),
          idx+1,
          rep||"",
          safe(ex.angle||""),
          safe(ex.tempo||""),
          ex.rpe||"",
          safe(ex.notes||"")
        ].join(","));
      });
    });
  });
  return rows.join("\n");
}
function safe(x){ return `"${String(x).replaceAll('"','""')}"`; }

function cutoffByWeeks(state, weeks){
  const keep = weeks*3;
  const recent = state.sessions.slice(Math.max(0, state.sessions.length-keep));
  const ids = new Set(recent.map(s=>s.id));
  return (sess)=>ids.has(sess.id);
}

function downloadText(text, filename, mime){
  const blob=new Blob([text], {type:mime});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download=filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function buildPrintView(state, weeks){
  const area=document.getElementById("printArea");
  area.innerHTML = "";
  const cutoff = cutoffByWeeks(state, weeks);
  const sessions = state.sessions.filter(s=>cutoff(s));

  const wrap=document.createElement("div");
  wrap.innerHTML = `
    <div class="card">
      <h1>${PROGRAM.name}</h1>
      <div>App version: <b>v${APP_VERSION}</b></div>
      <div>Exported: <b>${new Date().toLocaleString()}</b></div>
      <div>Range: last ${weeks} week(s) (approx)</div>
      <div>Total sessions: ${sessions.length}</div>
      <div>Last export: ${state.lastExportAt || "never"}</div>
    </div>
  `;
  area.appendChild(wrap);

  sessions.forEach(sess=>{
    const c=document.createElement("div");
    c.className="card";
    c.innerHTML = `<h2>${sess.dateISO} — Week ${sess.week} — Workout ${sess.workout}</h2>`;
    sess.exercises.forEach(ex=>{
      const exDiv=document.createElement("div");
      exDiv.className="exerciseCard";
      exDiv.innerHTML = `
        <div><b>${ex.name}</b> <span class="muted">(${ex.repMin||""}-${ex.repMax||""})</span></div>
        <div class="muted">Angle: ${ex.angle||""} • Tempo: ${ex.tempo||""} • RPE: ${ex.rpe||""}</div>
        <div class="muted">Notes: ${ex.notes||""}</div>
        <div class="muted">Sets: ${(ex.sets||[]).map((r,i)=>`Set ${i+1}: ${r||"-"}`).join("  ")}</div>
      `;
      c.appendChild(exDiv);
    });
    area.appendChild(c);
  });
}

// ---------- Integrity ----------
const integrityResults = document.getElementById("integrityResults");
document.getElementById("runIntegrityBtn").addEventListener("click", ()=> runIntegrity(false));
document.getElementById("autoFixBtn").addEventListener("click", ()=> runIntegrity(true));
document.getElementById("downloadDebugBtn").addEventListener("click", ()=>{
  const s=loadState();
  downloadText(JSON.stringify(s,null,2), "strap-tracker-debug.json", "application/json");
});

function renderIntegritySummary(){
  integrityResults.innerHTML = `<div class="muted">Tap “Run Check” to scan your data.</div>`;
}

function runIntegrity(autoFix){
  const s=loadState();
  const issues = [];
  let fixed = 0;

  if(!s.plan || typeof s.plan.week !== "number") issues.push({level:"error", msg:"Missing or invalid plan state."});
  if(!Array.isArray(s.sessions)) issues.push({level:"error", msg:"Sessions is not an array."});

  (s.sessions||[]).forEach((sess, si)=>{
    if(!sess.id) { issues.push({level:"warn", msg:`Session ${si+1} missing id.`}); if(autoFix){ sess.id=uid(); fixed++; } }
    if(!sess.dateISO) { issues.push({level:"warn", msg:`Session ${si+1} missing date.`}); if(autoFix){ sess.dateISO=todayISO(); fixed++; } }
    if(!sess.workout || sess.workout<1 || sess.workout>3) issues.push({level:"error", msg:`Session ${sess.dateISO||"#"+(si+1)} has invalid workout number.`});
    if(!Array.isArray(sess.exercises)) issues.push({level:"error", msg:`Session ${sess.dateISO||"#"+(si+1)} missing exercises array.`});

    (sess.exercises||[]).forEach((ex, ei)=>{
      if(!ex.name) issues.push({level:"error", msg:`Session ${sess.dateISO||"#"+(si+1)} exercise ${ei+1} missing name.`});
      if(ex.rpe!=="" && ex.rpe!=null){
        const r = parseFloat(ex.rpe);
        if(isNaN(r) || r<1 || r>10){
          issues.push({level:"warn", msg:`${sess.dateISO} • ${ex.name}: RPE "${ex.rpe}" not in 1–10.`});
          if(autoFix){ ex.rpe=""; fixed++; }
        }
      }
      if(!Array.isArray(ex.sets)){
        issues.push({level:"warn", msg:`${sess.dateISO} • ${ex.name}: sets not an array.`});
        if(autoFix){ ex.sets=[]; fixed++; }
      } else {
        ex.sets.forEach((v, vi)=>{
          if(String(v||"").trim()==="") return;
          const n = parseInt(v,10);
          if(isNaN(n) || n<0 || n>300){
            issues.push({level:"warn", msg:`${sess.dateISO} • ${ex.name} set ${vi+1}: reps "${v}" invalid.`});
            if(autoFix){ ex.sets[vi]=""; fixed++; }
          }
        });
      }
    });
  });

  // Validate exercise list vs template
  (s.sessions||[]).forEach(sess=>{
    const expected = PROGRAM.workouts[sess.workout]?.exercises?.map(e=>e.name) || [];
    const got = (sess.exercises||[]).map(e=>e.name);
    const missing = expected.filter(n=>!got.includes(n));
    const extra = got.filter(n=>!expected.includes(n));
    if(missing.length){
      issues.push({level:"warn", msg:`${sess.dateISO} • Workout ${sess.workout}: missing exercises: ${missing.join(", ")}`});
    }
    if(extra.length){
      issues.push({level:"warn", msg:`${sess.dateISO} • Workout ${sess.workout}: extra exercises logged: ${extra.join(", ")}`});
    }
  });

  if(autoFix){
    saveState(s);
    renderHome();
  }

  integrityResults.innerHTML = "";
  const summary = document.createElement("div");
  summary.className="exerciseCard";
  summary.innerHTML = `
    <div class="exName">Scan complete</div>
    <div class="muted">Issues found: <b>${issues.length}</b> • Auto-fixes applied: <b>${fixed}</b></div>
  `;
  integrityResults.appendChild(summary);

  if(issues.length===0){
    const ok = document.createElement("div");
    ok.className="exerciseCard";
    ok.innerHTML = `<div class="muted">No issues found. Your data looks clean.</div>`;
    integrityResults.appendChild(ok);
    return;
  }

  issues.forEach(it=>{
    const div=document.createElement("div");
    div.className="exerciseCard";
    div.innerHTML = `<div class="exName">${it.level.toUpperCase()}</div><div class="muted">${it.msg}</div>`;
    integrityResults.appendChild(div);
  });
}

// ---------- Settings ----------
document.getElementById("resetBtn").addEventListener("click", ()=>{
  if(confirm("Delete all data on this phone?")){
    localStorage.removeItem(KEY);
    renderHome(); renderHistory(); renderReports();
    alert("Reset complete.");
  }
});

document.getElementById("resetWeekBtn").addEventListener("click", ()=>{
  const s=loadState();
  if(!confirm("Reset current week queue (Workout 1–3 checkmarks + Next Workout) without deleting history?")) return;
  s.plan.wDone = {1:false,2:false,3:false};
  s.plan.nextWorkout = 1;
  saveState(s);
  renderHome();
  alert("Week queue reset. Next up: Workout 1.");
});

document.getElementById("saveReminderBtn").addEventListener("click", ()=>{
  const s=loadState();
  const v = parseInt(document.getElementById("reminderDays").value,10);
  s.settings.exportReminderDays = (isNaN(v) || v<1) ? 14 : Math.min(90, v);
  saveState(s);
  renderHome();
  alert("Reminder saved.");
});

function renderSettings(){
  const s=loadState();
  document.getElementById("reminderDays").value = s.settings?.exportReminderDays ?? 14;
}

// Force Refresh (clears cached app files, keeps data)
document.getElementById("forceRefreshBtn").addEventListener("click", async ()=>{
  if(!confirm("Force refresh will clear cached app files and reload. Your workouts will NOT be deleted. Continue?")) return;
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch (e) {}
  const url = new URL(window.location.href);
  url.searchParams.set("v", APP_VERSION + "-" + Date.now());
  window.location.replace(url.toString());
});

// ---------- Service Worker ----------
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").catch(()=>{});
}

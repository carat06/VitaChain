const facilities = {
  blood: ['Apollo Blood Bank – Greams Rd', 'Global Health Blood Bank', 'LifeSource Blood Center', 'Fortis Blood Bank'],
  organ: ['Apollo Hospitals – Greams', 'MIOT International', 'Vijaya Hospital', 'Kauvery Hospital'],
};
const CITIES = ['Chennai','Mumbai','Delhi','Bengaluru'];

function updateDonorForm() {
  const t = document.getElementById('d-type').value;
  document.getElementById('organ-fields').classList.toggle('hidden', t !== 'organ');
  updateFacilityList();
}
function updatePatientForm() {
  const t = document.getElementById('p-type').value;
  document.getElementById('p-organ-field').classList.toggle('hidden', t !== 'organ');
}
function updateFacilityList() {
  const t = document.getElementById('d-type').value;
  const sel = document.getElementById('d-facility');
  sel.innerHTML = '';
  const city = document.getElementById('d-city').value;
  facilities[t].forEach(f => {
    const o = document.createElement('option');
    o.textContent = city + ' — ' + f;
    sel.appendChild(o);
  });
}
updateFacilityList();
document.getElementById('d-city').addEventListener('change', updateFacilityList);
document.getElementById('d-date').value = new Date().toISOString().split('T')[0];

// ──────────── DONOR SUBMIT ────────────
function submitDonation() {
  const name = document.getElementById('d-name').value.trim();
  if (!name) { showAlert('donor-alerts','Please enter your name.','warn'); return; }
  const id = 'VC' + (++state.idCounter);
  const type = document.getElementById('d-type').value;
  const organ = type === 'organ' ? document.getElementById('d-organ').value : null;
  const blood = document.getElementById('d-blood').value;
  const facility = document.getElementById('d-facility').value;

  const donation = {
    id, name, type, organ, blood, facility,
    status: 'registered',  // registered → procured → testing → approved/disposed
    createdAt: new Date().toLocaleString(),
    tempHistory: [],
  };
  state.donations.push(donation);
  showAlert('donor-alerts', `Donation ${id} registered! Head to ${facility}.`, 'success');
  renderDonorList();
  renderLabList();
  updateLabStats();
  document.getElementById('donation-status-card').style.display='block';
  renderDonorTimeline(donation);

  // auto-advance to procured after 2s (simulation)
  setTimeout(() => { donation.status = 'procured'; renderDonorList(); renderLabList(); renderDonorTimeline(donation); updateLabStats(); }, 2000);
}

function renderDonorList() {
  const list = document.getElementById('donor-list');
  const empty = document.getElementById('donor-empty');
  if (!state.donations.length) { list.innerHTML=''; empty.style.display=''; return; }
  empty.style.display = 'none';
  list.innerHTML = state.donations.map(d => `
    <div class="match-card">
      <div class="match-icon">${d.type==='blood'?'🩸':'🫀'}</div>
      <div class="match-info">
        <div class="match-name">${d.name} <span class="tag ${d.type==='blood'?'tag-blood':'tag-organ'}">${d.type==='blood'?d.blood:d.organ}</span></div>
        <div class="match-meta">${d.id} · ${d.facility}</div>
      </div>
      <span class="badge ${statusBadge(d.status)}">${d.status}</span>
    </div>
  `).join('');
  if (state.donations.length) renderDonorTimeline(state.donations[state.donations.length-1]);
}

function renderDonorTimeline(d) {
  const steps = [
    { key:'registered', label:'Donor Registered', sub: d.createdAt },
    { key:'procured', label:'Procurement', sub: d.facility },
    { key:'testing', label:'Lab Testing', sub: 'Blood type, disease screening' },
    { key:'approved', label:'Approved & Stored', sub: 'Entered cold storage' },
    { key:'dispatched', label:'Dispatched', sub: 'Custody transferred to vehicle' },
    { key:'delivered', label:'Delivered to Patient', sub: 'Journey complete' },
  ];
  const order = steps.map(s=>s.key);
  const cur = order.indexOf(d.status);
  const tl = document.getElementById('donor-timeline');
  tl.innerHTML = steps.map((s, i) => {
    let cls = i < cur ? 'done' : (i === cur ? 'active' : '');
    if (d.status === 'disposed' && i === 3) cls = 'error';
    return `<div class="tl-item">
      <div class="tl-dot ${cls}"></div>
      <div class="tl-title">${s.label}</div>
      <div class="tl-sub">${s.sub}</div>
    </div>`;
  }).join('');
}

function statusBadge(s) {
  const m = { registered:'badge-teal', procured:'badge-blue', testing:'badge-yellow',
               approved:'badge-green', disposed:'badge-red', dispatched:'badge-yellow',
               intransit:'badge-yellow', delivered:'badge-green' };
  return m[s] || 'badge-teal';
}

// ──────────── LAB / PROCUREMENT ────────────
function renderLabList() {
  const list = document.getElementById('lab-list');
  const empty = document.getElementById('lab-empty');
  const pending = state.donations.filter(d => ['procured','testing'].includes(d.status));
  if (!pending.length) { list.innerHTML=''; empty.style.display=''; return; }
  empty.style.display='none';
  list.innerHTML = pending.map(d => `
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div>
          <span style="font-size:15px;font-weight:700">${d.id}</span>
          <span class="tag ${d.type==='blood'?'tag-blood':'tag-organ'}" style="margin-left:8px">${d.type==='blood'?d.blood:d.organ}</span>
          <span class="badge ${statusBadge(d.status)}" style="margin-left:8px">${d.status}</span>
        </div>
        <div style="font-size:12px;color:var(--text-dim)">${d.name} · ${d.facility}</div>
      </div>
      ${d.status === 'procured' ? `
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-warn btn-sm" onclick="runTests('${d.id}')">▶ Run Tests</button>
        </div>` : ''}
      ${d.status === 'testing' ? `
        <div class="alert alert-warn">🔬 Testing in progress…</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" onclick="approveTest('${d.id}')">✓ Approve</button>
          <button class="btn btn-danger btn-sm" onclick="disposeTest('${d.id}')">✕ Dispose (Fail)</button>
        </div>` : ''}
    </div>
  `).join('');
}

function updateLabStats() {
  document.getElementById('stat-pending').textContent = state.donations.filter(d=>['procured','testing'].includes(d.status)).length;
  document.getElementById('stat-approved').textContent = state.donations.filter(d=>d.status==='approved'||d.status==='dispatched'||d.status==='intransit'||d.status==='delivered').length;
  document.getElementById('stat-disposed').textContent = state.donations.filter(d=>d.status==='disposed').length;
}

function runTests(id) {
  const d = state.donations.find(x=>x.id===id);
  d.status = 'testing';
  renderLabList(); updateLabStats(); renderDonorList();
  setTimeout(()=>{ renderLabList(); }, 100);
}

function approveTest(id) {
  const d = state.donations.find(x=>x.id===id);
  d.status = 'approved';
  // add to storage
  const unit = {
    id: d.id,
    type: d.type,
    blood: d.blood,
    organ: d.organ,
    donor: d.name,
    facility: d.facility,
    storedAt: new Date().toLocaleTimeString(),
    temp: d.type==='blood' ? 4.2 : -4.5,
    tempSafe: true,
    lifecycle: d.type==='blood' ? 42 : (d.type==='organ' ? getDaylife(d.organ) : 42),
    daysLeft: d.type==='blood' ? 42 : getDaylife(d.organ),
    matched: false,
  };
  state.storage.push(unit);
  renderLabList(); updateLabStats(); renderDonorList(); renderStorage(); updateStorageStats();
  if(state.donations.find(x=>x.id===id)) renderDonorTimeline(state.donations.find(x=>x.id===id));
}

function getDaylife(organ) {
  const m = { Kidney:30, Liver:1, Heart:0.17, Lungs:0.25, Pancreas:1, Cornea:14 };
  return m[organ] || 5;
}

function disposeTest(id) {
  const d = state.donations.find(x=>x.id===id);
  d.status = 'disposed';
  renderLabList(); updateLabStats(); renderDonorList(); renderDonorTimeline(d);
}

// ──────────── STORAGE ────────────
function renderStorage() {
  const list = document.getElementById('storage-list');
  const empty = document.getElementById('storage-empty');
  const avail = state.storage.filter(u=>!u.matched);
  if (!state.storage.length) { list.innerHTML=''; empty.style.display=''; return; }
  empty.style.display='none';
  list.innerHTML = state.storage.map(u => {
    const pct = Math.min(100, ((u.lifecycle - u.daysLeft)/u.lifecycle)*100);
    const color = u.tempSafe ? 'var(--accent)' : 'var(--danger)';
    const tempPct = u.type==='blood' ? ((u.temp - 1)/(8-1)*100) : ((u.temp - (-10))/(0-(-10))*100);
    const tempColor = u.tempSafe ? 'var(--safe)' : 'var(--danger)';
    const circ = 2*Math.PI*14;
    return `
    <div class="storage-item" style="${!u.tempSafe?'border-color:var(--danger);background:rgba(231,76,60,.06);':''}">
      <div class="progress-ring">
        <svg width="38" height="38" viewBox="0 0 38 38">
          <circle cx="19" cy="19" r="14" fill="none" stroke="var(--border)" stroke-width="3"/>
          <circle cx="19" cy="19" r="14" fill="none" stroke="${color}" stroke-width="3"
            stroke-dasharray="${circ}" stroke-dashoffset="${circ*(1-pct/100)}" stroke-linecap="round"/>
        </svg>
      </div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-size:13px;font-weight:700">${u.id}</span>
          <span class="tag ${u.type==='blood'?'tag-blood':'tag-organ'}">${u.type==='blood'?u.blood:u.organ}</span>
          ${u.matched?'<span class="badge badge-yellow">Matched</span>':''}
          ${!u.tempSafe?'<span class="badge badge-red flicker">⚠ TEMP ALERT</span>':''}
        </div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px">
          Donor: ${u.donor} · Stored: ${u.storedAt} · ${u.daysLeft.toFixed(2)}d remaining
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--text-dim)">🌡️</span>
          <div class="temp-bar-wrap" style="flex:1">
            <div class="temp-bar" style="width:${Math.max(0,Math.min(100,tempPct))}%;background:${tempColor}"></div>
          </div>
          <span class="temp-mini" style="color:${tempColor}">${u.temp.toFixed(1)}°C</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function updateStorageStats() {
  document.getElementById('stor-total').textContent = state.storage.length;
  document.getElementById('stor-critical').textContent = state.storage.filter(u=>!u.tempSafe).length;
  document.getElementById('stor-expiring').textContent = state.storage.filter(u=>u.daysLeft<3).length;
}

// ──────────── PATIENT / HOSPITAL ────────────
function submitPatientRequest() {
  const name = document.getElementById('p-name').value.trim();
  if (!name) { return; }
  const type = document.getElementById('p-type').value;
  const blood = document.getElementById('p-blood').value;
  const organ = document.getElementById('p-organ').value;
  const urgency = document.getElementById('p-urgency').value;

  const req = {
    id: 'RQ'+(++state.idCounter),
    name, type, blood, organ: type==='organ'?organ:null,
    urgency, status: 'searching', createdAt: new Date().toLocaleTimeString(),
  };
  state.requests.push(req);

  // find matches in storage
  const matches = state.storage.filter(u => {
    if (u.matched) return false;
    if (u.type !== type) return false;
    if (type==='blood') return isCompatible(u.blood, blood);
    return u.organ === req.organ;
  });

  renderMatchResults(matches, req);
  renderPatientRequestList();
}

function isCompatible(donor, recipient) {
  const compat = {
    'O-': ['O-','O+','A-','A+','B-','B+','AB-','AB+'],
    'O+': ['O+','A+','B+','AB+'],
    'A-': ['A-','A+','AB-','AB+'],
    'A+': ['A+','AB+'],
    'B-': ['B-','B+','AB-','AB+'],
    'B+': ['B+','AB+'],
    'AB-': ['AB-','AB+'],
    'AB+': ['AB+'],
  };
  return (compat[donor] || []).includes(recipient);
}

function renderMatchResults(matches, req) {
  const div = document.getElementById('match-results');
  if (!matches.length) {
    div.innerHTML = `<div class="alert alert-warn">⚠ No compatible ${req.type} units found for ${req.name} (${req.blood}). Unit will remain in storage until lifecycle ends.</div>`;
    return;
  }
  div.innerHTML = `<div class="alert alert-success">✓ Found ${matches.length} compatible unit(s) for ${req.name}</div>` +
    matches.map(u => `
      <div class="match-card matched">
        <div class="match-icon">${u.type==='blood'?'🩸':'🫀'}</div>
        <div class="match-info">
          <div class="match-name">${u.id} — ${u.type==='blood'?u.blood:u.organ} <span style="font-size:12px;color:var(--text-dim)">Donor: ${u.donor}</span></div>
          <div class="match-meta">Stored at: ${u.storedAt} · ${u.temp.toFixed(1)}°C · ${u.daysLeft.toFixed(2)}d left</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="assignDispatch('${u.id}','${req.id}')">Pack & Dispatch →</button>
      </div>
    `).join('');
}

function renderPatientRequestList() {
  const list = document.getElementById('patient-requests-list');
  const empty = document.getElementById('patient-req-empty');
  if (!state.requests.length) { list.innerHTML=''; empty.style.display=''; return; }
  empty.style.display='none';
  list.innerHTML = state.requests.map(r => `
    <div class="storage-item">
      <div style="font-size:20px">${r.type==='blood'?'🩸':'🫀'}</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:14px">${r.name} <span class="badge ${r.urgency==='critical'?'badge-red':'badge-yellow'}">${r.urgency}</span></div>
        <div style="font-size:12px;color:var(--text-dim)">${r.id} · ${r.type==='blood'?r.blood:r.organ} · ${r.createdAt}</div>
      </div>
      <span class="badge ${statusBadge(r.status)}">${r.status}</span>
    </div>
  `).join('');
}

function updatePatientForm() {
  const t = document.getElementById('p-type').value;
  document.getElementById('p-organ-field').classList.toggle('hidden', t!=='organ');
}

// ──────────── DISPATCH ────────────
function assignDispatch(unitId, reqId) {
  const unit = state.storage.find(u=>u.id===unitId);
  const req = state.requests.find(r=>r.id===reqId);
  if (!unit || !req) return;
  unit.matched = true;
  req.status = 'dispatched';

  const dispId = 'DS'+(++state.idCounter);
  const dispatch = {
    id: dispId,
    unitId, reqId,
    patient: req.name,
    type: unit.type,
    blood: unit.blood,
    organ: unit.organ,
    container: 'CTR-'+Math.floor(Math.random()*900+100),
    vehicle: ['Ambulance KA-09','Ambulance MH-12','Delivery Van TN-01','Courier EN-22'][Math.floor(Math.random()*4)],
    temp: unit.temp,
    tempSafe: true,
    status: 'packing', // packing → custody → intransit → delivered
    gpsLat: 13.0827, gpsLng: 80.2707,
    destLat: 13.0600, destLng: 80.2500,
    progress: 0,
    alerts: [],
    log: ['Dispatch record created — ' + new Date().toLocaleTimeString()],
    createdAt: new Date().toLocaleTimeString(),
  };
  state.dispatches.push(dispatch);

  // update donor donation status
  const donation = state.donations.find(d=>d.id===unitId);
  if (donation) { donation.status = 'dispatched'; renderDonorList(); renderDonorTimeline(donation); }

  renderDispatch();
  renderPatientTracking();
  renderPatientRequestList();
  renderMatchResults([], req);

  // Simulate packing → custody
  setTimeout(()=>{
    dispatch.status='custody';
    dispatch.log.push('Container '+dispatch.container+' assigned · Custody transferred to '+dispatch.vehicle+' — '+new Date().toLocaleTimeString());
    renderDispatch(); renderPatientTracking();
  }, 2000);
}

function renderDispatch() {
  const list = document.getElementById('dispatch-list');
  const empty = document.getElementById('dispatch-empty');
  if (!state.dispatches.length) { list.innerHTML=''; empty.style.display=''; return; }
  empty.style.display='none';
  list.innerHTML = state.dispatches.map(d => {
    const tempColor = d.tempSafe ? 'var(--safe)' : 'var(--danger)';
    return `
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
        <div>
          <span style="font-weight:800;font-size:15px">${d.id}</span>
          <span class="tag ${d.type==='blood'?'tag-blood':'tag-organ'}" style="margin-left:8px">${d.type==='blood'?d.blood:d.organ}</span>
          <span class="badge ${statusBadge(d.status)}" style="margin-left:8px">${d.status}</span>
        </div>
        <span style="font-size:12px;color:var(--text-dim)">Patient: ${d.patient} · ${d.vehicle}</span>
      </div>

      ${d.alerts.map(a=>`<div class="alert alert-danger">⚠ ${a}</div>`).join('')}

      <div class="grid-2" style="margin-bottom:12px">
        <div>
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px;text-transform:uppercase;letter-spacing:1px">Container</div>
          <div class="mono" style="font-size:13px">${d.container}</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:8px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px">Live Temperature</div>
          <div class="temp-reading" style="color:${tempColor}">${d.temp.toFixed(1)}°C ${!d.tempSafe?'⚠':'✓'}</div>
          <div class="temp-bar-wrap">
            <div class="temp-bar" style="width:${Math.max(0,Math.min(100,((d.temp-(-15))/(20-(-15)))*100))}%;background:${tempColor}"></div>
          </div>
          <div style="font-size:10px;color:var(--text-dim)">Safe range: ${d.type==='blood'?'2–6°C':'-10–0°C'}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px;text-transform:uppercase;letter-spacing:1px"><span class="gps-dot"></span>GPS Location</div>
          <div class="mono" style="font-size:12px">Lat: ${d.gpsLat.toFixed(4)}</div>
          <div class="mono" style="font-size:12px">Lng: ${d.gpsLng.toFixed(4)}</div>
          <div style="font-size:12px;color:var(--text-dim);margin-top:6px">Progress: ${d.progress.toFixed(0)}%</div>
          <div class="temp-bar-wrap"><div class="temp-bar" style="width:${d.progress}%;background:var(--accent)"></div></div>
        </div>
      </div>

      <div class="map-area" style="margin-bottom:12px">
        <div class="map-grid"></div>
        <div class="map-label" style="left:10px;top:10px">📍 Origin: Storage</div>
        <div class="map-label" style="right:10px;bottom:10px">🏥 Destination: Hospital</div>
        <div class="map-vehicle" style="left:${10+d.progress*0.75}%;top:${50-d.progress*0.2}%">
          ${d.type==='blood'?'🚑':'✈️'}
        </div>
        <svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 10,60 Q 50,20 90,80" fill="none" stroke="rgba(0,229,176,0.2)" stroke-width="1.5" stroke-dasharray="3,2"/>
          <path d="M 10,60 Q 50,20 90,80" fill="none" stroke="var(--accent)" stroke-width="1.5"
            stroke-dasharray="${d.progress*1.3} 200" stroke-linecap="round"/>
        </svg>
      </div>

      <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Event Log</div>
      <div style="background:var(--surface2);border-radius:6px;padding:10px;max-height:100px;overflow-y:auto">
        ${d.log.map(l=>`<div class="mono" style="font-size:11px;color:var(--text-dim);margin-bottom:3px">▸ ${l}</div>`).join('')}
      </div>

      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
        ${d.status==='custody'?`<button class="btn btn-primary btn-sm" onclick="startTransit('${d.id}')">▶ Start Transit</button>`:''}
        ${d.status==='intransit'?`<button class="btn btn-primary btn-sm" onclick="markDelivered('${d.id}')">✓ Mark Delivered</button>`:''}
        ${d.status==='intransit'?`<button class="btn btn-warn btn-sm" onclick="triggerTempAlert('${d.id}')">🌡 Simulate Temp Fail</button>`:''}
      </div>
    </div>`;
  }).join('');
}

function startTransit(id) {
  const d = state.dispatches.find(x=>x.id===id);
  d.status = 'intransit';
  d.log.push('Vehicle departed · GPS tracking active — '+new Date().toLocaleTimeString());

  // update donation
  const donation = state.donations.find(x=>x.id===d.unitId);
  if (donation) { donation.status = 'intransit'; renderDonorList(); renderDonorTimeline(donation); }

  renderDispatch(); renderPatientTracking();
  // simulate movement
  const interval = setInterval(()=>{
    if (d.progress >= 100 || d.status==='delivered') { clearInterval(interval); return; }
    d.progress = Math.min(100, d.progress + (Math.random()*3+1));
    d.gpsLat -= 0.001*Math.random();
    d.gpsLng -= 0.0008*Math.random();
    // random temp drift
    const drift = (Math.random()-0.48)*0.3;
    d.temp = parseFloat((d.temp + drift).toFixed(2));
    const safe = d.type==='blood' ? (d.temp>=2&&d.temp<=6) : (d.temp>=-10&&d.temp<=0);
    if (!safe && d.tempSafe) {
      d.tempSafe = false;
      d.alerts.push(`Temperature out of safe range: ${d.temp.toFixed(1)}°C at ${new Date().toLocaleTimeString()}`);
      d.log.push(`⚠ TEMP ALERT: ${d.temp.toFixed(1)}°C — outside safe zone!`);
      showAlert('dispatch-alerts',`🚨 CRITICAL: ${d.id} temperature alert — ${d.temp.toFixed(1)}°C`, 'danger');
    } else if (safe) {
      d.tempSafe = true;
    }
    renderDispatch(); renderPatientTracking();
    renderStorage();
  }, 1500);
  d._interval = interval;
}

function markDelivered(id) {
  const d = state.dispatches.find(x=>x.id===id);
  if (d._interval) clearInterval(d._interval);
  d.status = 'delivered';
  d.progress = 100;
  d.log.push('✓ Delivered to patient · Journey closed — '+new Date().toLocaleTimeString());

  const donation = state.donations.find(x=>x.id===d.unitId);
  if (donation) { donation.status = 'delivered'; renderDonorList(); renderDonorTimeline(donation); }
  const req = state.requests.find(r=>r.id===d.reqId);
  if (req) req.status = 'delivered';

  // remove from storage
  const idx = state.storage.findIndex(u=>u.id===d.unitId);
  if (idx !== -1) state.storage.splice(idx,1);

  renderDispatch(); renderPatientTracking(); renderStorage(); updateStorageStats(); renderPatientRequestList();
  showAlert('dispatch-alerts', `✓ Journey ${id} closed. Organ/blood delivered successfully.`, 'success');
}

function triggerTempAlert(id) {
  const d = state.dispatches.find(x=>x.id===id);
  d.temp = d.type==='blood' ? 15 : 5;
  d.tempSafe = false;
  d.alerts.push(`Manual temp simulation: ${d.temp}°C — UNSAFE at ${new Date().toLocaleTimeString()}`);
  d.log.push(`⚠ Temp spike simulated: ${d.temp}°C`);
  showAlert('dispatch-alerts',`🚨 TEMP FAILURE on dispatch ${id}: ${d.temp}°C recorded!`,'danger');
  renderDispatch(); renderPatientTracking();
}

// ──────────── PATIENT TRACKING ────────────
function renderPatientTracking() {
  const list = document.getElementById('patient-tracking-list');
  const empty = document.getElementById('pt-empty');
  const active = state.dispatches.filter(d=>['custody','intransit'].includes(d.status));
  const closed = state.dispatches.filter(d=>d.status==='delivered');

  if (!state.dispatches.length) { list.innerHTML=''; empty.style.display=''; return; }
  empty.style.display='none';

  list.innerHTML = closed.map(d=>`
    <div class="card journey-closed">
      <div class="big-icon">🎉</div>
      <h2>Journey Complete — ${d.id}</h2>
      <p style="color:var(--text-dim)">The ${d.type==='blood'?'blood unit ('+d.blood+')':d.organ} has been successfully delivered to ${d.patient}.<br/>Journey closed at ${d.log[d.log.length-1].split('—')[1]||'just now'}.</p>
    </div>
  `).join('') + active.map(d=>{
    const tempColor = d.tempSafe ? 'var(--safe)' : 'var(--danger)';
    return `
    <div class="card">
      <div class="card-title"><span class="gps-dot"></span>Live Tracking — ${d.id}</div>
      ${d.alerts.map(a=>`<div class="alert alert-danger">⚠ ${a}</div>`).join('')}
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:13px;color:var(--text-dim)">Delivering to</div>
        <div style="font-size:20px;font-weight:800">${d.patient}</div>
        <div style="font-size:13px;color:var(--text-dim)">${d.type==='blood'?'Blood ('+d.blood+')':d.organ} · ${d.vehicle}</div>
      </div>

      <div class="map-area" style="margin-bottom:16px">
        <div class="map-grid"></div>
        <div class="map-label" style="left:10px;top:10px">📍 Origin</div>
        <div class="map-label" style="right:10px;bottom:10px">🏥 ${d.patient}</div>
        <div class="map-vehicle" style="left:${10+d.progress*0.75}%;top:${50-d.progress*0.2}%">
          ${d.type==='blood'?'🚑':'✈️'}
        </div>
        <svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 10,60 Q 50,20 90,80" fill="none" stroke="rgba(0,229,176,0.2)" stroke-width="1.5" stroke-dasharray="3,2"/>
          <path d="M 10,60 Q 50,20 90,80" fill="none" stroke="var(--accent)" stroke-width="1.5"
            stroke-dasharray="${d.progress*1.3} 200" stroke-linecap="round"/>
        </svg>
      </div>

      <div class="grid-2">
        <div>
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">ETA Progress</div>
          <div class="temp-bar-wrap"><div class="temp-bar" style="width:${d.progress}%;background:var(--accent)"></div></div>
          <div style="font-size:13px;font-weight:700;margin-top:4px">${d.progress.toFixed(0)}% en route</div>
          <div class="mono" style="font-size:11px;color:var(--text-dim);margin-top:4px">
            GPS: ${d.gpsLat.toFixed(4)}, ${d.gpsLng.toFixed(4)}
          </div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">Live Temperature</div>
          <div class="temp-bar-wrap"><div class="temp-bar" style="width:${Math.max(0,Math.min(100,((d.temp-(-15))/(20-(-15)))*100))}%;background:${tempColor}"></div></div>
          <div style="font-size:20px;font-weight:800;color:${tempColor}">${d.temp.toFixed(1)}°C</div>
          <div style="font-size:11px;color:${d.tempSafe?'var(--safe)':'var(--danger)'}">${d.tempSafe?'✓ Temperature Safe':'⚠ TEMPERATURE UNSAFE!'}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ──────────── ALERT HELPER ────────────
function showAlert(containerId, msg, type='success') {
  const div = document.getElementById(containerId);
  if (!div) return;
  const a = document.createElement('div');
  a.className = `alert alert-${type}`;
  a.textContent = msg;
  div.prepend(a);
  setTimeout(()=>a.remove(), 6000);
}

// ──────────── STORAGE TEMP SIMULATION ────────────
setInterval(()=>{
  let hasAlert = false;
  state.storage.forEach(u => {
    const drift = (Math.random()-0.49)*0.2;
    u.temp = parseFloat((u.temp + drift).toFixed(2));
    const safe = u.type==='blood' ? (u.temp>=1&&u.temp<=8) : (u.temp>=-10&&u.temp<=0);
    if (!safe && u.tempSafe) {
      u.tempSafe = false;
      showAlert('storage-alerts',`⚠ Unit ${u.id} temp out of range: ${u.temp.toFixed(1)}°C`,'danger');
      hasAlert = true;
    } else if (safe && !u.tempSafe) {
      u.tempSafe = true;
    }
    // lifecycle decay
    u.daysLeft = Math.max(0, u.daysLeft - 0.001);
  });
  if (state.storage.length) { renderStorage(); updateStorageStats(); }
}, 2000);

// ──────────── NAVIGATION ────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.role-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  event.target.classList.add('active');
}

// init renders
renderDonorList();
renderLabList();
renderStorage();
renderPatientTracking();
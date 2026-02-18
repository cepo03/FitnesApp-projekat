// Ako želiš da frontend direktno zove backend (bez proxy), u .env stavi npr. VITE_API_URL=http://127.0.0.1:5000/api
const API_BASE = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/$/, '')) || '/api';

function getToken() {
  return localStorage.getItem('token');
}

function headers(includeAuth = true) {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth && getToken()) h['Authorization'] = 'Bearer ' + getToken();
  return h;
}

async function parseResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || res.statusText || 'Greška na serveru' };
  }
  return data;
}

export async function register(username, email, password) {
  const res = await fetch(API_BASE + '/auth/register', {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify({ username, email, password })
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Registracija nije uspela');
  return data;
}

export async function login(email, password) {
  const res = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify({ email, password })
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Prijava nije uspela');
  return data;
}

export async function getMe() {
  const res = await fetch(API_BASE + '/auth/me', { headers: headers() });
  if (res.status === 401) return null;
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Greška učitavanja korisnika');
  return data;
}

// Plans
export async function getPlans() {
  const tok = getToken();
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/27a8b257-0ff6-46c7-bca9-4e9dbedef60f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:getPlans',message:'getPlans called',data:{hasToken:!!tok,tokenLen:tok?tok.length:0,apiBase:API_BASE},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  const res = await fetch(API_BASE + '/plans', { headers: headers() });
  const data = await parseResponse(res);
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/27a8b257-0ff6-46c7-bca9-4e9dbedef60f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:getPlans:after',message:'getPlans response',data:{status:res.status,ok:res.ok,dataError:data&&data.error},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  if (!res.ok) throw new Error(data.error || 'Greška učitavanja planova');
  return data;
}

export async function createPlan(name, description, duration_months) {
  const body = { name, description, duration_months: duration_months || 1 };
  const tok = getToken();
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/27a8b257-0ff6-46c7-bca9-4e9dbedef60f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:createPlan',message:'createPlan called',data:{hasToken:!!tok,name:name},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
  const res = await fetch(API_BASE + '/plans', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body)
  });
  const data = await parseResponse(res);
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/27a8b257-0ff6-46c7-bca9-4e9dbedef60f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:createPlan:after',message:'createPlan response',data:{status:res.status,ok:res.ok,dataError:data&&data.error},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  if (!res.ok) throw new Error(data.error || 'Greška kreiranja plana');
  return data;
}

export async function updatePlan(id, payload) {
  const res = await fetch(API_BASE + '/plans/' + id, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(payload)
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Greška izmene plana');
  return data;
}

export async function deletePlan(id) {
  const res = await fetch(API_BASE + '/plans/' + id, { method: 'DELETE', headers: headers() });
  if (!res.ok) {
    const data = await parseResponse(res);
    throw new Error(data.error || 'Greška brisanja plana');
  }
}

// Exercises
export async function addExercise(planId, name, repetitions, sets) {
  const res = await fetch(API_BASE + '/plans/' + planId + '/exercises', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, repetitions: repetitions || 10, sets: sets || 3 })
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Greška dodavanja vežbe');
  return data;
}

export async function updateExercise(planId, exerciseId, payload) {
  const res = await fetch(API_BASE + '/plans/' + planId + '/exercises/' + exerciseId, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(payload)
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Greška izmene vežbe');
  return data;
}

export async function deleteExercise(planId, exerciseId) {
  const res = await fetch(API_BASE + '/plans/' + planId + '/exercises/' + exerciseId, {
    method: 'DELETE',
    headers: headers()
  });
  if (!res.ok) {
    const data = await parseResponse(res);
    throw new Error(data.error || 'Greška brisanja vežbe');
  }
}

// Progress
export async function getProgressDays(year, month) {
  let url = API_BASE + '/progress/days';
  if (year != null && month != null) url += '?year=' + year + '&month=' + month;
  const res = await fetch(url, { headers: headers() });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(Array.isArray(data) ? 'Greška učitavanja napretka' : (data.error || 'Greška učitavanja napretka'));
  return Array.isArray(data) ? data : [];
}

export async function markProgressDay(dayDate, notes = '') {
  const res = await fetch(API_BASE + '/progress/days', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ day_date: dayDate, notes })
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Greška snimanja');
  return data;
}

export async function unmarkProgressDay(dayDate) {
  const res = await fetch(API_BASE + '/progress/days/' + dayDate, {
    method: 'DELETE',
    headers: headers()
  });
  if (!res.ok) {
    const data = await parseResponse(res);
    throw new Error(data.error || 'Greška uklanjanja');
  }
}

export async function getProgressStats() {
  const res = await fetch(API_BASE + '/progress/stats', { headers: headers() });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Greška učitavanja statistike');
  return data;
}

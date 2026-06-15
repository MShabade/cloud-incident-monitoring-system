const BASE_URL = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// 🔐 1. SESSION DISPATCH ACCESS
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault(); 
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Access credentials refused.');

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.user.role);
    localStorage.setItem('username', data.user.username);
    
    showDashboard();
  } catch (err) {
    alert('⚠️ Access Refused: ' + err.message);
  }
});

function showDashboard() {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('dashboardView').classList.remove('hidden');
  
  const currentRole = localStorage.getItem('role');
  document.getElementById('userBadge').innerText = localStorage.getItem('username');
  document.getElementById('roleBadge').innerText = currentRole;
  
  const reportSection = document.getElementById('reportSection');
  if (currentRole === 'Guest') {
    reportSection.classList.add('hidden');
  } else {
    reportSection.classList.remove('hidden');
  }

  loadIncidents();
}

// 🗄️ 2. READ PROTOCOL MAPPER WITH NEW STATUS CORES
async function loadIncidents() {
  try {
    const res = await fetch(`${BASE_URL}/incidents`, { method: 'GET', headers: getHeaders() });
    const incidents = await res.json();
    
    const container = document.getElementById('incidentTableBody');
    container.innerHTML = '';
    const currentRole = localStorage.getItem('role');

    // KPI Counter Interlocks
    const activeCritical = incidents.filter(i => i.severity === 'High' && i.status === 'Open');
    document.getElementById('kpiCriticalCount').innerText = activeCritical.length;

    if (incidents.length === 0) {
      container.innerHTML = `<div class="text-center text-slate-600 italic py-4">No data tracks registered on cloud cluster collections.</div>`;
      return;
    }

    incidents.forEach(inc => {
      // Color Gating based on the state variable attributes
      const statusBorderColor = inc.status === 'Resolved' ? 'border-l-emerald-500' :
                                inc.status === 'Hold' ? 'border-l-amber-500 animate-pulse' :
                                inc.severity === 'High' ? 'border-l-red-500' : 'border-l-blue-500';

      const badgeStyle = inc.status === 'Resolved' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800' :
                         inc.status === 'Hold' ? 'text-amber-400 bg-amber-950/40 border-amber-900' :
                         inc.severity === 'High' ? 'text-red-400 bg-red-950/40 border-red-900' : 'text-slate-400 bg-[#252834] border-[#373c4d]';

      const blockRow = document.createElement('div');
      blockRow.className = `bg-[#21232d] p-2 rounded border border-[#2d313e] border-l-4 ${statusBorderColor} flex justify-between items-center gap-2`;
      
      blockRow.innerHTML = `
        <div class="truncate flex-1">
          <div class="flex items-center gap-1.5">
            <span class="text-white font-bold tracking-tight">${inc.title}</span>
            <span class="text-[9px] px-1 rounded border font-mono ${badgeStyle}">${inc.status.toUpperCase()}</span>
            <span class="text-slate-500 text-[10px] font-medium">[${inc.issueType}]</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">${inc.description}</div>
          <div class="text-[9px] text-slate-500 font-mono mt-0.5">Owner: <span class="text-blue-400 font-bold">${inc.assignedTo}</span> | Platform: <span class="text-slate-300 font-bold">${inc.cloudService}</span></div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          ${currentRole === 'Administrator' ? 
            `<button onclick="openEditModal('${inc._id}', '${escape(inc.title)}', '${escape(inc.description)}', '${inc.cloudService}', '${inc.severity}', '${inc.status}', '${inc.issueType}', '${escape(inc.assignedTo)}')" class="px-1.5 py-0.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded border border-blue-500/20 text-[9px] font-bold transition-all">Edit</button>
             <button onclick="deleteIncident('${inc._id}')" class="px-1.5 py-0.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded border border-red-500/20 text-[9px] font-bold transition-all">✖</button>` : 
            `<span class="text-[9px] text-slate-600 italic">Locked</span>`
          }
        </div>
      `;
      container.appendChild(blockRow);
    });
  } catch (err) {
    console.error('Failed processing telemetry tracks:', err);
  }
}

// 📤 3. WRITE PIPELINE FOR EXPANDED PAYLOADS
document.getElementById('incidentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    issueType: document.getElementById('issueType').value,
    assignedTo: document.getElementById('assignedTo').value || 'Unassigned NOC Operator',
    cloudService: document.getElementById('cloudService').value,
    severity: document.getElementById('severity').value
  };

  try {
    const res = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Packet serialization mismatch on DB write.');
    document.getElementById('incidentForm').reset();
    loadIncidents(); 
  } catch (err) {
    alert('❌ Dispatch Blocked: ' + err.message);
  }
});

// ✏️ 4. MUTATION PATCH INTERLOCK CORES
window.openEditModal = (id, title, desc, service, severity, status, type, assignee) => {
  document.getElementById('editId').value = id;
  document.getElementById('editTitle').value = unescape(title);
  document.getElementById('editDescription').value = unescape(desc);
  document.getElementById('editCloudService').value = service;
  document.getElementById('editSeverity').value = severity;
  document.getElementById('editStatus').value = status;
  document.getElementById('editIssueType').value = type;
  document.getElementById('editAssignedTo').value = unescape(assignee);
  
  document.getElementById('editModal').classList.remove('hidden');
};

window.closeEditModal = () => {
  document.getElementById('editModal').classList.add('hidden');
  document.getElementById('editForm').reset();
};

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const payload = {
    title: document.getElementById('editTitle').value,
    description: document.getElementById('editDescription').value,
    issueType: document.getElementById('editIssueType').value,
    assignedTo: document.getElementById('editAssignedTo').value,
    cloudService: document.getElementById('editCloudService').value,
    severity: document.getElementById('editSeverity').value,
    status: document.getElementById('editStatus').value
  };

  try {
    const res = await fetch(`${BASE_URL}/incidents/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Cloud cluster rejected mutation patch parameters.');
    
    closeEditModal();
    loadIncidents(); 
  } catch (err) {
    alert('❌ Update Refused: ' + err.message);
  }
});

// 🗑️ 5. ERASURE PROTOCOLS
window.deleteIncident = async (id) => {
  if (!confirm('Erase selected asset log trace line item document permanently?')) return;
  try {
    const res = await fetch(`${BASE_URL}/incidents/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Authorization structural permissions error.');
    loadIncidents();
  } catch (err) {
    alert('❌ Request Aborted: ' + err.message);
  }
};

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  window.location.reload();
});
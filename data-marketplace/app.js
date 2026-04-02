// ── Demo Users ────────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { name: 'Alex Johnson',   email: 'alex.johnson@mas.gov.sg',   department: 'Research',   role: 'Analyst',  color: '#5925DC', initials: 'AJ', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { name: 'Priya Sharma',   email: 'priya.sharma@mas.gov.sg',   department: 'Research',   role: 'DivHead',  color: '#B8962E', initials: 'PS', avatar: 'https://randomuser.me/api/portraits/women/79.jpg' },
  { name: 'Sarah Chen',     email: 'sarah.chen@mas.gov.sg',     department: 'Trading',    role: 'DivHead',  color: '#0F71BB', initials: 'SC', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
  { name: 'Michael Torres', email: 'michael.torres@mas.gov.sg', department: 'Risk',       role: 'DivHead',  color: '#D7260F', initials: 'MT', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
  { name: 'James Okafor',   email: 'james.okafor@mas.gov.sg',   department: 'Compliance', role: 'DivHead',  color: '#0A8217', initials: 'JO', avatar: 'https://randomuser.me/api/portraits/men/91.jpg' },
  { name: 'David Kim',      email: 'david.kim@mas.gov.sg',      department: 'Operations', role: 'Analyst',  color: '#344054', initials: 'DK', avatar: 'https://randomuser.me/api/portraits/men/34.jpg' },
];

// ── Login / Logout ────────────────────────────────────────────────────────────
function renderLoginPage() {
  const grid = document.getElementById('login-user-grid');
  grid.innerHTML = DEMO_USERS.map(u => `
    <button class="login-user-btn" onclick="loginAs('${u.email}')">
      <img class="login-user-avatar-img" src="${u.avatar}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
           alt="${u.name}" />
      <div class="login-user-avatar-fallback" style="display:none;background:${u.color}">${u.initials}</div>
      <div class="login-user-name">${u.name}</div>
      <div class="login-user-dept">${u.department} · ${u.role}</div>
    </button>`).join('');
}

function loginAs(email) {
  const user = DEMO_USERS.find(u => u.email === email);
  if (!user) return;
  doLogin(user);
}

function loginWithForm() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  if (!email) { alert('Please enter your email.'); return; }
  if (!pass)  { alert('Please enter your password.'); return; }
  const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    doLogin(user);
  } else {
    // Create a guest user from the email
    const name = email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    doLogin({ name, email, department: 'Research', role: 'Analyst', color: '#5925DC', initials: name.split(' ').map(n=>n[0]).join('').slice(0,2) });
  }
}

function doLogin(user) {
  state.currentUser = { name: user.name, department: user.department, isApprover: user.role === 'DivHead', email: user.email, color: user.color, initials: user.initials, avatar: user.avatar || 'https://api.multiavatar.com/' + encodeURIComponent(user.name) + '.svg' };
  approverMode = user.role === 'DivHead';

  // Update nav user display
  document.getElementById('nav-user-info').innerHTML = `
    <img class="nav-avatar-img" src="${user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=5925DC&color=fff&size=64&bold=true'}"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
         alt="${user.name}" />
    <div class="nav-avatar-fallback" style="display:none;background:${user.color}">${user.initials}</div>
    <div class="nav-user-details">
      <span class="nav-user-name">${user.name}</span>
      <span class="nav-user-email">${user.email}</span>
    </div>`;

  // Sync role badge and approver toggle
  const badge       = document.getElementById('role-badge');
  const approvalTab = document.querySelector('[data-view="approvals"]');
  const toggleBtn   = document.getElementById('toggle-role-btn');
  if (approverMode) {
    badge.textContent = 'DivHead'; badge.classList.add('approver');
    approvalTab.style.display = '';
    document.getElementById('risk-tab').style.display = '';
    document.getElementById('mydata-tab').style.display = 'none';
    document.getElementById('requests-tab').style.display = 'none';
    document.getElementById('aichat-tab').style.display = 'none';
    document.getElementById('adoption-tab').style.display = '';
    toggleBtn.textContent = 'Switch to Analyst';
    // Reorder tabs for DivHead
    var navTabs = document.querySelector('.nav-tabs');
    navTabs.appendChild(document.getElementById('risk-tab'));
    navTabs.appendChild(document.getElementById('flow-tab'));
    navTabs.appendChild(approvalTab);
    navTabs.appendChild(document.getElementById('adoption-tab'));
  } else {
    badge.textContent = 'Analyst'; badge.classList.remove('approver');
    approvalTab.style.display = 'none';
    document.getElementById('risk-tab').style.display = 'none';
    document.getElementById('mydata-tab').style.display = '';
    document.getElementById('requests-tab').style.display = '';
    document.getElementById('aichat-tab').style.display = '';
    document.getElementById('adoption-tab').style.display = 'none';
    toggleBtn.textContent = 'Switch to DivHead';
  }

  // Show app, hide login
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app-shell').style.display  = '';

  // Re-init with new user context
  state.requests = [];
  state.rangerPolicies = [];
  seedActivityData();
  renderCatalogCategories();
  showToast('Welcome back, ' + user.name.split(' ')[0] + ' 👋');
}

function logout() {
  document.getElementById('app-shell').style.display  = 'none';
  document.getElementById('login-page').style.display = '';
  document.getElementById('login-email').value    = '';
  document.getElementById('login-password').value = '';
}

// ── State ─────────────────────────────────────────────────────────────────────
let animFrame = null; // canvas animation frame handle

const state = {
  requests: [],
  rangerPolicies: [],
  currentUser: { name: 'Alex Johnson', department: 'Research', isApprover: false },
  selectedDataset: null,
  activeView: 'catalog',
  catalogFilter: { search: '', category: '', tier: '' },
  approvalsFilter: 'pending',
  myDataTab: 'tables',
  myDataPage: 0,
};

let approverMode = false;

// ── Helpers ───────────────────────────────────────────────────────────────────
function genId() { return 'req_' + Math.random().toString(36).slice(2, 9); }

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

function statusLabel(s) {
  return { pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected', provisioning: '🔄 Provisioning' }[s] || s;
}

// ── Navigation ────────────────────────────────────────────────────────────────
function switchView(view) {
  if (animFrame && view !== 'activity') { cancelAnimationFrame(animFrame); animFrame = null; }
  state.activeView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-view="' + view + '"]').classList.add('active');
  if (view === 'catalog') {
    // Always return to category tiles when switching to catalog
    showCatalogCategories();
    renderCatalogCategories();
  }
  if (view === 'requests')  renderRequests();
  if (view === 'approvals') renderApprovals();
  if (view === 'mydata')    renderMyData();
  if (view === 'activity')  renderActivity();
  if (view === 'risk')      { riskActiveTab === 'dashboard' ? renderRiskDashboard() : setRiskTab(riskActiveTab); }
  if (view === 'flow')      renderProcessFlow();
  if (view === 'actions')   { actionsSelectedCategory = null; renderActions(); }
  if (view === 'cbfeed')    { cbfeedSelectedRegion = null; renderCBFeed(); }
  if (view === 'adoption')  renderAdoption();
  if (view === 'aichat')    { activeAgentId = null; renderAgentsGrid(); document.getElementById('ai-agent-workspace').style.display='none'; document.getElementById('ai-agents-panel').style.display=''; document.getElementById('ai-orchestrate-panel').style.display='none'; var hdr=document.getElementById('ai-agents-header'); if(hdr)hdr.style.display=''; document.querySelectorAll('.ai-agents-tab').forEach(function(t){t.classList.remove('active');}); var at=document.querySelector('[data-agtab="agents"]'); if(at)at.classList.add('active'); }
}

// ── Catalog ───────────────────────────────────────────────────────────────────
const CATEGORY_META = {
  'Market Data':    { icon: '📊', color: '#5925DC', bg: '#EBF1FF', border: '#99BBFF', desc: 'Real-time & historical prices, FX, fixed income across global markets' },
  'Credit Ratings': { icon: '🏦', color: '#D7260F', bg: '#FFF4F3', border: '#FB7463', desc: 'Corporate & sovereign credit ratings, outlooks and risk assessments' },
  'Trade Data':     { icon: '🔄', color: '#B54708', bg: '#FFFAEB', border: '#FEC84B', desc: 'OTC derivatives trade repository and regulatory reporting data' },
  'Exchange Data':  { icon: '❄️', color: '#0F71BB', bg: '#E6F3FB', border: '#58A1D4', desc: 'Evaluated pricing, reference data and analytics for fixed income' },
  'Research Data':  { icon: '🔬', color: '#0A8217', bg: '#ECFBEE', border: '#58BE62', desc: 'Portfolio analytics, factor models and investment research tools' },
  'Regulatory Data': { icon: '🏛️', color: '#1B2A4A', bg: '#EBF1FF', border: '#99BBFF', desc: 'Corporate registry, compliance filings, and regulatory data from Singapore authorities' },
  'Supervision':     { icon: '🔎', color: '#D7260F', bg: '#FFF4F3', border: '#FB7463', desc: 'Predictive supervision — risk scoring, AML surveillance, capital markets oversight, and early warning signals' },
};

function renderCatalogCategories() {
  const counts = {};
  DATASETS.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
  const grid = document.getElementById('catalog-cat-grid');
  grid.innerHTML = Object.keys(CATEGORY_META).map(cat => {
    const m = CATEGORY_META[cat];
    const n = counts[cat] || 0;
    const datasets = DATASETS.filter(d => d.category === cat);
    const tiers = [...new Set(datasets.map(d => d.tier))];
    return `
      <div class="cat-tile" onclick="selectCategory('${cat}')">
        <div class="cat-tile-icon" style="background:${m.color}22;color:${m.color}">${m.icon}</div>
        <div class="cat-tile-name" style="color:${m.color}">${cat}</div>
        <div class="cat-tile-desc">${m.desc}</div>
        <div class="cat-tile-footer">
          <span class="cat-tile-count" style="color:${m.color}">${n} dataset${n !== 1 ? 's' : ''}</span>
          <div style="display:flex;gap:0.3rem;flex-wrap:wrap">
            ${tiers.map(t => `<span class="tier-badge ${t}" style="font-size:0.65rem">${t}</span>`).join('')}
          </div>
        </div>
      </div>`;
  }).join('');
}

function selectCategory(cat) {
  state.catalogFilter.category = cat;
  state.catalogFilter.search   = '';
  state.catalogFilter.tier     = '';
  document.getElementById('search-input').value = '';
  document.getElementById('filter-tier').value  = '';
  document.getElementById('catalog-categories').style.display = 'none';
  document.getElementById('catalog-datasets').style.display   = '';
  const m = CATEGORY_META[cat] || {};
  document.getElementById('catalog-cat-label').innerHTML = `
    <span style="font-size:1.2rem">${m.icon || ''}</span>
    <span style="font-weight:900;color:${m.color || 'var(--accent)'}">${cat}</span>
    <span style="color:var(--text-muted);font-size:0.82rem">— ${DATASETS.filter(d => d.category === cat).length} datasets</span>`;
  renderCatalog();
}

function showCatalogCategories() {
  state.catalogFilter.category = '';
  document.getElementById('catalog-datasets').style.display   = 'none';
  document.getElementById('catalog-categories').style.display = '';
}

function getFilteredDatasets() {
  const { search, category, tier } = state.catalogFilter;
  return DATASETS.filter(d => {
    const matchSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.provider.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchSearch && (!category || d.category === category) && (!tier || d.tier === tier);
  });
}

function renderCatalog() {
  const datasets = getFilteredDatasets();
  const grid = document.getElementById('dataset-grid');
  if (!datasets.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><p>No datasets match your filters.</p></div>`;
    return;
  }
  grid.innerHTML = datasets.map(d => `
    <div class="dataset-card" onclick="openDetailDrawer('${d.id}')">
      <div class="card-header"><span class="card-icon">${d.icon}</span><span class="tier-badge ${d.tier}">${d.tier}</span></div>
      <div class="card-provider">${d.provider}</div>
      <div class="card-name">${d.name}</div>
      <div class="card-desc">${d.description}</div>
      <div class="card-tags">${d.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="card-footer">
        <span class="card-meta">⏱ SLA: ${d.sla} &nbsp;·&nbsp; 🏢 ${d.department}</span>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openDetailDrawer('${d.id}')">View Details</button>
      </div>
    </div>`).join('');
}

// ── Request Modal ─────────────────────────────────────────────────────────────
function openRequestModal(datasetId) {
  const dataset = DATASETS.find(d => d.id === datasetId);
  state.selectedDataset = dataset;
  document.getElementById('modal-dataset-icon').textContent = dataset.icon;
  document.getElementById('modal-dataset-name').textContent = dataset.name;
  document.getElementById('modal-dataset-provider').textContent = dataset.provider + ' · ' + dataset.category;
  document.getElementById('req-department').value = state.currentUser.department;
  document.getElementById('req-justification').value = '';
  document.getElementById('req-duration').value = '6months';
  document.getElementById('req-access-type').value = 'read';
  document.getElementById('request-modal').classList.add('open');
}

function closeRequestModal() {
  document.getElementById('request-modal').classList.remove('open');
  state.selectedDataset = null;
}

function submitRequest() {
  const justification = document.getElementById('req-justification').value.trim();
  const department    = document.getElementById('req-department').value;
  const duration      = document.getElementById('req-duration').value;
  const accessType    = document.getElementById('req-access-type').value;
  if (!justification) { showToast('Please provide a business justification.', 'error'); return; }
  const dataset  = state.selectedDataset;
  const approver = APPROVERS[department] || 'Department Head';
  state.requests.unshift({
    id: genId(), datasetId: dataset.id, datasetName: dataset.name,
    provider: dataset.provider, icon: dataset.icon,
    requester: state.currentUser.name, department, justification,
    duration, accessType, status: 'pending',
    submittedAt: new Date().toISOString(), approver, approverComment: '', rangerPolicyId: null,
  });
  closeRequestModal();
  showToast('Request submitted — pending approval from ' + approver);
  switchView('requests');
}

// ── Requests View ─────────────────────────────────────────────────────────────
function renderRequests() {
  const tbody = document.getElementById('requests-tbody');
  const rows  = approverMode ? state.requests : state.requests.filter(r => r.requester === state.currentUser.name);
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📋</div><p>No requests yet.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.icon} ${r.datasetName}</td>
      <td>${r.provider}</td>
      <td>${r.department}</td>
      <td><span class="status-badge ${r.status}">${statusLabel(r.status)}</span></td>
      <td>${r.approver}</td>
      <td>${formatDate(r.submittedAt)}</td>
    </tr>`).join('');
}

// ── Approvals View ────────────────────────────────────────────────────────────
function renderApprovals() {
  const filter   = state.approvalsFilter;
  const filtered = state.requests.filter(r => filter === 'all' || r.status === filter);
  document.getElementById('stat-pending').textContent  = state.requests.filter(r => r.status === 'pending').length;
  document.getElementById('stat-approved').textContent = state.requests.filter(r => r.status === 'approved').length;
  document.getElementById('stat-rejected').textContent = state.requests.filter(r => r.status === 'rejected').length;
  const container = document.getElementById('approvals-list');
  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🎉</div><p>${filter === 'pending' ? 'No pending approvals.' : 'No requests in this category.'}</p></div>`;
    return;
  }
  container.innerHTML = filtered.map(r => `
    <div class="approval-card">
      <div class="approval-card-header">
        <div>
          <div style="font-weight:600;margin-bottom:0.25rem">${r.icon} ${r.datasetName}</div>
          <div class="approval-meta">Requested by <strong>${r.requester}</strong> · ${r.department} · ${formatDate(r.submittedAt)}</div>
          <div class="approval-meta">Access: ${r.accessType} · Duration: ${r.duration}</div>
        </div>
        <span class="status-badge ${r.status}">${statusLabel(r.status)}</span>
      </div>
      <div class="approval-justification">"${r.justification}"</div>
      ${r.status === 'pending' ? `
        <div style="margin-bottom:0.75rem">
          <input class="form-control" id="comment-${r.id}" placeholder="Add a comment (optional)" style="font-size:0.8rem;padding:0.5rem 0.75rem">
        </div>
        <div class="approval-upload" style="margin-bottom:0.75rem">
          <label class="approval-upload-label" for="attach-${r.id}">
            <span class="approval-upload-icon">📎</span>
            <span>Attach approval email (.eml, .msg, .pdf)</span>
            <input type="file" id="attach-${r.id}" accept=".eml,.msg,.pdf,.png,.jpg" style="display:none" onchange="showAttachName(this,'attach-name-${r.id}')" />
          </label>
          <span class="approval-attach-name" id="attach-name-${r.id}"></span>
        </div>
        <div class="approval-actions">
          <button class="btn btn-danger btn-sm"  onclick="handleApproval('${r.id}','rejected')">Reject</button>
          <button class="btn btn-success btn-sm" onclick="handleApproval('${r.id}','approved')">Approve</button>
        </div>` : r.approverComment ? `<div class="approval-meta" style="margin-top:0.5rem">💬 ${r.approverComment}</div>` : ''}
    </div>`).join('');
}

function showAttachName(input, spanId) {
  var span = document.getElementById(spanId);
  if (input.files && input.files.length > 0) {
    span.textContent = '✅ ' + input.files[0].name;
    span.style.color = '#0A8217';
  } else {
    span.textContent = '';
  }
}

function handleApproval(requestId, decision) {
  const req = state.requests.find(r => r.id === requestId);
  if (!req) return;
  const commentEl = document.getElementById('comment-' + requestId);
  req.approverComment = commentEl ? commentEl.value.trim() : '';
  req.resolvedAt = new Date().toISOString();

  if (decision === 'rejected') {
    req.status = 'rejected';
    showToast('❌ Request rejected', 'error');
    renderApprovals();
    return;
  }

  // ── Approved: show provisioning overlay ──────────────────────────────────
  req.status = 'provisioning';
  renderApprovals();

  const policy = buildRangerPolicy(req);
  if (policy) { req.rangerPolicyId = policy.policyId; state.rangerPolicies.push(policy); }

  showProvisioningOverlay(req, policy, () => {
    req.status = 'approved';
    if (state.activeView === 'approvals') renderApprovals();
  });
}

// ── Provisioning Overlay ──────────────────────────────────────────────────────
function showProvisioningOverlay(req, policy, onComplete) {
  const dataset = DATASETS.find(d => d.id === req.datasetId);
  const schema  = DATASET_SCHEMAS[req.datasetId];
  const permMap = { 'read': ['SELECT'], 'read-write': ['SELECT','UPDATE','INSERT'], 'api': ['SELECT','EXECUTE'], 'bulk': ['SELECT','EXPORT'] };
  const perms   = permMap[req.accessType] || ['SELECT'];

  const steps = [
    { icon: '✅', label: 'Request approved',              detail: `Approved by ${req.approver}` },
    { icon: '🛡️', label: 'Creating Ranger policy',        detail: policy ? policy.policyId : '—' },
    { icon: '🗄️', label: 'Binding database resources',    detail: schema ? schema.database + ' · ' + schema.tables.map(t=>t.name).join(', ') : '—' },
    { icon: '👤', label: 'Assigning principals',          detail: req.requester.toLowerCase().replace(' ','.') + '@corp.com · dept_' + req.department.toLowerCase() },
    { icon: '🔑', label: 'Granting permissions',          detail: perms.join(', ') + ' on ' + (schema ? schema.tables.length : 0) + ' table(s)' },
    { icon: '🔒', label: 'Applying row filters & masks',  detail: 'Row filter: department = \'' + req.department + '\' · Column masking active' },
    { icon: '📋', label: 'Audit logging enabled',         detail: 'All access events will be logged' },
    { icon: '🚀', label: 'Access provisioned',            detail: 'Data is now available in My Data' },
  ];

  // Build overlay HTML
  const overlay = document.createElement('div');
  overlay.id = 'prov-overlay';
  overlay.className = 'prov-overlay';
  overlay.innerHTML = `
    <div class="prov-modal">
      <div class="prov-header">
        <div class="prov-header-left">
          <span style="font-size:2rem">${dataset ? dataset.icon : '📦'}</span>
          <div>
            <div class="prov-title">Provisioning Access</div>
            <div class="prov-subtitle">${req.datasetName} · ${req.accessType} · ${req.department}</div>
          </div>
        </div>
        <span class="ranger-badge">🛡️ ${policy ? policy.policyId : 'Pending'}</span>
      </div>

      <div class="prov-steps" id="prov-steps">
        ${steps.map((s, i) => `
          <div class="prov-step" id="prov-step-${i}">
            <div class="prov-step-icon waiting">⏳</div>
            <div class="prov-step-body">
              <div class="prov-step-label">${s.label}</div>
              <div class="prov-step-detail">${s.detail}</div>
            </div>
          </div>`).join('')}
      </div>

      <div class="prov-progress-wrap">
        <div class="prov-progress-bar" id="prov-progress"></div>
      </div>
      <div class="prov-status" id="prov-status">Initialising…</div>

      <div class="prov-actions" id="prov-actions" style="display:none">
        <button class="btn btn-outline btn-sm" onclick="closeProvisioningOverlay()">Close</button>
        <button class="btn btn-primary" onclick="closeProvisioningOverlay(); switchView('mydata')">
          📋 View My Data &amp; Tables →
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  // Animate steps
  let i = 0;
  function nextStep() {
    if (i > 0) {
      const prev = document.getElementById('prov-step-' + (i - 1));
      if (prev) { prev.querySelector('.prov-step-icon').textContent = steps[i-1].icon; prev.querySelector('.prov-step-icon').className = 'prov-step-icon done'; }
    }
    if (i >= steps.length) {
      document.getElementById('prov-progress').style.width = '100%';
      document.getElementById('prov-status').textContent = '✅ Provisioning complete — Ranger policy active';
      document.getElementById('prov-status').style.color = '#0A8217';
      document.getElementById('prov-actions').style.display = 'flex';
      onComplete();
      return;
    }
    const stepEl = document.getElementById('prov-step-' + i);
    if (stepEl) { stepEl.querySelector('.prov-step-icon').className = 'prov-step-icon active'; stepEl.classList.add('running'); }
    document.getElementById('prov-progress').style.width = Math.round(((i + 1) / steps.length) * 100) + '%';
    document.getElementById('prov-status').textContent = steps[i].label + '…';
    i++;
    setTimeout(nextStep, i === steps.length ? 600 : 480);
  }
  setTimeout(nextStep, 300);
}

function closeProvisioningOverlay() {
  const el = document.getElementById('prov-overlay');
  if (el) { el.classList.remove('open'); setTimeout(() => el.remove(), 300); }
}

function setApprovalsFilter(filter) {
  state.approvalsFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-filter="' + filter + '"]').classList.add('active');
  renderApprovals();
}

function toggleApproverMode() {
  approverMode = !approverMode;
  state.currentUser.isApprover = approverMode;
  const badge       = document.getElementById('role-badge');
  const approvalTab = document.querySelector('[data-view="approvals"]');
  const riskTab     = document.getElementById('risk-tab');
  const mydataTab   = document.getElementById('mydata-tab');
  const requestsTab = document.getElementById('requests-tab');
  const flowTab     = document.getElementById('flow-tab');
  if (approverMode) {
    badge.textContent = 'DivHead'; badge.classList.add('approver');
    approvalTab.style.display = '';
    riskTab.style.display = '';
    mydataTab.style.display = 'none';
    requestsTab.style.display = 'none';
    document.getElementById('aichat-tab').style.display = 'none';
    document.getElementById('adoption-tab').style.display = '';
    // Reorder: Catalog, Actions, Risk, Adoption, Process Flow, Approvals
    const navTabs = document.querySelector('.nav-tabs');
    navTabs.appendChild(riskTab);
    navTabs.appendChild(flowTab);
    navTabs.appendChild(approvalTab);
    navTabs.appendChild(document.getElementById('adoption-tab'));
  } else {
    badge.textContent = 'Analyst'; badge.classList.remove('approver');
    approvalTab.style.display = 'none';
    riskTab.style.display = 'none';
    mydataTab.style.display = '';
    requestsTab.style.display = '';
    document.getElementById('aichat-tab').style.display = '';
    document.getElementById('adoption-tab').style.display = 'none';
  }
  document.getElementById('toggle-role-btn').textContent = approverMode ? 'Switch to Analyst' : 'Switch to DivHead';
  if ((state.activeView === 'approvals' || state.activeView === 'risk' || state.activeView === 'activity') && !approverMode) switchView('catalog');
  if ((state.activeView === 'mydata' || state.activeView === 'requests') && approverMode) switchView('catalog');
}

// ── My Data View ──────────────────────────────────────────────────────────────
function setMyDataTab(tab) {
  state.myDataTab = tab;
  state.myDataPage = 0;
  document.querySelectorAll('.mydata-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-mytab="' + tab + '"]').classList.add('active');
  renderMyData();
}

function setMyDataPage(page) {
  state.myDataPage = page;
  renderMyData();
  document.getElementById('mydata-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderMyData() {
  const approved  = state.requests.filter(r => r.status === 'approved');
  const container = document.getElementById('mydata-content');
  if (!approved.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔒</div><p>No approved datasets yet. Submit a request and get it approved to access data here.</p></div>`;
    return;
  }
  state.myDataTab === 'policies' ? renderPoliciesTab(approved, container) : renderTablesTab(approved, container);
}

function renderTablesTab(approvedRequests, container) {
  // Custom sort order: OTC, SGX, ACRA, Bloomberg, then rest; deduplicate by datasetId
  const _order = { 'otc-derivatives': 0, 'sgx-trade': 1, 'acra-corporate': 2, 'mas-exchange-rates': 3, 'mas-supervision': 4, 'mas610': 5, 'bloomberg-terminal': 6 };
  const _seen = new Set();
  const sorted = [...approvedRequests].sort((a, b) => {
    const oa = _order[a.datasetId] !== undefined ? _order[a.datasetId] : 99;
    const ob = _order[b.datasetId] !== undefined ? _order[b.datasetId] : 99;
    return oa - ob;
  }).filter(r => {
    if (_seen.has(r.datasetId)) return false;
    _seen.add(r.datasetId);
    return true;
  });

  const total = sorted.length;
  const page  = Math.min(Math.max(state.myDataPage, 0), total - 1);
  const req   = sorted[page];
  const schema  = DATASET_SCHEMAS[req.datasetId];
  const dataset = DATASETS.find(d => d.id === req.datasetId);

  // ── Pagination bar ─────────────────────────────────────────────────────────
  const paginationHtml = `
    <div class="mydata-pagination">
      <div class="mydata-pagination-info">
        Dataset <strong>${page + 1}</strong> of <strong>${total}</strong>
      </div>
      <div class="mydata-pagination-tabs">
        ${sorted.map((r, i) => {
          const ds = DATASETS.find(d => d.id === r.datasetId);
          return `<button class="mydata-page-btn${i === page ? ' active' : ''}" onclick="setMyDataPage(${i})">
            ${ds ? ds.icon : '📦'} ${ds ? ds.provider : r.datasetId}
          </button>`;
        }).join('')}
      </div>
      <div class="mydata-pagination-nav">
        <button class="btn btn-outline btn-sm" onclick="setMyDataPage(${page - 1})" ${page === 0 ? 'disabled' : ''} style="border-color:var(--border);color:var(--text)">← Prev</button>
        <button class="btn btn-primary btn-sm" onclick="setMyDataPage(${page + 1})" ${page === total - 1 ? 'disabled' : ''}>Next →</button>
      </div>
    </div>`;

  if (!schema || !dataset) {
    container.innerHTML = paginationHtml + `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Schema not available for this dataset.</p></div>`;
    return;
  }

  // ── Dataset header ─────────────────────────────────────────────────────────
  let html = paginationHtml + `
    <div class="mydata-dataset-block">
      <div class="mydata-dataset-header">
        <div style="display:flex;align-items:center;gap:0.75rem">
          <span style="font-size:1.75rem">${dataset.icon}</span>
          <div>
            <div style="font-weight:700;font-size:1.05rem">${dataset.name}</div>
            <div style="font-size:0.78rem;color:var(--text-muted)">${schema.database} · ${schema.tables.length} table(s) · Access: <strong>${req.accessType}</strong> · <span class="tier-badge ${dataset.tier}" style="vertical-align:middle">${dataset.tier}</span></div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.2rem">
              <span class="user-avatar" style="width:18px;height:18px;font-size:0.6rem">${req.requester.split(' ').map(n=>n[0]).join('')}</span>
              ${req.requester} · <span class="dept-chip dept-${req.department.toLowerCase()}" style="font-size:0.7rem;padding:0.1rem 0.4rem">${req.department}</span> · Approved ${formatDate(req.submittedAt)}
            </div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem">
          ${req.rangerPolicyId ? `<span class="ranger-badge">🛡️ ${req.rangerPolicyId}</span>` : ''}
          <button class="btn btn-outline btn-sm" style="font-size:0.72rem;border-color:var(--border);color:var(--text-muted)" onclick="viewPolicy('${req.id}')">View Policy</button>
        </div>
      </div>`;

  // ── OTC: Financial Stability analytics first (charts before tables) ───────
  if (req.datasetId === 'otc-derivatives') {
    html += `<div class="fsr-section">
      <div class="fsr-header">
        <span class="fsr-badge">📊 Financial Stability Report Analytics</span>
        <span style="font-size:0.75rem;color:var(--text-muted)">Derived from OTC Derivatives Trade Repository · As of Mar 2026</span>
      </div>

      <div class="fsr-charts-grid">

        <div class="fsr-chart-card">
          <div class="fsr-chart-title">🕸️ Counterparty Network Analysis</div>
          <div class="fsr-chart-sub">Bilateral exposure network — node size ∝ gross notional, edge weight ∝ net exposure</div>
          <canvas id="fsr-network" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Each node represents a financial institution. Green solid edges show CCP-cleared trades (lower counterparty risk). Red/purple dashed edges show bilateral OTC exposures (higher risk). The CCP node at the centre acts as a central counterparty, absorbing and netting risk from multiple banks.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Identify highly connected nodes (high degree centrality) — these are systemically important. A node with many thick edges to non-CCP counterparties signals concentrated bilateral risk. Use this to prioritise counterparty credit limit reviews and margin calls.</p>
          </div>
        </div>

        <div class="fsr-chart-card">
          <div class="fsr-chart-title">📉 Eigenvalue Spectrum (Adjacency Matrix)</div>
          <div class="fsr-chart-sub">Sorted eigenvalues of the bilateral exposure matrix — outliers above the MP boundary indicate systemic concentration</div>
          <canvas id="fsr-eigenvalue" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>The eigenvalue spectrum of the exposure adjacency matrix. Under the Marchenko-Pastur (MP) law, eigenvalues of a random matrix fall within a predictable bulk range. Eigenvalues above the MP boundary (red bars) represent genuine systemic structure — not noise. λ₁ = 0.847 is the dominant eigenvalue indicating the primary risk direction.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>A large spectral gap (λ₁ ≫ λ₂) signals that one institution or cluster dominates systemic risk. Use this for stress testing: the eigenvector of λ₁ identifies which institutions contribute most to systemic exposure. Regulators use this for SIFI designation and capital surcharge calculations.</p>
          </div>
        </div>

        <div class="fsr-chart-card">
          <div class="fsr-chart-title">🌡️ Systemic Risk Heatmap</div>
          <div class="fsr-chart-sub">Cross-sector bilateral exposure intensity — white = low, amber = medium, red = high</div>
          <canvas id="fsr-heatmap" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>A symmetric matrix of normalised bilateral exposure between financial sectors. Each cell (i, j) shows the exposure intensity between sector i and sector j on a 0–1 scale. Diagonal cells (self-exposure) are shown in dark grey. High values (red) between Trading and Banking indicate the largest cross-sector risk concentration.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Identify sector pairs with high mutual exposure — these are the most vulnerable to contagion. A red cell between two large sectors means a stress event in one will rapidly propagate to the other. Use this to set cross-sector exposure limits and design macro-prudential buffers under MAS Notice 637.</p>
          </div>
        </div>

        <div class="fsr-chart-card">
          <div class="fsr-chart-title">🔗 Contagion Simulation (DebtRank)</div>
          <div class="fsr-chart-sub">Fraction of total system value impacted when each institution defaults — SIFI threshold at 50%</div>
          <canvas id="fsr-contagion" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>DebtRank is a network-based algorithm that simulates how financial distress propagates. Each bar shows the fraction of total system value that would be impaired if that institution defaulted. Bars above the 50% SIFI threshold (red dashed line) are labelled SIFI — Systemically Important Financial Institutions. The CCP node has the highest impact (89%) because it sits at the centre of the network.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Institutions above the SIFI threshold require enhanced supervision, higher capital buffers, and recovery & resolution planning. Use this simulation to rank counterparties by systemic importance, set exposure concentration limits, and model the impact of a single institution's failure on the broader financial system. This directly supports MAS ICAAP stress testing requirements.</p>
          </div>
        </div>

      </div>

      <div class="fsr-metrics-row">
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#D7260F">0.847</div><div class="fsr-metric-label">Largest Eigenvalue λ₁</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#B54708">3.2x</div><div class="fsr-metric-label">Spectral Gap Ratio</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#5925DC">0.623</div><div class="fsr-metric-label">Network Density</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#0F71BB">12.4T</div><div class="fsr-metric-label">Net Systemic Exposure</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#0A8217">78%</div><div class="fsr-metric-label">CCP Cleared</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#B54708">4</div><div class="fsr-metric-label">SIFI Nodes</div></div>
      </div>
    </div>`;
  }

  // ── SGX: Market Analytics ──────────────────────────────────────────────────
  if (req.datasetId === 'sgx-trade') {
    html += `<div class="fsr-section">
      <div class="fsr-header">
        <span class="fsr-badge">📊 SGX Market Analytics</span>
        <span style="font-size:0.75rem;color:var(--text-muted)">Singapore Exchange Trade & Market Data · As of Mar 2026</span>
      </div>
      <div class="fsr-charts-grid">
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">📈 STI Index Trend (30 days)</div>
          <div class="fsr-chart-sub">Straits Times Index daily closing levels</div>
          <canvas id="sgx-sti" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Daily closing levels of the Straits Times Index (STI), the benchmark equity index for Singapore. Tracks the performance of the top 30 companies listed on SGX by market capitalisation.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Monitor overall market direction and momentum. A sustained uptrend signals positive investor sentiment. Compare with regional indices (HSI, KLCI) for relative performance assessment.</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">📊 Daily Turnover (S$ Billion)</div>
          <div class="fsr-chart-sub">Total value traded on SGX-ST per day</div>
          <canvas id="sgx-turnover" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Daily total turnover in Singapore Dollars across all SGX-listed securities. Higher turnover indicates greater market liquidity and participation.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Use as a liquidity indicator for execution planning. Low turnover days may result in wider spreads and higher market impact costs. Spikes often coincide with index rebalancing or corporate events.</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">🏦 Top Traded by Value</div>
          <div class="fsr-chart-sub">Highest value equities traded today</div>
          <canvas id="sgx-topval" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>The top 5 most actively traded securities by total value (price × volume). Singapore banks (DBS, OCBC, UOB) typically dominate due to their large market cap and institutional flow.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Identify where institutional capital is flowing. Concentration in a few names may indicate sector rotation or event-driven activity. Use for best execution venue analysis.</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">📉 Derivatives Volume by Product</div>
          <div class="fsr-chart-sub">Futures & options lots traded by contract type</div>
          <canvas id="sgx-deriv" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Breakdown of derivatives trading volume by product: equity index futures (SiMSCI, Nikkei), commodity futures (iron ore), and FX futures. SGX is the global hub for Nikkei 225 and iron ore derivatives.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Monitor hedging activity and speculative positioning. A surge in iron ore futures may signal China demand expectations. Use for margin and clearing risk assessment.</p>
          </div>
        </div>
      </div>
      <div class="fsr-metrics-row">
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#D7260F">3,412</div><div class="fsr-metric-label">STI Close</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#0A8217">+0.42%</div><div class="fsr-metric-label">STI Change</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#5925DC">S$1.28B</div><div class="fsr-metric-label">Daily Turnover</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#0F71BB">1.45B</div><div class="fsr-metric-label">Volume (shares)</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#B8962E">700+</div><div class="fsr-metric-label">Listed Securities</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#B54708">40+</div><div class="fsr-metric-label">Derivatives Products</div></div>
      </div>
    </div>`;
  }

  // ── ACRA: Corporate Registry Analytics ──────────────────────────────────
  if (req.datasetId === 'acra-corporate') {
    html += `<div class="fsr-section">
      <div class="fsr-header">
        <span class="fsr-badge">📊 ACRA Corporate Registry Analytics</span>
        <span style="font-size:0.75rem;color:var(--text-muted)">Accounting & Corporate Regulatory Authority · As of Mar 2026</span>
      </div>
      <div class="fsr-charts-grid">
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">🏢 Entity Type Distribution</div>
          <div class="fsr-chart-sub">Breakdown of registered entities by company type</div>
          <canvas id="acra-entity" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Distribution of all Singapore-registered entities by type: Private Limited (Pte Ltd), Public Company, Sole Proprietorship, LLP, and others. Private companies dominate the registry at ~75%.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Understand the composition of the corporate landscape for KYC risk profiling. Private companies have less public disclosure, requiring deeper due diligence. Public companies are subject to SGX listing rules and MAS oversight.</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">📈 New Registrations Trend</div>
          <div class="fsr-chart-sub">Monthly new company incorporations over 12 months</div>
          <canvas id="acra-registrations" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Monthly count of new company incorporations in Singapore. An upward trend signals a healthy business formation environment. Seasonal dips may occur around Chinese New Year and year-end.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Track economic vitality and entrepreneurial activity. A surge in registrations in specific SSIC codes may indicate emerging sectors. Use for market sizing and competitive landscape analysis.</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">⚠️ Compliance Status Breakdown</div>
          <div class="fsr-chart-sub">Filing compliance across all registered entities</div>
          <canvas id="acra-compliance" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Proportion of entities that are Compliant (filed on time), Overdue (past deadline but within grace), or Non-Compliant (enforcement action initiated). Non-compliant entities are at risk of being struck off.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Flag counterparties with Overdue or Non-Compliant status as higher risk in KYC/CDD processes. Non-compliant entities should trigger enhanced due diligence and may be excluded from new business relationships.</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">🌍 Director Nationality Mix</div>
          <div class="fsr-chart-sub">Nationality distribution of directors across all entities</div>
          <canvas id="acra-nationality" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Breakdown of director nationalities across all Singapore-registered companies. Singapore citizens and PRs form the majority, with significant representation from Malaysia, China, India, and other ASEAN nations.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Use for sanctions screening and PEP (Politically Exposed Person) risk assessment. High concentration of directors from specific jurisdictions may require enhanced AML/CFT checks under MAS Notice 626.</p>
          </div>
        </div>
      </div>
      <div class="fsr-metrics-row">
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#0A8217">550K+</div><div class="fsr-metric-label">Registered Entities</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#5925DC">1.2M+</div><div class="fsr-metric-label">Directors on Record</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#D7260F">3.2%</div><div class="fsr-metric-label">Non-Compliant Rate</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#0F71BB">180K+</div><div class="fsr-metric-label">Filings / Year</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#B8962E">5,800</div><div class="fsr-metric-label">New Reg / Month</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#B54708">20 yrs</div><div class="fsr-metric-label">History</div></div>
      </div>
    </div>`;
  }

  // ── MAS Exchange Rates: FX Analytics ────────────────────────────────────
  if (req.datasetId === 'mas-exchange-rates') {
    html += `<div class="fsr-section">
      <div class="fsr-header">
        <span class="fsr-badge">📊 MAS Exchange Rate Analytics</span>
        <span style="font-size:0.75rem;color:var(--text-muted)">Official MAS FX Data · S$NEER · Forward Rates · As of Mar 2026</span>
      </div>
      <div class="fsr-charts-grid">
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">💱 SGD Spot Rates (Major Pairs)</div>
          <div class="fsr-chart-sub">SGD per unit of foreign currency — daily snapshot</div>
          <canvas id="fx-spot" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Current SGD exchange rates against major currencies. A higher bar means more SGD per unit of that currency (SGD is weaker against it). USD/SGD at 1.34 means S$1.34 buys US$1.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Use for daily FX exposure monitoring, P&L conversion, and identifying which currencies SGD is strengthening or weakening against. Critical for trade settlement and regulatory reporting.</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">📈 S$NEER Index (30 days)</div>
          <div class="fsr-chart-sub">Trade-weighted SGD index with MAS policy band</div>
          <canvas id="fx-sneer" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>The S$NEER index tracks SGD against a trade-weighted basket. The shaded band shows the MAS policy corridor. MAS manages monetary policy by adjusting the slope, width, and centre of this band rather than setting interest rates.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>When S$NEER approaches the upper band edge, SGD is strong and MAS may ease. Near the lower edge, MAS may tighten. Use for monetary policy forecasting and SGD direction calls.</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">📉 Forward Curve (USD/SGD)</div>
          <div class="fsr-chart-sub">Spot vs forward rates at 1M, 3M, 6M, 12M tenors</div>
          <canvas id="fx-forward" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>The USD/SGD forward curve showing how the exchange rate is priced for future delivery dates. A downward-sloping curve (forward discount) means markets expect SGD to strengthen vs USD, reflecting higher US interest rates.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Use for hedging cost estimation — the difference between spot and forward is the cost of hedging FX exposure. Treasury teams use this to decide optimal hedge tenor and timing.</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">🌏 Regional Currency Performance</div>
          <div class="fsr-chart-sub">Daily % change of ASEAN currencies vs SGD</div>
          <canvas id="fx-regional" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Daily percentage change of regional currencies against SGD. Green bars = currency strengthened vs SGD, red = weakened. Useful for spotting regional FX trends and contagion.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Monitor ASEAN FX risk for cross-border exposures. A broad weakening of regional currencies vs SGD may signal capital outflows from the region, impacting trade finance and regional lending portfolios.</p>
          </div>
        </div>
      </div>
      <div class="fsr-metrics-row">
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#B8962E">1.3425</div><div class="fsr-metric-label">USD/SGD Spot</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#5925DC">128.45</div><div class="fsr-metric-label">S$NEER Index</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#0A8217">+1.5%</div><div class="fsr-metric-label">Band Slope (p.a.)</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#0F71BB">20+</div><div class="fsr-metric-label">Currencies</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#D7260F">-1.04%</div><div class="fsr-metric-label">12M Fwd Yield Diff</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#B54708">25 yrs</div><div class="fsr-metric-label">History</div></div>
      </div>
    </div>`;
  }

  // ── MAS Supervision Intelligence ───────────────────────────────────────
  if (req.datasetId === 'mas-supervision') {
    html += `<div class="fsr-section">
      <div class="fsr-header">
        <span class="fsr-badge">📊 MAS Supervision Intelligence — Predictive Analytics</span>
        <span style="font-size:0.75rem;color:var(--text-muted)">Risk Scoring · AML · Capital Markets · Early Warning · As of Mar 2026</span>
      </div>
      <div class="fsr-charts-grid">
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">🏦 Entity Risk Score Distribution</div>
          <div class="fsr-chart-sub">Overall risk scores across all supervised entities — higher = lower risk</div>
          <canvas id="supv-scores" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Distribution of composite risk scores (0–100) across all MAS-supervised entities. Scores are model-driven, combining capital adequacy, liquidity, conduct, AML, and cyber risk dimensions. Entities below 50 are flagged as High/Critical risk tier.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Identify the tail of low-scoring entities for prioritised supervisory attention. A leftward shift in the distribution over time signals deteriorating sector health. Use for resource allocation in risk-based supervision.</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">⚠️ AML Alert Trend (12 months)</div>
          <div class="fsr-chart-sub">Monthly STR filings and AML alerts — rising trend indicates increased suspicious activity</div>
          <canvas id="supv-aml" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Monthly count of Suspicious Transaction Reports (STRs) and AML alerts generated by supervised entities. An upward trend may reflect improved detection or genuinely increasing financial crime activity.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Monitor for spikes that may indicate emerging ML/TF typologies. Cross-reference with entity risk scores to identify whether alerts are concentrated in specific entity types (e.g. fintechs, payment institutions).</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">🎯 Predictive Signal Confidence</div>
          <div class="fsr-chart-sub">ML model confidence levels for active early warning signals</div>
          <canvas id="supv-signals" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Confidence scores (0–1) of active predictive signals from ML models. Each bar represents a signal type: Liquidity Stress, AML Pattern, Exposure Concentration, and Conduct Risk. Higher confidence = stronger model conviction.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Prioritise supervisory action on high-confidence signals (>0.8). Signals below 0.6 may require additional data before action. Use to transition from reactive to predictive, model-driven supervision.</p>
          </div>
        </div>
        <div class="fsr-chart-card">
          <div class="fsr-chart-title">🏷️ Risk Tier Breakdown</div>
          <div class="fsr-chart-sub">Supervised entities by risk tier — Low / Medium / High / Critical</div>
          <canvas id="supv-tiers" style="width:100%;display:block"></canvas>
          <div class="fsr-chart-explain">
            <div class="fsr-explain-title">What this shows</div>
            <p>Distribution of all 1,200+ supervised entities across four risk tiers. Low-risk entities require standard oversight; Critical entities are subject to enhanced supervision, on-site inspections, and potential enforcement action.</p>
            <div class="fsr-explain-title">How to use it</div>
            <p>Track tier migration over time — entities moving from Low to Medium or Medium to High signal emerging risks. A growing Critical tier may indicate systemic stress requiring macro-prudential intervention.</p>
          </div>
        </div>
      </div>
      <div class="fsr-metrics-row">
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#0A8217">1,200+</div><div class="fsr-metric-label">Supervised Entities</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#5925DC">12</div><div class="fsr-metric-label">ML Models Active</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#D7260F">450+</div><div class="fsr-metric-label">STRs / Month</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#0F71BB">85</div><div class="fsr-metric-label">Alerts / Day</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#B54708">3.8%</div><div class="fsr-metric-label">Critical Tier Rate</div></div>
        <div class="fsr-metric"><div class="fsr-metric-val" style="color:#B8962E">0.87</div><div class="fsr-metric-label">Avg Model Confidence</div></div>
      </div>
    </div>`;
  }

  // ── Tables ─────────────────────────────────────────────────────────────────
  schema.tables.forEach(table => {
    html += `<div class="table-block">
      <div class="table-block-header">
        <div>
          <span class="table-name">📋 ${schema.database}.<strong>${table.name}</strong></span>
          <span class="table-desc">${table.description}</span>
        </div>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap">${table.columns.map(c => `<span class="col-chip">${c}</span>`).join('')}</div>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr>${table.columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${table.rows.map(row => `<tr>${table.columns.map(c => `<td>${row[c] !== undefined ? row[c] : '—'}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
  });

  html += `</div>`;
  container.innerHTML = html;

  if (req.datasetId === 'otc-derivatives') {
    setTimeout(function() {
      drawNetworkChart(); drawEigenvalueChart(); drawHeatmapChart(); drawContagionChart();
    }, 200);
  }
  if (req.datasetId === 'sgx-trade') {
    setTimeout(function() {
      drawSgxSTI(); drawSgxTurnover(); drawSgxTopVal(); drawSgxDeriv();
    }, 200);
  }
  if (req.datasetId === 'acra-corporate') {
    setTimeout(function() {
      drawAcraEntity(); drawAcraRegistrations(); drawAcraCompliance(); drawAcraNationality();
    }, 200);
  }
  if (req.datasetId === 'mas-exchange-rates') {
    setTimeout(function() {
      drawFxSpot(); drawFxSneer(); drawFxForward(); drawFxRegional();
    }, 200);
  }
  if (req.datasetId === 'mas-supervision') {
    setTimeout(function() {
      drawSupvScores(); drawSupvAml(); drawSupvSignals(); drawSupvTiers();
    }, 200);
  }
}

function renderPoliciesTab(approvedRequests, container) {
  const policies = state.rangerPolicies.filter(p => approvedRequests.some(r => r.id === p.requestId));
  if (!policies.length) { container.innerHTML = `<div class="empty-state"><div class="empty-icon">🛡️</div><p>No Ranger policies found.</p></div>`; return; }
  container.innerHTML = policies.map(p => `
    <div class="policy-card">
      <div class="policy-card-header">
        <div>
          <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.3rem">
            <span class="ranger-badge">🛡️ ${p.policyId}</span>
            <span class="policy-status-badge ${p.status.toLowerCase()}">${p.status}</span>
          </div>
          <div style="font-weight:700;font-size:0.95rem">${p.policyName}</div>
        </div>
        <div style="text-align:right;font-size:0.78rem;color:var(--text-muted)">
          <div>Created: ${formatDate(p.createdAt)}</div>
          <div>Expires: ${p.expiresAt === 'Never' ? 'Never' : formatDate(p.expiresAt)}</div>
        </div>
      </div>
      <div class="policy-grid">
        <div class="policy-section">
          <div class="policy-section-title">🗄️ Resources</div>
          <div class="policy-kv"><span>Database</span><code>${p.resources.database}</code></div>
          <div class="policy-kv"><span>Tables</span><code>${p.resources.tables.join(', ')}</code></div>
          <div class="policy-kv"><span>Columns</span><code>${p.resources.columns.join(', ')}</code></div>
        </div>
        <div class="policy-section">
          <div class="policy-section-title">👤 Principals</div>
          <div class="policy-kv"><span>User</span><code>${p.principals.users[0]}</code></div>
          <div class="policy-kv"><span>Group</span><code>${p.principals.groups[0]}</code></div>
          <div class="policy-kv"><span>Role</span><code>${p.principals.roles[0]}</code></div>
        </div>
        <div class="policy-section">
          <div class="policy-section-title">🔑 Permissions</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.4rem">${p.permissions.map(perm => `<span class="perm-chip">${perm}</span>`).join('')}</div>
        </div>
        <div class="policy-section">
          <div class="policy-section-title">🔒 Conditions</div>
          ${p.conditions.map(c => `<div class="policy-kv"><span>${c.type}</span><code>${c.expression || c.maskType}</code></div>`).join('')}
          <div class="policy-kv"><span>Audit</span><code>${p.auditEnabled ? 'Enabled' : 'Disabled'}</code></div>
        </div>
      </div>
      <div style="margin-top:0.75rem;font-size:0.78rem;color:var(--text-muted)">
        Approved by <strong>${p.approvedBy}</strong> · Service: <strong>${p.serviceName}</strong> (${p.serviceType})
      </div>
    </div>`).join('');
}

function viewPolicy(requestId) { setMyDataTab('policies'); switchView('mydata'); }

// ── Activity & Network Flow ───────────────────────────────────────────────────
function seedActivityData() {
  const seeds = [
    { user: 'Alex Johnson',   dept: 'Research',   datasetId: 'bloomberg-terminal', accessType: 'read',       duration: '12months', status: 'approved', daysAgo: 5  },
    { user: 'Alex Johnson',   dept: 'Research',   datasetId: 'factset',            accessType: 'read',       duration: '6months',  status: 'approved', daysAgo: 12 },
    { user: 'Maria Chen',     dept: 'Trading',    datasetId: 'bloomberg-terminal', accessType: 'read-write', duration: '12months', status: 'approved', daysAgo: 3  },
    { user: 'Maria Chen',     dept: 'Trading',    datasetId: 'refinitiv-eikon',    accessType: 'api',        duration: '6months',  status: 'approved', daysAgo: 8  },
    { user: 'Maria Chen',     dept: 'Trading',    datasetId: 'mas-exchange-rates', accessType: 'read',       duration: '12months', status: 'approved', daysAgo: 2  },
    { user: 'James Okafor',   dept: 'Compliance', datasetId: 'otc-derivatives',    accessType: 'read',       duration: 'permanent',status: 'approved', daysAgo: 15 },
    { user: 'James Okafor',   dept: 'Compliance', datasetId: 'acra-corporate',     accessType: 'read',       duration: '12months', status: 'approved', daysAgo: 8  },
    { user: 'James Okafor',   dept: 'Compliance', datasetId: 'mas-supervision',    accessType: 'read',       duration: '12months', status: 'approved', daysAgo: 1  },
    { user: 'Priya Sharma',   dept: 'Research',   datasetId: 'sp-global',          accessType: 'bulk',       duration: '3months',  status: 'approved', daysAgo: 2  },
    { user: 'David Kim',      dept: 'Operations', datasetId: 'ice-data',           accessType: 'read',       duration: '6months',  status: 'approved', daysAgo: 7  },
    { user: 'Sarah Chen',     dept: 'Trading',    datasetId: 'bloomberg-terminal', accessType: 'api',        duration: '12months', status: 'approved', daysAgo: 20 },
    { user: 'Sarah Chen',     dept: 'Trading',    datasetId: 'sgx-trade',          accessType: 'read',       duration: '12months', status: 'approved', daysAgo: 4  },
    { user: 'Michael Torres', dept: 'Risk',       datasetId: 'fitch-ratings',      accessType: 'read',       duration: '12months', status: 'approved', daysAgo: 10 },
    { user: 'Michael Torres', dept: 'Risk',       datasetId: 'moodys-analytics',   accessType: 'read',       duration: '6months',  status: 'approved', daysAgo: 6  },
    { user: 'Michael Torres', dept: 'Risk',       datasetId: 'mas610',             accessType: 'read',       duration: '12months', status: 'approved', daysAgo: 3  },
    { user: 'Lisa Nguyen',    dept: 'Finance',    datasetId: 'sp-global',          accessType: 'read',       duration: '3months',  status: 'pending',  daysAgo: 1  },
    { user: 'Tom Bradley',    dept: 'Technology', datasetId: 'refinitiv-eikon',    accessType: 'api',        duration: '6months',  status: 'pending',  daysAgo: 0  },
    { user: 'Nina Patel',     dept: 'Risk',       datasetId: 'otc-derivatives',    accessType: 'read',       duration: '12months', status: 'rejected', daysAgo: 4  },
    { user: 'Carlos Ruiz',    dept: 'Compliance', datasetId: 'fitch-ratings',      accessType: 'read-write', duration: '6months',  status: 'rejected', daysAgo: 9  },
  ];
  seeds.forEach(s => {
    const dataset  = DATASETS.find(d => d.id === s.datasetId);
    const approver = APPROVERS[s.dept] || 'Dept Head';
    const req = {
      id: genId(), datasetId: s.datasetId, datasetName: dataset.name,
      provider: dataset.provider, icon: dataset.icon,
      requester: s.user, department: s.dept, justification: 'Seeded demo request.',
      duration: s.duration, accessType: s.accessType, status: s.status,
      submittedAt: new Date(Date.now() - s.daysAgo * 86400000).toISOString(),
      approver, approverComment: '', rangerPolicyId: null,
    };
    if (s.status === 'approved') {
      const policy = buildRangerPolicy(req);
      if (policy) { req.rangerPolicyId = policy.policyId; state.rangerPolicies.push(policy); }
    }
    state.requests.push(req);
  });
}

let activityLogFilter = 'all';
let activityActiveTab = 'activity';

function setActivityTab(tab) {
  activityActiveTab = tab;
  document.querySelectorAll('.activity-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-atab="' + tab + '"]').classList.add('active');
  document.getElementById('activity-tab-activity').style.display = tab === 'activity' ? '' : 'none';
  document.getElementById('activity-tab-access').style.display   = tab === 'access'   ? '' : 'none';
  if (tab === 'activity') { renderFlowDiagram(); renderActivityStats(); renderActivityLog(); }
  if (tab === 'access')   renderAccessReport();
}

function setActivityLogFilter(f) {
  activityLogFilter = f;
  document.querySelectorAll('[data-afilter]').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-afilter="' + f + '"]').classList.add('active');
  renderActivityLog();
}

function renderActivity() {
  if (activityActiveTab === 'activity') {
    renderFlowDiagram();
    renderActivityStats();
    renderActivityLog();
  } else {
    renderAccessReport();
  }
}

function renderActivityStats() {
  const approved = state.requests.filter(r => r.status === 'approved').length;
  const pending  = state.requests.filter(r => r.status === 'pending').length;
  const rejected = state.requests.filter(r => r.status === 'rejected').length;
  const users    = new Set(state.requests.map(r => r.requester)).size;
  const datasets = new Set(state.requests.map(r => r.datasetId)).size;
  const total    = state.requests.length;
  document.getElementById('activity-stats').innerHTML = `
    <div class="stat-card approved"><div class="stat-value">${approved}</div><div class="stat-label">Active Grants</div></div>
    <div class="stat-card pending"><div class="stat-value">${pending}</div><div class="stat-label">Pending</div></div>
    <div class="stat-card rejected"><div class="stat-value">${rejected}</div><div class="stat-label">Rejected</div></div>
    <div class="stat-card" style="border-left:4px solid var(--accent2)"><div class="stat-value" style="color:var(--accent2)">${users}</div><div class="stat-label">Unique Users</div></div>
    <div class="stat-card" style="border-left:4px solid var(--accent)"><div class="stat-value" style="color:var(--accent)">${datasets}</div><div class="stat-label">Datasets</div></div>
    <div class="stat-card" style="border-left:4px solid #0F71BB"><div class="stat-value" style="color:#0F71BB">${total}</div><div class="stat-label">Total Requests</div></div>`;
}

function renderActivityLog() {
  const deptFilter = document.getElementById('activity-filter-dept') ? document.getElementById('activity-filter-dept').value : '';
  const rows = state.requests.filter(r =>
    (activityLogFilter === 'all' || r.status === activityLogFilter) &&
    (!deptFilter || r.department === deptFilter)
  );
  const container = document.getElementById('activity-log-list');
  if (!rows.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No activity found.</p></div>`;
    return;
  }

  const PERM_MAP = {
    'read':       ['SELECT'],
    'read-write': ['SELECT', 'UPDATE', 'INSERT'],
    'api':        ['SELECT', 'EXECUTE'],
    'bulk':       ['SELECT', 'EXPORT'],
  };

  container.innerHTML = rows.map(r => {
    const schema  = DATASET_SCHEMAS[r.datasetId];
    const perms   = PERM_MAP[r.accessType] || ['SELECT'];
    const tables  = schema ? schema.tables.map(t => schema.database + '.' + t.name) : [r.datasetId + '.*'];
    const user    = r.requester.toLowerCase().replace(' ', '.') + '@corp.com';

    // Generate representative SQL based on access type
    let sqlBlock = '';
    if (r.status === 'approved' && schema) {
      const tbl = tables[0];
      const cols = schema.tables[0] ? schema.tables[0].columns.slice(0, 5).join(', ') : '*';
      if (r.accessType === 'read' || r.accessType === 'api') {
        sqlBlock = `SELECT ${cols}\nFROM ${tbl}\nWHERE department = '${r.department}'\nLIMIT 1000;`;
      } else if (r.accessType === 'read-write') {
        sqlBlock = `-- Read\nSELECT ${cols} FROM ${tbl} WHERE department = '${r.department}';\n\n-- Write\nINSERT INTO ${tbl} (${cols})\nVALUES (/* ... */);`;
      } else if (r.accessType === 'bulk') {
        sqlBlock = `SELECT *\nFROM ${tbl}\nWHERE department = '${r.department}'\nINTO OUTFILE '/export/${r.datasetId}_${r.department}.csv'\nFIELDS TERMINATED BY ',';`;
      }
    }

    return `
      <div class="activity-log-card">
        <div class="activity-log-card-header">
          <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap">
            <span class="user-avatar">${r.requester.split(' ').map(n=>n[0]).join('')}</span>
            <div>
              <div style="font-weight:700;font-size:0.9rem">${r.requester}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">${user}</div>
            </div>
            <span class="dept-chip dept-${r.department.toLowerCase()}">${r.department}</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">
            <span class="status-badge ${r.status}">${statusLabel(r.status)}</span>
            <span style="font-size:0.75rem;color:var(--text-muted)">${formatDate(r.submittedAt)}</span>
          </div>
        </div>
        <div class="activity-log-card-body">
          <div class="activity-log-meta">
            <span>${r.icon} <strong>${r.datasetName}</strong></span>
            <span class="perm-chip">${r.accessType}</span>
            ${r.rangerPolicyId ? `<span class="ranger-badge">🛡️ ${r.rangerPolicyId}</span>` : ''}
            <span style="font-size:0.75rem;color:var(--text-muted)">Duration: ${r.duration}</span>
          </div>
          ${sqlBlock ? `
          <div class="activity-sql-block">
            <div class="activity-sql-label">🗄️ Sample Query — ${r.accessType} access via Ranger policy</div>
            <pre class="activity-sql-code">${sqlBlock}</pre>
          </div>` : r.status === 'pending' ? `
          <div style="font-size:0.78rem;color:var(--text-muted);padding:0.5rem 0;font-style:italic">
            ⏳ SQL access will be available once request is approved and Ranger policy is provisioned.
          </div>` : ''}
        </div>
      </div>`;
  }).join('');
}

function renderAccessReport() {
  const deptFilter = document.getElementById('access-filter-dept')
    ? document.getElementById('access-filter-dept').value
    : (document.getElementById('activity-filter-dept') ? document.getElementById('activity-filter-dept').value : '');
  const approved = state.requests.filter(r =>
    r.status === 'approved' && (!deptFilter || r.department === deptFilter)
  );
  const container = document.getElementById('access-report-content');

  if (!approved.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><p>No approved access grants found.</p></div>`;
    return;
  }

  // Group by user
  const byUser = {};
  approved.forEach(r => {
    if (!byUser[r.requester]) byUser[r.requester] = [];
    byUser[r.requester].push(r);
  });

  const summaryApproved = approved.length;
  const uniqueUsers     = Object.keys(byUser).length;
  const uniqueDatasets  = new Set(approved.map(r => r.datasetId)).size;
  const uniquePolicies  = new Set(approved.filter(r => r.rangerPolicyId).map(r => r.rangerPolicyId)).size;

  container.innerHTML = `
    <div class="stats-row" style="margin-bottom:1.5rem">
      <div class="stat-card approved"><div class="stat-value">${summaryApproved}</div><div class="stat-label">Active Grants</div></div>
      <div class="stat-card" style="border-left:4px solid var(--accent2)"><div class="stat-value" style="color:var(--accent2)">${uniqueUsers}</div><div class="stat-label">Users</div></div>
      <div class="stat-card" style="border-left:4px solid var(--accent)"><div class="stat-value" style="color:var(--accent)">${uniqueDatasets}</div><div class="stat-label">Datasets</div></div>
      <div class="stat-card" style="border-left:4px solid #0F71BB"><div class="stat-value" style="color:#0F71BB">${uniquePolicies}</div><div class="stat-label">Ranger Policies</div></div>
    </div>

    ${Object.entries(byUser).map(([userName, reqs]) => {
      const email   = userName.toLowerCase().replace(' ', '.') + '@corp.com';
      const dept    = reqs[0].department;
      const group   = 'dept_' + dept.toLowerCase();
      const initials = userName.split(' ').map(n => n[0]).join('');
      const policies = reqs.filter(r => r.rangerPolicyId);

      return `
        <div class="access-report-card">
          <!-- User header -->
          <div class="access-report-header">
            <div style="display:flex;align-items:center;gap:1rem">
              <div class="access-report-avatar">${initials}</div>
              <div>
                <div style="font-weight:700;font-size:1rem">${userName}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.1rem">📧 ${email}</div>
              </div>
            </div>
            <span class="dept-chip dept-${dept.toLowerCase()}">${dept}</span>
          </div>

          <div class="access-report-grid">
            <!-- Account details -->
            <div class="access-report-section">
              <div class="access-report-section-title">👤 Account Details</div>
              <div class="access-kv"><span>Full Name</span><code>${userName}</code></div>
              <div class="access-kv"><span>Email</span><code>${email}</code></div>
              <div class="access-kv"><span>Department</span><code>${dept}</code></div>
              <div class="access-kv"><span>User Group</span><code>${group}</code></div>
              <div class="access-kv"><span>AD Role</span><code>role_analyst</code></div>
              <div class="access-kv"><span>Active Grants</span><code>${reqs.length}</code></div>
            </div>

            <!-- Group memberships -->
            <div class="access-report-section">
              <div class="access-report-section-title">🏷️ Group Memberships</div>
              ${[group, 'grp_data_consumers', 'grp_' + dept.toLowerCase() + '_readers'].map(g =>
                `<div class="access-kv"><span>Group</span><code>${g}</code></div>`
              ).join('')}
              <div style="margin-top:0.75rem">
                <div class="access-report-section-title">🔑 Permissions</div>
                ${[...new Set(reqs.map(r => r.accessType))].map(a =>
                  `<div class="access-kv"><span>Access Type</span><code>${a}</code></div>`
                ).join('')}
              </div>
            </div>

            <!-- Dataset access -->
            <div class="access-report-section" style="grid-column:1/-1">
              <div class="access-report-section-title">🗄️ Dataset Access (${reqs.length} grant${reqs.length !== 1 ? 's' : ''})</div>
              <table style="width:100%;border-collapse:collapse;font-size:0.8rem;margin-top:0.5rem">
                <thead>
                  <tr style="background:var(--surface2)">
                    <th style="padding:0.5rem 0.75rem;text-align:left;font-size:0.7rem;font-weight:700;color:#491DB6;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid var(--border)">Dataset</th>
                    <th style="padding:0.5rem 0.75rem;text-align:left;font-size:0.7rem;font-weight:700;color:#491DB6;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid var(--border)">Access Type</th>
                    <th style="padding:0.5rem 0.75rem;text-align:left;font-size:0.7rem;font-weight:700;color:#491DB6;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid var(--border)">Ranger Policy</th>
                    <th style="padding:0.5rem 0.75rem;text-align:left;font-size:0.7rem;font-weight:700;color:#491DB6;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid var(--border)">Duration</th>
                    <th style="padding:0.5rem 0.75rem;text-align:left;font-size:0.7rem;font-weight:700;color:#491DB6;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid var(--border)">Approved</th>
                    <th style="padding:0.5rem 0.75rem;text-align:left;font-size:0.7rem;font-weight:700;color:#491DB6;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid var(--border)">Approver</th>
                  </tr>
                </thead>
                <tbody>
                  ${reqs.map((r, i) => `
                    <tr style="background:${i % 2 === 0 ? 'var(--surface)' : 'var(--bg)'}">
                      <td style="padding:0.55rem 0.75rem;border-bottom:1px solid var(--border)">${r.icon} ${r.datasetName}</td>
                      <td style="padding:0.55rem 0.75rem;border-bottom:1px solid var(--border)"><span class="perm-chip">${r.accessType}</span></td>
                      <td style="padding:0.55rem 0.75rem;border-bottom:1px solid var(--border)">${r.rangerPolicyId ? `<span class="ranger-badge" style="font-size:0.68rem">🛡️ ${r.rangerPolicyId}</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
                      <td style="padding:0.55rem 0.75rem;border-bottom:1px solid var(--border);font-size:0.75rem;color:var(--text-muted)">${r.duration}</td>
                      <td style="padding:0.55rem 0.75rem;border-bottom:1px solid var(--border);font-size:0.75rem;color:var(--text-muted)">${formatDate(r.submittedAt)}</td>
                      <td style="padding:0.55rem 0.75rem;border-bottom:1px solid var(--border);font-size:0.75rem;color:var(--text-muted)">${r.approver}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>`;
    }).join('')}`;
}

// ── Risk & Compliance Dashboard ───────────────────────────────────────────────
let riskActiveTab = 'dashboard';

function setRiskTab(tab) {
  riskActiveTab = tab;
  document.querySelectorAll('.risk-nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-rtab="' + tab + '"]').classList.add('active');
  document.getElementById('risk-tab-dashboard').style.display = tab === 'dashboard' ? '' : 'none';
  document.getElementById('risk-tab-activity').style.display  = tab === 'activity'  ? '' : 'none';
  document.getElementById('risk-tab-access').style.display    = tab === 'access'    ? '' : 'none';
  if (tab === 'activity') renderActivity();
  if (tab === 'access')   renderAccessReport();
  if (tab === 'dashboard') renderRiskDashboard();
}

function renderRiskDashboard() {
  const all       = state.requests;
  const approved  = all.filter(r => r.status === 'approved');
  const pending   = all.filter(r => r.status === 'pending');
  const rejected  = all.filter(r => r.status === 'rejected');
  const total     = all.length;

  // ── Scorecard metrics ──────────────────────────────────────────────────────
  const approvalRate    = total ? Math.round((approved.length / total) * 100) : 0;
  const rejectionRate   = total ? Math.round((rejected.length / total) * 100) : 0;
  const pendingRate     = total ? Math.round((pending.length  / total) * 100) : 0;
  const restrictedAccess = approved.filter(r => { const d = DATASETS.find(x => x.id === r.datasetId); return d && d.tier === 'Restricted'; });
  const bulkAccess       = approved.filter(r => r.accessType === 'bulk');
  const rwAccess         = approved.filter(r => r.accessType === 'read-write');
  const permanentAccess  = approved.filter(r => r.duration === 'permanent');
  const uniqueUsers      = new Set(approved.map(r => r.requester)).size;
  const uniqueDatasets   = new Set(approved.map(r => r.datasetId)).size;
  const policiesActive   = state.rangerPolicies.length;

  // ── Compliance scorecard ───────────────────────────────────────────────────
  const scores = [
    {
      label: 'Access Approval Rate',
      value: approvalRate,
      target: 80,
      unit: '%',
      desc: 'Percentage of requests approved vs total submitted',
      status: approvalRate >= 80 ? 'pass' : approvalRate >= 60 ? 'warn' : 'fail',
    },
    {
      label: 'Pending Resolution Rate',
      value: 100 - pendingRate,
      target: 90,
      unit: '%',
      desc: 'Percentage of requests resolved (not left pending)',
      status: pendingRate <= 10 ? 'pass' : pendingRate <= 25 ? 'warn' : 'fail',
    },
    {
      label: 'Restricted Data Controls',
      value: restrictedAccess.length === 0 ? 100 : Math.max(0, 100 - restrictedAccess.length * 15),
      target: 85,
      unit: '%',
      desc: 'Score based on number of active Restricted-tier access grants',
      status: restrictedAccess.length === 0 ? 'pass' : restrictedAccess.length <= 2 ? 'warn' : 'fail',
    },
    {
      label: 'Bulk Download Governance',
      value: bulkAccess.length === 0 ? 100 : Math.max(0, 100 - bulkAccess.length * 20),
      target: 80,
      unit: '%',
      desc: 'Score based on number of bulk download access grants',
      status: bulkAccess.length === 0 ? 'pass' : bulkAccess.length <= 2 ? 'warn' : 'fail',
    },
    {
      label: 'Permanent Access Minimisation',
      value: permanentAccess.length === 0 ? 100 : Math.max(0, 100 - permanentAccess.length * 25),
      target: 90,
      unit: '%',
      desc: 'Score penalised for permanent (non-expiring) access grants',
      status: permanentAccess.length === 0 ? 'pass' : permanentAccess.length === 1 ? 'warn' : 'fail',
    },
    {
      label: 'Ranger Policy Coverage',
      value: approved.length ? Math.round((approved.filter(r => r.rangerPolicyId).length / approved.length) * 100) : 100,
      target: 100,
      unit: '%',
      desc: 'Percentage of approved grants with an active Ranger policy',
      status: approved.every(r => r.rangerPolicyId) ? 'pass' : 'warn',
    },
  ];

  const overallScore = Math.round(scores.reduce((s, c) => s + c.value, 0) / scores.length);
  const overallStatus = overallScore >= 85 ? 'pass' : overallScore >= 65 ? 'warn' : 'fail';
  const overallLabel  = { pass: 'Compliant', warn: 'Needs Attention', fail: 'At Risk' }[overallStatus];
  const overallColor  = { pass: 'var(--success)', warn: 'var(--warning)', fail: 'var(--danger)' }[overallStatus];

  // ── Risk flags ─────────────────────────────────────────────────────────────
  const flags = [];
  if (restrictedAccess.length > 0)
    flags.push({ level: 'high',   icon: '🔴', msg: `${restrictedAccess.length} active grant(s) on Restricted-tier datasets`, detail: restrictedAccess.map(r => r.requester + ' → ' + r.datasetName).join(', ') });
  if (bulkAccess.length > 0)
    flags.push({ level: 'medium', icon: '🟡', msg: `${bulkAccess.length} bulk download grant(s) active`, detail: bulkAccess.map(r => r.requester + ' → ' + r.datasetName).join(', ') });
  if (permanentAccess.length > 0)
    flags.push({ level: 'medium', icon: '🟡', msg: `${permanentAccess.length} permanent (non-expiring) access grant(s)`, detail: permanentAccess.map(r => r.requester + ' → ' + r.datasetName).join(', ') });
  if (rwAccess.length > 2)
    flags.push({ level: 'medium', icon: '🟡', msg: `${rwAccess.length} read-write grants — review write access necessity`, detail: rwAccess.map(r => r.requester + ' → ' + r.datasetName).join(', ') });
  if (pending.length > 3)
    flags.push({ level: 'low',    icon: '🔵', msg: `${pending.length} requests pending approval — action required`, detail: '' });
  if (flags.length === 0)
    flags.push({ level: 'none',   icon: '✅', msg: 'No active risk flags — all access controls within policy', detail: '' });

  // ── Access by department ───────────────────────────────────────────────────
  const byDept = {};
  approved.forEach(r => { byDept[r.department] = (byDept[r.department] || 0) + 1; });
  const maxDeptCount = Math.max(...Object.values(byDept), 1);

  // ── Access by dataset tier ─────────────────────────────────────────────────
  const byTier = { Premium: 0, Standard: 0, Restricted: 0 };
  approved.forEach(r => { const d = DATASETS.find(x => x.id === r.datasetId); if (d) byTier[d.tier] = (byTier[d.tier] || 0) + 1; });

  // ── Access type breakdown ──────────────────────────────────────────────────
  const byType = {};
  approved.forEach(r => { byType[r.accessType] = (byType[r.accessType] || 0) + 1; });

  const SCORE_COLOR = { pass: 'var(--success)', warn: 'var(--warning)', fail: 'var(--danger)' };
  const SCORE_BG    = { pass: '#ECFBEE', warn: '#FFFAEB', fail: '#FFF4F3' };
  const SCORE_LABEL = { pass: 'Pass', warn: 'Review', fail: 'Fail' };

  document.getElementById('risk-dashboard-content').innerHTML = `
    <!-- Header -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.75rem">
      <div>
        <h2 style="font-size:1.25rem;font-weight:900;margin-bottom:0.25rem">🛡️ Risk &amp; Compliance Dashboard</h2>
        <p style="font-size:0.82rem;color:var(--text-muted)">Data access governance overview · As of ${new Date().toLocaleDateString('en-SG', {day:'numeric',month:'long',year:'numeric'})}</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="exportComplianceScorecard()">⬇ Export Scorecard</button>
    </div>

    <!-- Overall score banner -->
    <div class="risk-score-banner" style="border-left:6px solid ${overallColor}">
      <div>
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.3rem">Overall Compliance Score</div>
        <div style="font-size:2.5rem;font-weight:900;color:${overallColor};line-height:1">${overallScore}<span style="font-size:1.2rem">%</span></div>
        <div style="font-size:0.85rem;font-weight:700;color:${overallColor};margin-top:0.25rem">${overallLabel}</div>
      </div>
      <div class="risk-score-ring">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" stroke-width="10"/>
          <circle cx="50" cy="50" r="42" fill="none" stroke="${overallColor}" stroke-width="10"
            stroke-dasharray="${Math.round(overallScore * 2.638)} 263.8"
            stroke-dashoffset="65.95" stroke-linecap="round" transform="rotate(-90 50 50)"/>
          <text x="50" y="55" text-anchor="middle" font-size="20" font-weight="900" fill="${overallColor}" font-family="Lato,sans-serif">${overallScore}</text>
        </svg>
      </div>
      <div class="risk-score-stats">
        <div class="risk-mini-stat"><span>${approved.length}</span><label>Active Grants</label></div>
        <div class="risk-mini-stat"><span>${uniqueUsers}</span><label>Users</label></div>
        <div class="risk-mini-stat"><span>${uniqueDatasets}</span><label>Datasets</label></div>
        <div class="risk-mini-stat"><span>${policiesActive}</span><label>Policies</label></div>
      </div>
    </div>

    <!-- Compliance scorecard -->
    <div style="margin-bottom:1.75rem">
      <h3 class="risk-section-title">📋 Compliance Scorecard</h3>
      <div class="risk-scorecard-grid">
        ${scores.map(s => `
          <div class="risk-scorecard-item" style="border-left:4px solid ${SCORE_COLOR[s.status]}">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0.5rem">
              <div style="font-size:0.85rem;font-weight:700;color:var(--text)">${s.label}</div>
              <span style="font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:4px;background:${SCORE_BG[s.status]};color:${SCORE_COLOR[s.status]};white-space:nowrap">${SCORE_LABEL[s.status]}</span>
            </div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:0.6rem;line-height:1.4">${s.desc}</div>
            <div style="display:flex;align-items:center;gap:0.75rem">
              <div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${s.value}%;background:${SCORE_COLOR[s.status]};border-radius:4px;transition:width 0.6s"></div>
              </div>
              <span style="font-size:0.85rem;font-weight:900;color:${SCORE_COLOR[s.status]};min-width:36px;text-align:right">${s.value}${s.unit}</span>
            </div>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.3rem">Target: ${s.target}${s.unit}</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Risk flags -->
    <div style="margin-bottom:1.75rem">
      <h3 class="risk-section-title">⚠️ Risk Flags</h3>
      <div style="display:flex;flex-direction:column;gap:0.6rem">
        ${flags.map(f => `
          <div class="risk-flag risk-flag-${f.level}">
            <span style="font-size:1.1rem">${f.icon}</span>
            <div>
              <div style="font-size:0.85rem;font-weight:700">${f.msg}</div>
              ${f.detail ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.2rem">${f.detail}</div>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Charts row -->
    <div class="risk-charts-row">
      <!-- Access by department -->
      <div class="risk-chart-card">
        <div class="risk-section-title" style="margin-bottom:1rem">📊 Access Grants by Department</div>
        ${Object.entries(byDept).sort((a,b) => b[1]-a[1]).map(([dept, count]) => `
          <div style="margin-bottom:0.6rem">
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:0.25rem">
              <span class="dept-chip dept-${dept.toLowerCase()}">${dept}</span>
              <span style="font-weight:700;color:var(--text)">${count}</span>
            </div>
            <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${Math.round((count/maxDeptCount)*100)}%;background:var(--accent);border-radius:4px"></div>
            </div>
          </div>`).join('')}
      </div>

      <!-- Access by tier -->
      <div class="risk-chart-card">
        <div class="risk-section-title" style="margin-bottom:1rem">🏷️ Access by Dataset Tier</div>
        ${[
          { tier: 'Premium',    color: '#491DB6', bg: '#EBF1FF' },
          { tier: 'Standard',   color: '#0A8217', bg: '#ECFBEE' },
          { tier: 'Restricted', color: '#D7260F', bg: '#FFF4F3' },
        ].map(t => `
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.85rem">
            <div style="width:40px;height:40px;border-radius:var(--radius);background:${t.bg};border:1.5px solid ${t.color};display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">
              ${t.tier === 'Premium' ? '⭐' : t.tier === 'Standard' ? '✅' : '🔒'}
            </div>
            <div style="flex:1">
              <div style="font-size:0.82rem;font-weight:700;color:${t.color}">${t.tier}</div>
              <div style="font-size:0.72rem;color:var(--text-muted)">${byTier[t.tier] || 0} active grant${byTier[t.tier] !== 1 ? 's' : ''}</div>
            </div>
            <div style="font-size:1.5rem;font-weight:900;color:${t.color}">${byTier[t.tier] || 0}</div>
          </div>`).join('')}
      </div>

      <!-- Access type breakdown -->
      <div class="risk-chart-card">
        <div class="risk-section-title" style="margin-bottom:1rem">🔑 Access Type Breakdown</div>
        ${Object.entries(byType).sort((a,b) => b[1]-a[1]).map(([type, count]) => {
          const pct = approved.length ? Math.round((count/approved.length)*100) : 0;
          const typeColor = { read: 'var(--accent2)', 'read-write': 'var(--warning)', api: 'var(--accent)', bulk: 'var(--danger)' }[type] || 'var(--text-muted)';
          return `
          <div style="margin-bottom:0.6rem">
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:0.25rem">
              <span class="perm-chip">${type}</span>
              <span style="font-weight:700;color:var(--text)">${count} <span style="color:var(--text-muted);font-weight:400">(${pct}%)</span></span>
            </div>
            <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${typeColor};border-radius:4px"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- User access detail table -->
    <div style="margin-top:1.75rem">
      <h3 class="risk-section-title">👥 User Access Detail</h3>
      <div class="requests-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Department</th>
              <th>Dataset</th>
              <th>Tier</th>
              <th>Access Type</th>
              <th>Duration</th>
              <th>Ranger Policy</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            ${approved.map(r => {
              const ds = DATASETS.find(d => d.id === r.datasetId);
              const tier = ds ? ds.tier : '—';
              const riskLevel = (tier === 'Restricted' || r.accessType === 'bulk' || r.duration === 'permanent')
                ? '<span style="color:#D7260F;font-weight:700;font-size:0.75rem">🔴 High</span>'
                : (r.accessType === 'read-write' || tier === 'Premium')
                ? '<span style="color:#B54708;font-weight:700;font-size:0.75rem">🟡 Medium</span>'
                : '<span style="color:#0A8217;font-weight:700;font-size:0.75rem">🟢 Low</span>';
              return `<tr>
                <td><span class="user-avatar">${r.requester.split(' ').map(n=>n[0]).join('')}</span> ${r.requester}</td>
                <td><span class="dept-chip dept-${r.department.toLowerCase()}">${r.department}</span></td>
                <td>${r.icon} ${r.datasetName}</td>
                <td><span class="tier-badge ${tier}">${tier}</span></td>
                <td><span class="perm-chip">${r.accessType}</span></td>
                <td style="font-size:0.78rem;color:var(--text-muted)">${r.duration}</td>
                <td>${r.rangerPolicyId ? `<span class="ranger-badge" style="font-size:0.68rem">🛡️ ${r.rangerPolicyId}</span>` : '<span style="color:var(--text-muted);font-size:0.78rem">—</span>'}</td>
                <td>${riskLevel}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function exportComplianceScorecard() {
  const all      = state.requests;
  const approved = all.filter(r => r.status === 'approved');
  const lines    = [
    'MAS Enterprise Data Marketplace — Compliance Scorecard',
    'Generated: ' + new Date().toLocaleString('en-SG'),
    '',
    'SUMMARY',
    'Total Requests,' + all.length,
    'Approved,' + approved.length,
    'Pending,' + all.filter(r => r.status === 'pending').length,
    'Rejected,' + all.filter(r => r.status === 'rejected').length,
    'Active Ranger Policies,' + state.rangerPolicies.length,
    '',
    'USER ACCESS GRANTS',
    'User,Department,Dataset,Tier,Access Type,Duration,Ranger Policy,Approved By,Date',
    ...approved.map(r => {
      const ds = DATASETS.find(d => d.id === r.datasetId);
      return [r.requester, r.department, r.datasetName, ds ? ds.tier : '', r.accessType, r.duration, r.rangerPolicyId || '', r.approver, new Date(r.submittedAt).toLocaleDateString('en-SG')].join(',');
    }),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'MAS_Compliance_Scorecard_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToast('Scorecard exported as CSV ✅');
}


function renderFlowDiagram() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }

  const deptFilter = document.getElementById('activity-filter-dept')
    ? document.getElementById('activity-filter-dept').value : '';
  const requests = state.requests
    .filter(r => !deptFilter || r.department === deptFilter)
    .slice()
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const wrap = document.getElementById('flow-canvas-wrap');

  const STATUS_COLOR = { approved: '#0A8217', pending: '#F79009', rejected: '#D7260F' };
  const STATUS_BG    = { approved: '#ECFBEE', pending: '#FFFAEB', rejected: '#FFF4F3' };
  const STATUS_ICON  = { approved: '✅', pending: '⏳', rejected: '❌' };

  const rowH   = 52;
  const padTop = 48;
  const svgH   = padTop + requests.length * rowH + 16;
  const W      = wrap.clientWidth || 900;

  // Column x-centres
  const COL = {
    user:    W * 0.18,
    arrow:   W * 0.50,
    dataset: W * 0.82,
  };

  // Build header row
  const headerCols = [
    { x: COL.user,    label: 'User',    color: '#5925DC' },
    { x: COL.arrow,   label: 'Request', color: '#667085' },
    { x: COL.dataset, label: 'Dataset', color: '#1F69FF' },
  ];

  const headerSvg = headerCols.map(h =>
    `<text x="${h.x}" y="22" text-anchor="middle" font-size="11" font-weight="700"
      fill="${h.color}" font-family="Lato,sans-serif" letter-spacing="0.06em"
      style="text-transform:uppercase">${h.label.toUpperCase()}</text>`
  ).join('');

  // Divider line under header
  const divider = `<line x1="16" y1="32" x2="${W - 16}" y2="32" stroke="#D0D5DD" stroke-width="1"/>`;

  // Build each request row
  const rows = requests.map((r, i) => {
    const y      = padTop + i * rowH + rowH / 2;
    const color  = STATUS_COLOR[r.status] || '#98A2B3';
    const bg     = STATUS_BG[r.status]    || '#F7F7F9';
    const icon   = STATUS_ICON[r.status]  || '•';
    const initials = r.requester.split(' ').map(n => n[0]).join('');
    const date   = formatDate(r.submittedAt);
    const dataset = DATASETS.find(d => d.id === r.datasetId);
    const dsLabel = dataset ? dataset.provider : r.datasetId;
    const dsIcon  = dataset ? dataset.icon : '📦';

    // Alternating row stripe
    const stripe = i % 2 === 0
      ? `<rect x="0" y="${y - rowH/2}" width="${W}" height="${rowH}" fill="#F7F7F9" rx="0"/>`
      : '';

    // Avatar circle
    const avatar = `
      <circle cx="${COL.user - 52}" cy="${y}" r="16" fill="url(#avatarGrad)" />
      <text x="${COL.user - 52}" y="${y + 4}" text-anchor="middle" font-size="10"
        font-weight="700" fill="#ffffff" font-family="Lato,sans-serif">${initials}</text>`;

    // User name + department
    const userText = `
      <text x="${COL.user - 30}" y="${y - 5}" font-size="12" font-weight="600"
        fill="#1D2939" font-family="Lato,sans-serif">${r.requester}</text>
      <text x="${COL.user - 30}" y="${y + 10}" font-size="10" fill="#667085"
        font-family="Lato,sans-serif">${r.department}</text>`;

    // Arrow line from user col to dataset col
    const arrowX1 = COL.user + (W * 0.18);
    const arrowX2 = COL.dataset - (W * 0.10);
    const arrowLine = `
      <line x1="${arrowX1}" y1="${y}" x2="${arrowX2 - 8}" y2="${y}"
        stroke="${color}" stroke-width="1.5" stroke-dasharray="${r.status === 'approved' ? 'none' : '5,3'}"/>
      <polygon points="${arrowX2},${y} ${arrowX2-8},${y-4} ${arrowX2-8},${y+4}"
        fill="${color}" opacity="0.85"/>`;

    // Label on arrow: dataset name + date
    const midX = (arrowX1 + arrowX2) / 2;
    const arrowLabel = `
      <rect x="${midX - 62}" y="${y - 18}" width="124" height="14" rx="3"
        fill="${bg}" stroke="${color}" stroke-width="0.8"/>
      <text x="${midX}" y="${y - 7}" text-anchor="middle" font-size="9.5" font-weight="600"
        fill="${color}" font-family="Lato,sans-serif">${r.accessType} · ${date}</text>`;

    // Status icon on arrow
    const statusDot = `
      <circle cx="${midX}" cy="${y + 10}" r="7" fill="${bg}" stroke="${color}" stroke-width="1"/>
      <text x="${midX}" y="${y + 14}" text-anchor="middle" font-size="8"
        font-family="Lato,sans-serif">${icon}</text>`;

    // Dataset pill
    const dsPillW = 110;
    const dsPill = `
      <rect x="${COL.dataset - dsPillW/2}" y="${y - 16}" width="${dsPillW}" height="32"
        rx="6" fill="#EBF1FF" stroke="#5925DC" stroke-width="1.5"/>
      <text x="${COL.dataset - dsPillW/2 + 10}" y="${y + 4}" font-size="14"
        font-family="Lato,sans-serif">${dsIcon}</text>
      <text x="${COL.dataset - dsPillW/2 + 28}" y="${y - 3}" font-size="10" font-weight="700"
        fill="#491DB6" font-family="Lato,sans-serif">${dsLabel}</text>
      <text x="${COL.dataset - dsPillW/2 + 28}" y="${y + 10}" font-size="9" fill="#5925DC"
        font-family="Lato,sans-serif">${r.datasetName.length > 14 ? r.datasetName.slice(0,14)+'…' : r.datasetName}</text>`;

    return stripe + avatar + userText + arrowLine + arrowLabel + statusDot + dsPill;
  }).join('');

  wrap.innerHTML = `
    <svg width="${W}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5925DC"/>
          <stop offset="100%" stop-color="#1F69FF"/>
        </linearGradient>
      </defs>
      ${headerSvg}
      ${divider}
      ${rows}
    </svg>`;
}

// ── Dataset Detail Drawer ─────────────────────────────────────────────────────
let detailChartAnim = null;
let drawerActiveTab = 'overview';

function openDetailDrawer(datasetId, tab) {
  drawerActiveTab = tab || 'overview';
  const dataset = DATASETS.find(d => d.id === datasetId);
  const meta    = DATASET_META[datasetId];
  const schema  = DATASET_SCHEMAS[datasetId];
  const catalog = DATASET_CATALOG[datasetId];
  if (!dataset) return;

  const months = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
  const alreadyApproved = state.requests.some(r => r.datasetId === datasetId && r.requester === state.currentUser.name && (r.status === 'approved' || r.status === 'pending'));

  const SENSITIVITY_COLOR = {
    'Restricted':   { bg: '#FFF4F3', color: '#D7260F', border: '#FB7463' },
    'Confidential': { bg: '#FFFAEB', color: '#B54708', border: '#FEC84B' },
    'Internal':     { bg: '#EBF1FF', color: '#491DB6', border: '#99BBFF' },
    'Public':       { bg: '#ECFBEE', color: '#0A8217', border: '#58BE62' },
  };

  function sensitivityBadge(s) {
    const c = SENSITIVITY_COLOR[s] || SENSITIVITY_COLOR['Internal'];
    return `<span style="display:inline-block;padding:0.15rem 0.55rem;border-radius:4px;font-size:0.7rem;font-weight:700;background:${c.bg};color:${c.color};border:1px solid ${c.border};text-transform:uppercase;letter-spacing:0.05em">${s}</span>`;
  }

  // ── Tab: Overview ──────────────────────────────────────────────────────────
  const overviewHtml = `
    <div class="drawer-metrics">
      ${meta ? meta.keyMetrics.map(m => `
        <div class="drawer-metric">
          <div class="drawer-metric-value">${m.value}</div>
          <div class="drawer-metric-label">${m.label}</div>
        </div>`).join('') : ''}
      <div class="drawer-metric">
        <div class="drawer-metric-value">${dataset.sla}</div>
        <div class="drawer-metric-label">SLA</div>
      </div>
      <div class="drawer-metric">
        <div class="drawer-metric-value">${schema ? schema.tables.length : '—'}</div>
        <div class="drawer-metric-label">Tables</div>
      </div>
    </div>

    <div class="drawer-section">
      <div class="drawer-section-title">About this dataset</div>
      <p class="drawer-desc">${dataset.description}</p>
      ${meta ? `
      <div class="drawer-detail-grid">
        <div class="drawer-detail-item"><span class="drawer-detail-label">Coverage</span><span>${meta.coverage}</span></div>
        <div class="drawer-detail-item"><span class="drawer-detail-label">Update Frequency</span><span>${meta.updateFreq}</span></div>
        <div class="drawer-detail-item"><span class="drawer-detail-label">Record Count</span><span>${meta.recordCount}</span></div>
        <div class="drawer-detail-item"><span class="drawer-detail-label">Formats</span><span>${meta.dataFormats.join(', ')}</span></div>
      </div>
      <div style="margin-top:0.75rem">
        <span class="drawer-detail-label">Use Cases</span>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.4rem">
          ${meta.useCases.map(u => `<span class="tag">${u}</span>`).join('')}
        </div>
      </div>` : ''}
    </div>

    ${meta ? `
    <div class="drawer-section">
      <div class="drawer-section-title">Last 12 Months — ${meta.chartLabel}</div>
      <div class="chart-wrap">
        <canvas id="detail-chart" height="160"></canvas>
      </div>
      <div class="chart-months">${months.map(m => `<span>${m}</span>`).join('')}</div>
    </div>` : ''}

    ${schema ? `
    <div class="drawer-section">
      <div class="drawer-section-title">Available Tables (${schema.tables.length})</div>
      <div class="drawer-tables">
        ${schema.tables.map(t => `
          <div class="drawer-table-row">
            <div class="drawer-table-name">📋 ${schema.database}.<strong>${t.name}</strong></div>
            <div class="drawer-table-desc">${t.description}</div>
            <div class="drawer-table-cols">${t.columns.map(c => `<span class="col-chip">${c}</span>`).join('')}</div>
          </div>`).join('')}
      </div>
    </div>` : ''}

    <div class="drawer-section" style="padding-bottom:0">
      <div class="drawer-section-title">Tags</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.5rem">
        ${dataset.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </div>`;

  // ── Tab: Business Definitions ──────────────────────────────────────────────
  const catalogHtml = catalog ? `
    <div class="drawer-section" style="border-bottom:none">
      <div class="drawer-section-title">Business Data Catalog — ${catalog.tables.length} Table${catalog.tables.length !== 1 ? 's' : ''}</div>
      <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1.25rem">
        Business definitions, data ownership, and column-level meanings for each table in this dataset.
      </p>
      ${catalog.tables.map((t, ti) => `
        <div class="catalog-table-block" style="margin-bottom:1.5rem;border:1.5px solid var(--border);border-radius:var(--radius);overflow:hidden">
          <!-- Table header -->
          <div style="background:linear-gradient(90deg,var(--surface2),var(--bg));padding:1rem 1.25rem;border-bottom:1.5px solid var(--border)">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
              <div>
                <div style="font-weight:700;font-size:0.95rem;color:var(--text);margin-bottom:0.2rem">
                  📋 <span style="font-family:'SF Mono','Fira Code',monospace;color:var(--accent)">${schema ? schema.database + '.' : ''}${t.name}</span>
                </div>
                <div style="font-size:0.85rem;font-weight:600;color:var(--text)">${t.businessName}</div>
              </div>
              <div style="display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap">
                ${sensitivityBadge(t.sensitivity)}
                <span style="font-size:0.72rem;color:var(--text-muted);background:var(--bg);border:1px solid var(--border);padding:0.15rem 0.5rem;border-radius:4px">⏱ ${t.updateFreq}</span>
              </div>
            </div>
          </div>

          <!-- Business meaning & use -->
          <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div>
              <div style="font-size:0.72rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem">Business Meaning</div>
              <p style="font-size:0.82rem;color:var(--text);line-height:1.6">${t.businessMeaning}</p>
            </div>
            <div>
              <div style="font-size:0.72rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem">Business Use</div>
              <p style="font-size:0.82rem;color:var(--text);line-height:1.6">${t.businessUse}</p>
            </div>
          </div>

          <!-- Data owner -->
          <div style="padding:0.65rem 1.25rem;border-bottom:1px solid var(--border);background:var(--bg);display:flex;align-items:center;gap:0.5rem">
            <span style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">Data Owner:</span>
            <span style="font-size:0.82rem;font-weight:600;color:var(--text)">👤 ${t.dataOwner}</span>
          </div>

          <!-- Key column definitions -->
          <div style="padding:0.85rem 1.25rem">
            <div style="font-size:0.72rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.6rem">Key Column Definitions</div>
            <table style="width:100%;border-collapse:collapse;font-size:0.8rem">
              <thead>
                <tr style="background:var(--surface2)">
                  <th style="padding:0.5rem 0.75rem;text-align:left;font-size:0.7rem;font-weight:700;color:#491DB6;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid var(--border);width:30%">Column</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;font-size:0.7rem;font-weight:700;color:#491DB6;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid var(--border)">Business Definition</th>
                </tr>
              </thead>
              <tbody>
                ${t.keyColumns.map((col, ci) => `
                  <tr style="background:${ci % 2 === 0 ? 'var(--surface)' : 'var(--bg)'}">
                    <td style="padding:0.55rem 0.75rem;border-bottom:1px solid var(--border);font-family:'SF Mono','Fira Code',monospace;font-size:0.75rem;color:var(--accent);font-weight:600;vertical-align:top">${col.name}</td>
                    <td style="padding:0.55rem 0.75rem;border-bottom:1px solid var(--border);color:var(--text);line-height:1.5;vertical-align:top">${col.meaning}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`).join('')}
    </div>` : `<div class="empty-state"><div class="empty-icon">📖</div><p>No business definitions available for this dataset.</p></div>`;

  // ── Tab: Request Access ────────────────────────────────────────────────────
  const requestHtml = `
    <div class="drawer-section drawer-request-section" style="border-bottom:none">
      <div class="drawer-section-title">Request Access</div>
      ${alreadyApproved ? `
        <div class="drawer-already-requested">
          <span>✅</span>
          <span>You already have a pending or approved request for this dataset.</span>
          <button class="btn btn-outline btn-sm" onclick="closeDetailDrawer();switchView('requests')">View My Requests</button>
        </div>` : `
      <div class="drawer-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Department</label>
            <select class="form-control" id="drawer-dept">${DEPARTMENTS.map(d => `<option value="${d}"${d===state.currentUser.department?' selected':''}>${d}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Access Type</label>
            <select class="form-control" id="drawer-access-type">
              <option value="read">Read Only</option>
              <option value="read-write">Read / Write</option>
              <option value="api">API Access</option>
              <option value="bulk">Bulk Download</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Access Duration</label>
          <select class="form-control" id="drawer-duration">
            <option value="1month">1 Month</option>
            <option value="3months">3 Months</option>
            <option value="6months" selected>6 Months</option>
            <option value="12months">12 Months</option>
            <option value="permanent">Permanent</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Business Justification <span style="color:var(--danger)">*</span></label>
          <textarea class="form-control" id="drawer-justification" rows="3" placeholder="Describe why you need access and how the data will be used…"></textarea>
        </div>
        <div class="drawer-form-note">ℹ️ Request will be routed to your department head for approval.</div>
        <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1rem">
          <button class="btn btn-outline" onclick="closeDetailDrawer()">Cancel</button>
          <button class="btn btn-primary" onclick="submitDrawerRequest('${dataset.id}')">Submit Request →</button>
        </div>
      </div>`}
    </div>`;

  const tabs = [
    { id: 'overview',    label: '📋 Overview' },
    { id: 'catalog',     label: '📖 Business Definitions' },
    { id: 'request',     label: '🔑 Request Access' },
  ];

  const tabContent = { overview: overviewHtml, catalog: catalogHtml, request: requestHtml };

  document.getElementById('drawer-inner').innerHTML = `
    <div class="drawer-header">
      <div class="drawer-header-left">
        <span class="drawer-icon">${dataset.icon}</span>
        <div>
          <div class="drawer-title">${dataset.name}</div>
          <div class="drawer-subtitle">${dataset.provider} &nbsp;·&nbsp; ${dataset.category} &nbsp;·&nbsp; <span class="tier-badge ${dataset.tier}" style="vertical-align:middle">${dataset.tier}</span></div>
        </div>
      </div>
      <button class="drawer-close" onclick="closeDetailDrawer()">✕</button>
    </div>

    <div class="drawer-tab-bar">
      ${tabs.map(t => `
        <button class="drawer-tab${drawerActiveTab === t.id ? ' active' : ''}"
          onclick="switchDrawerTab('${datasetId}','${t.id}')">${t.label}</button>`).join('')}
    </div>

    <div id="drawer-tab-content">
      ${tabContent[drawerActiveTab]}
    </div>
  `;

  document.getElementById('detail-drawer-overlay').classList.add('open');
  document.getElementById('detail-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';

  if (drawerActiveTab === 'overview' && meta) requestAnimationFrame(() => drawDetailChart(meta));
}

function switchDrawerTab(datasetId, tab) {
  drawerActiveTab = tab;
  openDetailDrawer(datasetId, tab);
  // Scroll tab content to top
  const content = document.getElementById('drawer-tab-content');
  if (content) content.scrollTop = 0;
}
function closeDetailDrawer() {
  if (detailChartAnim) { cancelAnimationFrame(detailChartAnim); detailChartAnim = null; }
  document.getElementById('detail-drawer-overlay').classList.remove('open');
  document.getElementById('detail-drawer').classList.remove('open');
  document.body.style.overflow = '';
}

function drawDetailChart(meta) {
  const canvas = document.getElementById('detail-chart');
  if (!canvas) return;
  canvas.width = canvas.parentElement.clientWidth;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const data = meta.chartData;
  const color = meta.chartColor;
  const pad = { top: 20, right: 16, bottom: 8, left: 48 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const min = Math.min(...data) * 0.88;
  const max = Math.max(...data) * 1.08;

  function xPos(i) { return pad.left + (i / (data.length - 1)) * cW; }
  function yPos(v) { return pad.top + cH - ((v - min) / (max - min)) * cH; }

  let progress = 0;

  function frame() {
    ctx.clearRect(0, 0, W, H);
    progress = Math.min(progress + 0.04, 1);
    const visibleCount = Math.max(2, Math.round(progress * data.length));

    // Grid lines
    ctx.strokeStyle = '#E4E7EC'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (cH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      const val = max - ((max - min) / 4) * i;
      ctx.fillStyle = '#98A2B3'; ctx.font = '10px Lato,sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(val >= 1000 ? (val/1000).toFixed(1)+'K' : val.toFixed(1), pad.left - 6, y);
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0, color + '40');
    grad.addColorStop(1, color + '05');
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(data[0]));
    for (let i = 1; i < visibleCount; i++) ctx.lineTo(xPos(i), yPos(data[i]));
    ctx.lineTo(xPos(visibleCount - 1), pad.top + cH);
    ctx.lineTo(xPos(0), pad.top + cH);
    ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(data[0]));
    for (let i = 1; i < visibleCount; i++) ctx.lineTo(xPos(i), yPos(data[i]));
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.setLineDash([]); ctx.stroke();

    // Dots
    for (let i = 0; i < visibleCount; i++) {
      ctx.beginPath(); ctx.arc(xPos(i), yPos(data[i]), i === visibleCount - 1 ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    }

    // Value label on last visible point
    const lx = xPos(visibleCount - 1), ly = yPos(data[visibleCount - 1]);
    ctx.fillStyle = color; ctx.font = 'bold 11px Lato,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    const lv = data[visibleCount - 1];
    ctx.fillText(lv >= 1000 ? (lv/1000).toFixed(1)+'K' : lv.toFixed(1), lx, ly - 8);

    if (progress < 1) detailChartAnim = requestAnimationFrame(frame);
  }

  frame();
}

function submitDrawerRequest(datasetId) {
  const justification = document.getElementById('drawer-justification').value.trim();
  const department    = document.getElementById('drawer-dept').value;
  const duration      = document.getElementById('drawer-duration').value;
  const accessType    = document.getElementById('drawer-access-type').value;
  if (!justification) { showToast('Please provide a business justification.', 'error'); return; }
  const dataset  = DATASETS.find(d => d.id === datasetId);
  const approver = APPROVERS[department] || 'Department Head';
  state.requests.unshift({
    id: genId(), datasetId: dataset.id, datasetName: dataset.name,
    provider: dataset.provider, icon: dataset.icon,
    requester: state.currentUser.name, department, justification,
    duration, accessType, status: 'pending',
    submittedAt: new Date().toISOString(), approver, approverComment: '', rangerPolicyId: null,
  });
  closeDetailDrawer();
  showToast('Request submitted — pending approval from ' + approver);
  switchView('requests');
}

// ── Central Bank News Feed ────────────────────────────────────────────────────
var cbfeedSelectedRegion = null;

var CB_REGIONS = {
  'ASEAN & Singapore': { icon: '🌏', color: '#5925DC', bg: '#EBF1FF', border: '#99BBFF', desc: 'MAS, Bank Negara Malaysia, and ASEAN central banks' },
  'Americas':          { icon: '🌎', color: '#0F71BB', bg: '#E6F3FB', border: '#58A1D4', desc: 'Federal Reserve, Bank of Canada, and Latin American central banks' },
  'Europe':            { icon: '🌍', color: '#B8962E', bg: '#FFFAEB', border: '#B8962E', desc: 'ECB, Bank of England, Swiss National Bank' },
  'Asia Pacific':      { icon: '🗾', color: '#D7260F', bg: '#FFF4F3', border: '#FB7463', desc: 'Bank of Japan, PBOC, RBI, RBA, and regional central banks' },
};

var CB_FEEDS = [
  { time: '11:42', ago: '3 min ago', bank: 'MAS', flag: '🇸🇬', region: 'ASEAN & Singapore', title: 'MAS Announces Expansion of Equity Market Development Programme', summary: 'MAS will expand the Equity Market Development Programme from S$5 billion to S$6.5 billion to deepen Singapore\'s equity market ecosystem.', impact: 'Positive', tags: ['Equity Markets', 'Capital Markets', 'Singapore'], url: 'https://www.mas.gov.sg/news/media-releases', breaking: true },
  { time: '08:30', ago: '3 hrs ago', bank: 'BNM', flag: '🇲🇾', region: 'ASEAN & Singapore', title: 'Bank Negara Malaysia Maintains OPR at 3.00%', summary: 'BNM held the Overnight Policy Rate steady at 3.00%, noting balanced risks to growth and inflation. Ringgit strengthened 0.3% post-announcement.', impact: 'Neutral', tags: ['Interest Rates', 'MYR', 'Malaysia'], url: 'https://www.bnm.gov.my/monetary-stability', breaking: false },
  { time: '11:30', ago: '15 min ago', bank: 'Federal Reserve', flag: '🇺🇸', region: 'Americas', title: 'Fed Holds Rates Steady at 4.25-4.50%, Signals Patience', summary: 'The Federal Open Market Committee voted unanimously to maintain the federal funds rate. Chair Powell indicated the Fed will remain data-dependent through mid-2026.', impact: 'Neutral', tags: ['Interest Rates', 'Monetary Policy', 'USD'], url: 'https://www.federalreserve.gov/newsevents.htm', breaking: true },
  { time: '10:45', ago: '1 hr ago', bank: 'ECB', flag: '🇪🇺', region: 'Europe', title: 'ECB Cuts Deposit Rate by 25bps to 3.25%', summary: 'The European Central Bank reduced its deposit facility rate by 25 basis points, citing slowing inflation and weakening economic growth in the eurozone.', impact: 'Dovish', tags: ['Interest Rates', 'EUR', 'Eurozone'], url: 'https://www.ecb.europa.eu/press/pr/html/index.en.html', breaking: false },
  { time: '08:00', ago: '3.5 hrs ago', bank: 'BOE', flag: '🇬🇧', region: 'Europe', title: 'Bank of England Minutes Show 6-3 Vote to Hold at 4.50%', summary: 'Three MPC members voted for a 25bps cut, up from two at the previous meeting. Markets now pricing 60% probability of a June cut.', impact: 'Dovish Tilt', tags: ['Interest Rates', 'GBP', 'UK'], url: 'https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes', breaking: false },
  { time: '07:00', ago: '4.5 hrs ago', bank: 'SNB', flag: '🇨🇭', region: 'Europe', title: 'Swiss National Bank Holds Rate at 1.25%, Warns on CHF Strength', summary: 'SNB maintained its policy rate and reiterated willingness to intervene in FX markets if the Swiss franc appreciates excessively.', impact: 'Neutral', tags: ['FX', 'CHF', 'Switzerland'], url: 'https://www.snb.ch/en/ifor/media/id/media_releases', breaking: false },
  { time: '10:15', ago: '1.5 hrs ago', bank: 'BOJ', flag: '🇯🇵', region: 'Asia Pacific', title: 'Bank of Japan Maintains Yield Curve Control, Widens Band', summary: 'BOJ kept its short-term rate target at 0.25% but widened the 10-year JGB yield band, signalling gradual normalisation.', impact: 'Hawkish', tags: ['YCC', 'JPY', 'Bond Yields'], url: 'https://www.boj.or.jp/en/mopo/mpmdeci/index.htm', breaking: false },
  { time: '09:30', ago: '2 hrs ago', bank: 'PBOC', flag: '🇨🇳', region: 'Asia Pacific', title: 'PBOC Sets USD/CNY Fixing at 7.0892, Stronger Than Expected', summary: 'The People\'s Bank of China set the daily reference rate for the yuan at 7.0892 per dollar, 120 pips stronger than market consensus.', impact: 'CNY Supportive', tags: ['FX', 'CNY', 'China'], url: 'http://www.pbc.gov.cn/en/3688006/index.html', breaking: false },
  { time: '09:00', ago: '2.5 hrs ago', bank: 'RBI', flag: '🇮🇳', region: 'Asia Pacific', title: 'RBI Holds Repo Rate at 6.50%, Raises GDP Forecast', summary: 'The Reserve Bank of India kept its benchmark repo rate unchanged at 6.50% for the sixth consecutive meeting. GDP growth forecast for FY2027 raised to 7.2%.', impact: 'Neutral', tags: ['Interest Rates', 'INR', 'India'], url: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx', breaking: false },
  { time: '07:30', ago: '4 hrs ago', bank: 'RBA', flag: '🇦🇺', region: 'Asia Pacific', title: 'RBA Cuts Cash Rate to 3.85%, First Cut in 18 Months', summary: 'The Reserve Bank of Australia reduced the cash rate by 25bps to 3.85%, citing progress on inflation returning to the 2-3% target band.', impact: 'Dovish', tags: ['Interest Rates', 'AUD', 'Australia'], url: 'https://www.rba.gov.au/media-releases/', breaking: false },
];

function renderCBFeed() {
  var container = document.getElementById('cbfeed-content');
  if (cbfeedSelectedRegion) { renderCBFeedList(container); } else { renderCBFeedCategories(container); }
}

function selectCBRegion(r) { cbfeedSelectedRegion = r; renderCBFeed(); }
function showCBRegions() { cbfeedSelectedRegion = null; renderCBFeed(); }

function renderCBFeedCategories(container) {
  var now = new Date();
  var rc = {}, rb = {};
  CB_FEEDS.forEach(function(f) { rc[f.region] = (rc[f.region]||0)+1; if (f.breaking) rb[f.region] = (rb[f.region]||0)+1; });
  var totalBreaking = CB_FEEDS.filter(function(f){return f.breaking;}).length;
  container.innerHTML =
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">' +
      '<div><h2 style="font-size:1.25rem;font-weight:900;margin-bottom:0.25rem">Central Bank Feeds</h2>' +
      '<p style="font-size:0.82rem;color:var(--text-muted)">Real-time updates from global central banks · ' + now.toLocaleTimeString('en-SG',{hour:'2-digit',minute:'2-digit'}) + ' SGT</p></div>' +
      '<div style="display:flex;gap:0.5rem;align-items:center"><span class="cbfeed-live">● LIVE</span><button class="btn btn-primary btn-sm" onclick="renderCBFeed()">↺ Refresh</button></div>' +
    '</div>' +
    '<div class="stats-row" style="margin-bottom:1.75rem">' +
      '<div class="stat-card" style="border-left:4px solid #D7260F"><div class="stat-value" style="color:#D7260F">' + totalBreaking + '</div><div class="stat-label">Breaking</div></div>' +
      '<div class="stat-card" style="border-left:4px solid var(--accent)"><div class="stat-value" style="color:var(--accent)">' + CB_FEEDS.length + '</div><div class="stat-label">Total Updates</div></div>' +
      '<div class="stat-card" style="border-left:4px solid var(--accent2)"><div class="stat-value" style="color:var(--accent2)">' + Object.keys(CB_REGIONS).length + '</div><div class="stat-label">Regions</div></div>' +
      '<div class="stat-card" style="border-left:4px solid #0A8217"><div class="stat-value" style="color:#0A8217">10</div><div class="stat-label">Central Banks</div></div>' +
    '</div>' +
    '<div class="catalog-cat-grid">' + Object.keys(CB_REGIONS).map(function(reg) {
      var m = CB_REGIONS[reg], n = rc[reg]||0, b = rb[reg]||0;
      var banks = CB_FEEDS.filter(function(f){return f.region===reg;}).map(function(f){return f.flag;}).filter(function(v,i,a){return a.indexOf(v)===i;}).join(' ');
      return '<div class="cat-tile" onclick="selectCBRegion(\'' + reg.replace(/'/g,"\\'") + '\')" style="border-color:' + m.border + ';background:' + m.bg + '">' +
        '<div class="cat-tile-icon" style="background:' + m.color + '22;color:' + m.color + '">' + m.icon + '</div>' +
        '<div class="cat-tile-name" style="color:' + m.color + '">' + reg + '</div>' +
        '<div class="cat-tile-desc">' + m.desc + '</div>' +
        '<div style="font-size:1.1rem;margin:0.25rem 0">' + banks + '</div>' +
        '<div class="cat-tile-footer">' +
          '<span class="cat-tile-count" style="color:' + m.color + '">' + n + ' update' + (n!==1?'s':'') + '</span>' +
          (b > 0 ? '<span style="font-size:0.72rem;font-weight:700;color:#D7260F;background:#FFF4F3;border:1px solid #FB7463;padding:0.1rem 0.45rem;border-radius:4px">BREAKING ' + b + '</span>' : '') +
        '</div></div>';
    }).join('') + '</div>';
}

function renderCBFeedList(container) {
  var reg = cbfeedSelectedRegion, m = CB_REGIONS[reg]||{};
  var now = new Date();
  var IMPACT_STYLE = {
    'Positive': { color: '#0A8217', bg: '#ECFBEE', border: '#58BE62' },
    'Neutral': { color: '#0F71BB', bg: '#E6F3FB', border: '#58A1D4' },
    'Dovish': { color: '#5925DC', bg: '#EBF1FF', border: '#99BBFF' },
    'Hawkish': { color: '#D7260F', bg: '#FFF4F3', border: '#FB7463' },
    'Dovish Tilt': { color: '#5925DC', bg: '#EBF1FF', border: '#99BBFF' },
    'CNY Supportive': { color: '#B54708', bg: '#FFFAEB', border: '#FEC84B' },
  };
  var feeds = CB_FEEDS.filter(function(f){return f.region===reg;});
  container.innerHTML =
    '<div style="margin-bottom:1.25rem">' +
      '<button class="btn btn-outline btn-sm" onclick="showCBRegions()" style="border-color:var(--border);color:var(--text);margin-bottom:0.5rem">← All Regions</button>' +
      '<div class="catalog-active-cat"><span style="font-size:1.2rem">' + (m.icon||'') + '</span><span style="font-weight:900;color:' + (m.color||'var(--accent)') + '">' + reg + '</span><span style="color:var(--text-muted);font-size:0.82rem">— ' + feeds.length + ' update' + (feeds.length!==1?'s':'') + ' · ' + now.toLocaleTimeString('en-SG',{hour:'2-digit',minute:'2-digit'}) + ' SGT</span></div>' +
    '</div>' +
    feeds.map(function(f) {
      var imp = IMPACT_STYLE[f.impact] || IMPACT_STYLE['Neutral'];
      return '<div class="cbfeed-card' + (f.breaking ? ' cbfeed-breaking' : '') + '">' +
        '<div class="cbfeed-card-header">' +
          '<div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap">' +
            '<span style="font-size:1.3rem">' + f.flag + '</span>' +
            '<span class="cbfeed-bank">' + f.bank + '</span>' +
            '<span class="cbfeed-time">' + f.time + ' SGT · ' + f.ago + '</span>' +
            (f.breaking ? '<span class="cbfeed-breaking-badge">BREAKING</span>' : '') +
          '</div>' +
          '<span class="cbfeed-impact" style="background:' + imp.bg + ';color:' + imp.color + ';border-color:' + imp.border + '">' + f.impact + '</span>' +
        '</div>' +
        '<div class="cbfeed-card-body">' +
          '<div class="cbfeed-title">' + f.title + '</div>' +
          '<p class="cbfeed-summary">' + f.summary + '</p>' +
          '<div class="cbfeed-tags">' + f.tags.map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('') +
            '<a href="' + f.url + '" target="_blank" rel="noopener" class="cbfeed-readmore">Read more →</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
}

// ── AI Agents ─────────────────────────────────────────────────────────────────
var AI_AGENTS = [
  { id: 'query',    name: 'Query Agent',         avatar: '🔍', color: '#5925DC', bg: '#EBF1FF', border: '#99BBFF', desc: 'Natural language to SQL — query any dataset, get structured results instantly', skills: ['Text-to-SQL', 'Schema lookup', 'Data filtering', 'Join optimisation'], status: 'Ready' },
  { id: 'viz',      name: 'Visualisation Agent',  avatar: '📊', color: '#0F71BB', bg: '#E6F3FB', border: '#58A1D4', desc: 'Auto-generate charts, graphs, and dashboards from query results', skills: ['Bar/line/donut charts', 'Heatmaps', 'Network diagrams', 'Time series'], status: 'Ready' },
  { id: 'predict',  name: 'Predictive Agent',     avatar: '🔮', color: '#B8962E', bg: '#FFFAEB', border: '#B8962E', desc: 'ML-driven forecasting — predict trends, anomalies, and risk signals', skills: ['Time series forecast', 'Anomaly detection', 'Risk scoring', 'Scenario analysis'], status: 'Ready' },
  { id: 'report',   name: 'Report Agent',         avatar: '📋', color: '#0A8217', bg: '#ECFBEE', border: '#58BE62', desc: 'Generate structured reports — compliance, risk, activity summaries', skills: ['PDF/CSV export', 'Executive summary', 'Compliance report', 'Audit trail'], status: 'Ready' },
  { id: 'present',  name: 'Presentation Agent',   avatar: '🎯', color: '#D7260F', bg: '#FFF4F3', border: '#FB7463', desc: 'Create slide decks and briefing materials from data insights', skills: ['Slide generation', 'Key findings', 'Chart embedding', 'Narrative flow'], status: 'Ready' },
  { id: 'api',      name: 'API Agent',            avatar: '🔗', color: '#344054', bg: '#F7F7F9', border: '#98A2B3', desc: 'Connect to external APIs — fetch live data, trigger webhooks, and orchestrate integrations', skills: ['REST/GraphQL calls', 'Data ingestion', 'Webhook triggers', 'Rate limiting'], status: 'Ready' },
  { id: 'catalog',  name: 'Catalog Agent',        avatar: '🗄️', color: '#1B2A4A', bg: '#EBF1FF', border: '#99BBFF', desc: 'Explore and manage the data catalog — search datasets, view lineage, and check data quality', skills: ['Dataset search', 'Schema explorer', 'Data lineage', 'Quality scoring'], status: 'Ready' },
  { id: 'ingest',   name: 'Ingestion Agent',      avatar: '📥', color: '#0F71BB', bg: '#E6F3FB', border: '#58A1D4', desc: 'Automate data ingestion pipelines — pull from sources, validate, deduplicate, and load into target schemas', skills: ['Batch ingestion', 'Stream ingestion', 'Deduplication', 'Schema validation'], status: 'Ready' },
  { id: 'transform','name': 'Transformation Agent', avatar: '⚙️', color: '#5925DC', bg: '#EBF1FF', border: '#99BBFF', desc: 'Apply data transformations — clean, enrich, normalise, and reshape datasets for downstream consumption', skills: ['Data cleaning', 'Normalisation', 'Enrichment', 'Format conversion'], status: 'Ready' },
];

var activeAgentId = null;
var orchestrateSelected = {};
var orchestrateRunning = false;

function setAgentTab(tab) {
  document.querySelectorAll('.ai-agents-tab').forEach(function(t){t.classList.remove('active');});
  document.querySelector('[data-agtab="'+tab+'"]').classList.add('active');
  document.getElementById('ai-agents-panel').style.display = tab === 'agents' ? '' : 'none';
  document.getElementById('ai-orchestrate-panel').style.display = tab === 'orchestrate' ? '' : 'none';
  document.getElementById('ai-agent-workspace').style.display = 'none';
  if (tab === 'orchestrate') renderOrchestrate();
}

function renderOrchestrate() {
  var container = document.getElementById('ai-orchestrate-content');
  container.innerHTML =
    '<div style="margin-bottom:1.25rem"><h3 style="font-size:1rem;font-weight:900;margin-bottom:0.3rem">Pipeline Orchestration</h3>' +
    '<p style="font-size:0.78rem;color:var(--text-muted)">Select agents and define a task — they\'ll run in sequence as a pipeline</p></div>' +
    '<div class="orch-agents-select">' +
    AI_AGENTS.map(function(a) {
      var sel = orchestrateSelected[a.id] ? ' orch-selected' : '';
      return '<div class="orch-agent-chip' + sel + '" onclick="toggleOrchAgent(\'' + a.id + '\')">' +
        '<span class="orch-agent-chip-avatar" style="background:' + a.bg + ';border-color:' + a.border + '">' + a.avatar + '</span>' +
        '<span class="orch-agent-chip-name">' + a.name + '</span>' +
        '<span class="orch-agent-chip-check">' + (orchestrateSelected[a.id] ? '✅' : '') + '</span>' +
      '</div>';
    }).join('') +
    '</div>' +
    // Selected pipeline
    '<div class="orch-pipeline" id="orch-pipeline">' + renderOrchPipeline() + '</div>' +
    // Task input
    '<div style="margin-top:1rem"><label class="form-label">Task Description</label>' +
    '<textarea class="form-control" id="orch-task" rows="2" placeholder="e.g. Query OTC swap data, visualise the network, predict contagion risk, generate a compliance report, and create a presentation deck"></textarea></div>' +
    '<div style="margin-top:0.75rem;display:flex;gap:0.5rem">' +
    '<button class="btn btn-primary" onclick="runOrchestration()" ' + (Object.keys(orchestrateSelected).length < 2 ? 'disabled title="Select at least 2 agents"' : '') + '>▶ Run Pipeline (' + Object.keys(orchestrateSelected).length + ' agents)</button>' +
    '<button class="btn btn-outline btn-sm" onclick="orchestrateSelected={};renderOrchestrate()" style="border-color:var(--border);color:var(--text)">Clear</button>' +
    '</div>' +
    // Results area
    '<div id="orch-results" style="margin-top:1.25rem"></div>';
}

function toggleOrchAgent(id) {
  if (orchestrateSelected[id]) delete orchestrateSelected[id];
  else orchestrateSelected[id] = Object.keys(orchestrateSelected).length + 1;
  renderOrchestrate();
}

function renderOrchPipeline() {
  var ids = Object.keys(orchestrateSelected).sort(function(a,b){return orchestrateSelected[a]-orchestrateSelected[b];});
  if (!ids.length) return '<div style="padding:1rem;text-align:center;color:var(--text-muted);font-size:0.82rem">Select agents above to build your pipeline</div>';
  return '<div class="orch-pipeline-track">' +
    ids.map(function(id, i) {
      var a = AI_AGENTS.find(function(x){return x.id===id;});
      return '<div class="orch-pipeline-node" style="border-color:' + a.border + '">' +
        '<span style="font-size:1rem">' + a.avatar + '</span>' +
        '<span style="font-size:0.72rem;font-weight:700;color:' + a.color + '">' + a.name.split(' ')[0] + '</span>' +
        '<span class="orch-step-num">' + (i+1) + '</span>' +
      '</div>' +
      (i < ids.length - 1 ? '<span class="orch-pipeline-arrow">→</span>' : '');
    }).join('') +
  '</div>';
}

function runOrchestration() {
  var ids = Object.keys(orchestrateSelected).sort(function(a,b){return orchestrateSelected[a]-orchestrateSelected[b];});
  var task = document.getElementById('orch-task') ? document.getElementById('orch-task').value.trim() : '';
  if (ids.length < 2) return;
  if (!task) task = 'Run full analysis pipeline on available datasets';
  var results = document.getElementById('orch-results');
  results.innerHTML = '<div style="font-size:0.85rem;font-weight:700;margin-bottom:0.75rem">⏳ Running pipeline…</div>';
  var idx = 0;
  function runNext() {
    if (idx >= ids.length) {
      results.innerHTML += '<div class="orch-result-done">✅ Pipeline complete — all ' + ids.length + ' agents finished successfully</div>';
      return;
    }
    var a = AI_AGENTS.find(function(x){return x.id===ids[idx];});
    var stepNum = idx + 1;
    results.innerHTML += '<div class="orch-result-step" id="orch-step-' + idx + '">' +
      '<div class="orch-result-step-header"><span style="font-size:1rem">' + a.avatar + '</span><strong>' + a.name + '</strong><span class="orch-step-status" style="color:var(--warning)">⏳ Running…</span></div>' +
      '<div class="orch-result-step-body" style="color:var(--text-muted);font-size:0.78rem">Processing: "' + task + '"</div></div>';
    results.scrollTop = results.scrollHeight;
    idx++;
    setTimeout(function() {
      var el = document.getElementById('orch-step-' + (idx-1));
      if (el) {
        el.querySelector('.orch-step-status').innerHTML = '✅ Done';
        el.querySelector('.orch-step-status').style.color = '#0A8217';
        el.querySelector('.orch-result-step-body').innerHTML = getOrchStepResult(a.id, task);
      }
      runNext();
    }, 1200 + Math.random() * 800);
  }
  runNext();
}

function getOrchStepResult(agentId, task) {
  var r = {
    query: '📄 Queried 3 tables, returned 48 rows · SQL generated and executed in 142ms',
    viz: '📊 Generated 4 charts: bar, line, donut, heatmap · Rendered in 320ms',
    predict: '🔮 Forecast complete: 30-day trend ▲ +2.4% · Confidence: 78% · Model: ARIMA+RF',
    report: '📋 Report generated: 12 pages, 6 sections · Format: PDF · Ready for download',
    present: '🎯 Presentation created: 7 slides with embedded charts · Format: PPTX',
    api: '🔗 API call: GET /api/v1/data · Status: 200 OK · 48 records · Latency: 142ms',
    catalog: '🗄️ Catalog search: found 4 matching datasets across 3 categories',
    ingest: '📥 Ingestion complete: 12,427 records loaded · 23 duplicates removed · Quality: 98%',
    transform: '⚙️ Transformation applied: cleaned, normalised, enriched · Quality score: 82% → 98%',
  };
  return r[agentId] || '✅ Task completed successfully';
}

function renderAgentsGrid() {
  var grid = document.getElementById('ai-agents-grid');
  grid.innerHTML = AI_AGENTS.map(function(a) {
    return '<div class="ai-agent-card" onclick="activateAgent(\'' + a.id + '\')">' +
      '<div class="ai-agent-card-top">' +
        '<div class="ai-agent-avatar" style="background:' + a.bg + ';border-color:' + a.border + '">' + a.avatar + '</div>' +
        '<div><div class="ai-agent-name" style="color:' + a.color + '">' + a.name + '</div>' +
        '<div class="ai-agent-status"><span class="ai-agent-dot" style="background:' + a.color + '"></span>' + a.status + '</div></div>' +
      '</div>' +
      '<p class="ai-agent-desc">' + a.desc + '</p>' +
      '<div class="ai-agent-skills">' + a.skills.map(function(s) { return '<span class="ai-agent-skill" style="color:' + a.color + ';border-color:' + a.border + '">' + s + '</span>'; }).join('') + '</div>' +
      '<button class="btn btn-primary btn-sm" style="width:100%;margin-top:0.5rem;background:' + a.color + '">Launch Agent →</button>' +
    '</div>';
  }).join('');
}

function activateAgent(agentId) {
  activeAgentId = agentId;
  var agent = AI_AGENTS.find(function(a) { return a.id === agentId; });
  if (!agent) return;

  document.getElementById('ai-agents-panel').style.display = 'none';
  document.getElementById('ai-orchestrate-panel').style.display = 'none';
  document.getElementById('ai-agents-header').style.display = 'none';
  var ws = document.getElementById('ai-agent-workspace');
  ws.style.display = 'flex';

  document.getElementById('ai-agent-ws-header').innerHTML =
    '<div style="display:flex;align-items:center;gap:0.75rem">' +
      '<button class="btn btn-outline btn-sm" onclick="backToAgents()" style="border-color:var(--border);color:var(--text)">← Back</button>' +
      '<div class="ai-agent-avatar" style="background:' + agent.bg + ';border-color:' + agent.border + ';width:36px;height:36px;font-size:1.1rem">' + agent.avatar + '</div>' +
      '<div><div style="font-weight:900;font-size:0.95rem;color:' + agent.color + '">' + agent.name + '</div>' +
      '<div style="font-size:0.72rem;color:var(--text-muted)">' + agent.desc + '</div></div>' +
    '</div>' +
    '<button class="btn btn-outline btn-sm" onclick="clearAiChat()" style="border-color:var(--border);color:var(--text)">🗑️ Clear</button>';

  var msgs = document.getElementById('aichat-messages');
  msgs.innerHTML = '<div class="aichat-msg aichat-bot"><div class="aichat-msg-avatar">' + agent.avatar + '</div><div class="aichat-msg-body">' +
    '<p><strong>' + agent.name + '</strong> is ready. ' + getAgentWelcome(agentId) + '</p></div></div>';

  document.getElementById('aichat-input').placeholder = getAgentPlaceholder(agentId);
  document.getElementById('aichat-input').focus();
}

function backToAgents() {
  activeAgentId = null;
  document.getElementById('ai-agent-workspace').style.display = 'none';
  document.getElementById('ai-agents-header').style.display = '';
  // Show the correct panel based on active tab
  var activeTab = document.querySelector('.ai-agents-tab.active');
  var tab = activeTab ? activeTab.dataset.agtab : 'agents';
  document.getElementById('ai-agents-panel').style.display = tab === 'agents' ? '' : 'none';
  document.getElementById('ai-orchestrate-panel').style.display = tab === 'orchestrate' ? '' : 'none';
  // Re-render the agents grid to ensure it has content
  renderAgentsGrid();
}

function getAgentWelcome(id) {
  var w = {
    query: 'Ask me anything about your datasets — I\'ll translate to SQL and return results.',
    viz: 'Describe the chart you want — I\'ll generate it from your data.',
    predict: 'Tell me what to forecast — I\'ll run predictive models on your data.',
    report: 'Tell me what report you need — compliance, risk, activity, or custom.',
    present: 'Describe your presentation topic — I\'ll create a slide outline with key findings.',
    api: 'Tell me which API to call or data to fetch — I\'ll handle authentication and return results.',
    catalog: 'Search the data catalog — I\'ll find datasets, show schemas, and check data quality.',
    ingest: 'Tell me what data to ingest — source, format, and target schema. I\'ll build the pipeline.',
    transform: 'Describe the transformation you need — cleaning, enrichment, or reshaping. I\'ll apply it.',
  };
  return w[id] || 'How can I help?';
}

function getAgentPlaceholder(id) {
  var p = {
    query: 'e.g. "Show DBS equity price today"',
    viz: 'e.g. "Create a bar chart of STI turnover this week"',
    predict: 'e.g. "Forecast USD/SGD for next 30 days"',
    report: 'e.g. "Generate compliance report for Q1 2026"',
    present: 'e.g. "Create a deck on OTC systemic risk findings"',
    api: 'e.g. "Fetch latest MAS exchange rates via API"',
    catalog: 'e.g. "Find all trade data datasets"',
    ingest: 'e.g. "Ingest SGX daily trade files into sgx_db"',
    transform: 'e.g. "Normalise OTC swap notional to USD"',
  };
  return p[id] || 'Ask this agent…';
}

// Override sendAiChat to use active agent avatar
var _origSendAiChat = typeof sendAiChat === 'function' ? sendAiChat : null;

function sendAiChat() {
  var input = document.getElementById('aichat-input');
  var q = input.value.trim();
  if (!q) return;
  input.value = '';
  var msgs = document.getElementById('aichat-messages');
  var agent = activeAgentId ? AI_AGENTS.find(function(a){return a.id===activeAgentId;}) : null;
  var botAvatar = agent ? agent.avatar : '🤖';
  // User message
  msgs.innerHTML += '<div class="aichat-msg aichat-user"><div class="aichat-msg-avatar">👤</div><div class="aichat-msg-body"><p>' + q + '</p></div></div>';
  msgs.scrollTop = msgs.scrollHeight;
  // Thinking
  var thinkId = 'think-' + Date.now();
  msgs.innerHTML += '<div class="aichat-msg aichat-bot" id="' + thinkId + '"><div class="aichat-msg-avatar">' + botAvatar + '</div><div class="aichat-msg-body"><p style="color:var(--text-muted)">' + (agent ? agent.name + ' is working…' : 'Analysing…') + '</p></div></div>';
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(function() {
    var resp = generateAgentResponse(q, activeAgentId);
    var el = document.getElementById(thinkId);
    if (el) el.querySelector('.aichat-msg-body').innerHTML = resp;
    msgs.scrollTop = msgs.scrollHeight;
  }, 800 + Math.random() * 600);
}

function generateAgentResponse(query, agentId) {
  if (agentId === 'viz') return generateVizResponse(query);
  if (agentId === 'predict') return generatePredictResponse(query);
  if (agentId === 'report') return generateReportResponse(query);
  if (agentId === 'present') return generatePresentResponse(query);
  if (agentId === 'api') return generateApiResponse(query);
  if (agentId === 'catalog') return generateCatalogResponse(query);
  if (agentId === 'ingest') return generateIngestResponse(query);
  if (agentId === 'transform') return generateTransformResponse(query);
  return generateAiResponse(query);
}

function generateVizResponse(q) {
  return '<p>📊 <strong>Visualisation generated:</strong></p>' +
    '<div class="aichat-result" style="background:#141e2b;border-radius:8px;padding:0.75rem;text-align:center">' +
    '<div style="color:#B8962E;font-size:0.78rem;margin-bottom:0.5rem">Chart rendered from query: "' + q + '"</div>' +
    '<div style="display:flex;gap:0.5rem;justify-content:center;align-items:flex-end;height:80px;padding:0 1rem">' +
    [65,42,78,55,88,35,72].map(function(v,i){return '<div style="width:24px;height:'+v+'px;background:'+['#5925DC','#0F71BB','#B54708','#0A8217','#D7260F','#B8962E','#1B2A4A'][i]+'cc;border-radius:3px 3px 0 0"></div>';}).join('') +
    '</div></div>' +
    '<p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.5rem">Chart type: Bar · Data points: 7 · Source: Auto-detected from query</p>';
}

function generatePredictResponse(q) {
  return '<p>🔮 <strong>Predictive Analysis:</strong></p>' +
    '<div class="aichat-result"><table><tr><th>Metric</th><th>Current</th><th>30-day Forecast</th><th>Confidence</th></tr>' +
    '<tr><td>Trend Direction</td><td>—</td><td style="color:#0A8217">▲ Upward</td><td>78%</td></tr>' +
    '<tr><td>Volatility</td><td>Medium</td><td>Low-Medium</td><td>72%</td></tr>' +
    '<tr><td>Anomaly Risk</td><td>Low</td><td>Low</td><td>85%</td></tr></table></div>' +
    '<p style="font-size:0.78rem;color:var(--text-muted)">Model: ARIMA + Random Forest ensemble · Training data: 12 months · Query: "' + q + '"</p>';
}

function generateReportResponse(q) {
  return '<p>📋 <strong>Report Generated:</strong></p>' +
    '<div style="background:var(--bg);border:1.5px solid var(--border);border-radius:8px;padding:1rem;margin:0.5rem 0">' +
    '<div style="font-weight:900;font-size:0.9rem;margin-bottom:0.5rem">📄 ' + q + '</div>' +
    '<div style="font-size:0.78rem;color:var(--text-muted);line-height:1.6">' +
    '<strong>Executive Summary:</strong> Based on analysis of 11 datasets across 7 categories, the report covers key findings on data access patterns, compliance status, and risk indicators.<br><br>' +
    '<strong>Sections:</strong> 1. Overview · 2. Key Metrics · 3. Risk Findings · 4. Recommendations · 5. Appendix<br><br>' +
    '<strong>Pages:</strong> 12 · <strong>Format:</strong> PDF</div></div>' +
    '<div style="display:flex;gap:0.5rem;margin-top:0.5rem"><button class="btn btn-primary btn-sm" onclick="showToast(\'Report downloaded ✅\')">⬇ Download PDF</button><button class="btn btn-outline btn-sm" style="border-color:var(--border);color:var(--text)">📧 Email Report</button></div>';
}

function generatePresentResponse(q) {
  return '<p>🎯 <strong>Presentation Outline:</strong></p>' +
    '<div style="background:var(--bg);border:1.5px solid var(--border);border-radius:8px;padding:1rem;margin:0.5rem 0">' +
    '<div style="font-weight:900;font-size:0.9rem;margin-bottom:0.75rem">🎯 ' + q + '</div>' +
    ['Title Slide — ' + q, 'Executive Summary & Key Findings', 'Data Overview — Sources & Coverage', 'Analytics Deep Dive — Charts & Insights', 'Risk Assessment & Compliance Status', 'Recommendations & Next Steps', 'Appendix — Methodology & Data Sources'].map(function(s, i) {
      return '<div style="display:flex;align-items:center;gap:0.6rem;padding:0.35rem 0;border-bottom:1px solid var(--border);font-size:0.82rem">' +
        '<span style="width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:900;flex-shrink:0">' + (i+1) + '</span>' + s + '</div>';
    }).join('') +
    '</div>' +
    '<div style="display:flex;gap:0.5rem;margin-top:0.5rem"><button class="btn btn-primary btn-sm" onclick="showToast(\'Deck generated ✅\')">⬇ Download PPTX</button><button class="btn btn-outline btn-sm" style="border-color:var(--border);color:var(--text)">✏️ Edit Slides</button></div>';
}

function generateApiResponse(q) {
  return '<p>🔗 <strong>API Call Executed:</strong></p>' +
    '<div class="aichat-sql"><code>GET /api/v1/data?' + encodeURIComponent(q).slice(0,60) + '<br>Authorization: Bearer ****<br>Content-Type: application/json</code></div>' +
    '<div class="aichat-result"><table><tr><th>Status</th><th>Latency</th><th>Records</th><th>Format</th></tr>' +
    '<tr><td style="color:#0A8217">200 OK</td><td>142ms</td><td>48</td><td>JSON</td></tr></table></div>' +
    '<div style="background:#141e2b;border-radius:6px;padding:0.65rem 0.85rem;margin:0.5rem 0;font-family:monospace;font-size:0.75rem;color:#e2e8f0;max-height:80px;overflow:auto">' +
    '{ "data": [ { "id": 1, "value": 3412.85, "timestamp": "2026-03-28T16:00:00Z" }, ... ], "meta": { "total": 48, "page": 1 } }' +
    '</div>' +
    '<p style="font-size:0.78rem;color:var(--text-muted)">Endpoint: MAS Data API · Auth: OAuth 2.0 · Rate limit: 100 req/min</p>';
}

function generateCatalogResponse(q) {
  var ql = q.toLowerCase();
  var matches = DATASETS.filter(function(d) {
    return d.name.toLowerCase().indexOf(ql) >= 0 || d.provider.toLowerCase().indexOf(ql) >= 0 ||
      d.category.toLowerCase().indexOf(ql) >= 0 || d.tags.some(function(t) { return t.toLowerCase().indexOf(ql) >= 0; });
  });
  if (!matches.length) matches = DATASETS.slice(0, 4);
  return '<p>🗄️ <strong>Catalog Search Results</strong> for "' + q + '":</p>' +
    '<div class="aichat-result"><table><tr><th>Dataset</th><th>Provider</th><th>Category</th><th>Tier</th><th>Tables</th></tr>' +
    matches.map(function(d) {
      var schema = DATASET_SCHEMAS[d.id];
      var tables = schema ? schema.tables.length : '—';
      return '<tr><td>' + d.icon + ' ' + d.name + '</td><td>' + d.provider + '</td><td>' + d.category + '</td><td><span class="tier-badge ' + d.tier + '" style="font-size:0.65rem">' + d.tier + '</span></td><td>' + tables + '</td></tr>';
    }).join('') +
    '</table></div>' +
    '<p style="font-size:0.78rem;color:var(--text-muted)">Found ' + matches.length + ' dataset(s) · Total catalog: ' + DATASETS.length + ' datasets, ' + Object.keys(DATASET_SCHEMAS).length + ' schemas</p>';
}

function generateIngestResponse(q) {
  return '<p>📥 <strong>Ingestion Pipeline Created:</strong></p>' +
    '<div class="aichat-result"><table><tr><th>Step</th><th>Action</th><th>Status</th><th>Records</th></tr>' +
    '<tr><td>1</td><td>Connect to source</td><td style="color:#0A8217">✅ Connected</td><td>—</td></tr>' +
    '<tr><td>2</td><td>Extract raw data</td><td style="color:#0A8217">✅ Extracted</td><td>12,450</td></tr>' +
    '<tr><td>3</td><td>Validate schema</td><td style="color:#0A8217">✅ Valid</td><td>12,450</td></tr>' +
    '<tr><td>4</td><td>Deduplicate</td><td style="color:#B54708">⚠️ 23 dupes removed</td><td>12,427</td></tr>' +
    '<tr><td>5</td><td>Load to target</td><td style="color:#0A8217">✅ Loaded</td><td>12,427</td></tr>' +
    '</table></div>' +
    '<p style="font-size:0.78rem;color:var(--text-muted)">Pipeline: "' + q + '" · Duration: 4.2s · Throughput: 2,959 rec/s · Next run: scheduled daily 06:00 SGT</p>';
}

function generateTransformResponse(q) {
  return '<p>⚙️ <strong>Transformation Applied:</strong></p>' +
    '<div class="aichat-sql"><code>-- Transformation: ' + q + '<br>SELECT<br>  id,<br>  UPPER(TRIM(name)) AS name_clean,<br>  CAST(amount AS DECIMAL(18,2)) AS amount_usd,<br>  TO_DATE(date_str, \'YYYY-MM-DD\') AS trade_date,<br>  COALESCE(currency, \'USD\') AS currency<br>FROM raw_table<br>WHERE amount IS NOT NULL</code></div>' +
    '<div class="aichat-result"><table><tr><th>Metric</th><th>Before</th><th>After</th></tr>' +
    '<tr><td>Total records</td><td>12,450</td><td>12,427</td></tr>' +
    '<tr><td>Null values</td><td>234</td><td>0</td></tr>' +
    '<tr><td>Format issues</td><td>18</td><td>0</td></tr>' +
    '<tr><td>Data quality score</td><td>82%</td><td style="color:#0A8217">98%</td></tr>' +
    '</table></div>' +
    '<p style="font-size:0.78rem;color:var(--text-muted)">Transformation: "' + q + '" · Applied in 1.8s · Output written to transformed_table</p>';
}

function clearAiChat() {
  document.getElementById('aichat-messages').innerHTML = '<div class="aichat-msg aichat-bot"><div class="aichat-msg-avatar">🤖</div><div class="aichat-msg-body"><p>Chat cleared. Ask me anything about business data!</p></div></div>';
}

function generateAiResponse(query) {
  var q = query.toLowerCase();
  // Match patterns and return relevant data
  if (q.includes('dbs') && (q.includes('price') || q.includes('equity'))) {
    return '<p>Here\'s the latest DBS equity data from <strong>Bloomberg Terminal</strong>:</p>' +
      '<div class="aichat-sql"><code>SELECT ticker, date, close, volume, market_cap<br>FROM bloomberg_db.equity_prices<br>WHERE ticker = \'D05\' -- DBS on SGX</code></div>' +
      '<div class="aichat-result"><table><tr><th>Ticker</th><th>Date</th><th>Close</th><th>Volume</th><th>Mkt Cap</th></tr><tr><td>D05</td><td>2026-03-28</td><td>S$38.42</td><td>50,000</td><td>S$98.2B</td></tr></table></div>' +
      '<p style="font-size:0.78rem;color:var(--text-muted)">Source: SGX Trade Data · Bloomberg Terminal</p>';
  }
  if (q.includes('usd') && q.includes('sgd') || q.includes('exchange rate')) {
    return '<p>Current <strong>USD/SGD exchange rate</strong> from MAS:</p>' +
      '<div class="aichat-sql"><code>SELECT date, currency, rate_sgd_per_unit, change_pct<br>FROM mas_fx_db.daily_spot_rates<br>WHERE currency = \'USD\'</code></div>' +
      '<div class="aichat-result"><table><tr><th>Date</th><th>Currency</th><th>SGD per Unit</th><th>Change</th></tr><tr><td>2026-03-28</td><td>USD</td><td>1.3425</td><td>-0.08%</td></tr></table></div>' +
      '<p style="font-size:0.78rem;color:var(--text-muted)">Source: MAS Exchange Rate Data</p>';
  }
  if (q.includes('otc') || q.includes('swap') || q.includes('derivative')) {
    return '<p>OTC derivatives summary from <strong>DTCC Trade Repository</strong>:</p>' +
      '<div class="aichat-sql"><code>SELECT asset_class, gross_notional, net_notional, trade_count, cleared_pct<br>FROM dtcc_otc_db.position_summary<br>WHERE report_date = \'2026-03-28\'</code></div>' +
      '<div class="aichat-result"><table><tr><th>Asset Class</th><th>Gross Notional</th><th>Net Notional</th><th>Trades</th><th>Cleared</th></tr><tr><td>Interest Rate</td><td>485.2T</td><td>12.4T</td><td>892K</td><td>78%</td></tr><tr><td>Credit</td><td>8.9T</td><td>2.1T</td><td>45K</td><td>42%</td></tr><tr><td>FX</td><td>98.3T</td><td>3.8T</td><td>235K</td><td>15%</td></tr></table></div>' +
      '<p style="font-size:0.78rem;color:var(--text-muted)">Source: OTC Derivatives Trade Repository (DTCC)</p>';
  }
  if (q.includes('fitch') || q.includes('rating') && q.includes('bbb')) {
    return '<p>Companies with Fitch rating <strong>below BBB</strong>:</p>' +
      '<div class="aichat-sql"><code>SELECT company, sector, lt_rating, outlook<br>FROM fitch_db.corporate_ratings<br>WHERE lt_rating < \'BBB\'</code></div>' +
      '<div class="aichat-result"><table><tr><th>Company</th><th>Sector</th><th>Rating</th><th>Outlook</th></tr><tr><td>Petrobras</td><td>Energy</td><td>BB-</td><td>Stable</td></tr></table></div>' +
      '<p style="font-size:0.78rem;color:var(--text-muted)">Source: Fitch Ratings & Research</p>';
  }
  if (q.includes('sti') || q.includes('straits times')) {
    return '<p><strong>STI performance</strong> from SGX Market Data:</p>' +
      '<div class="aichat-sql"><code>SELECT date, sti_close, sti_change_pct, turnover_sgd, advances, declines<br>FROM sgx_db.market_summary<br>ORDER BY date DESC LIMIT 3</code></div>' +
      '<div class="aichat-result"><table><tr><th>Date</th><th>STI Close</th><th>Change</th><th>Turnover</th><th>Adv/Dec</th></tr><tr><td>Mar 28</td><td>3,412.85</td><td>+0.42%</td><td>S$1.28B</td><td>285/198</td></tr><tr><td>Mar 27</td><td>3,398.57</td><td>-0.18%</td><td>S$1.12B</td><td>212/256</td></tr><tr><td>Mar 26</td><td>3,404.69</td><td>+0.65%</td><td>S$1.45B</td><td>312/165</td></tr></table></div>' +
      '<p style="font-size:0.78rem;color:var(--text-muted)">Source: SGX Trade & Market Data</p>';
  }
  if (q.includes('npl') || q.includes('loan') || q.includes('mas 610') || q.includes('bank balance')) {
    return '<p><strong>Banking system loan quality</strong> from MAS 610:</p>' +
      '<div class="aichat-sql"><code>SELECT bank_name, total_loans, npl_ratio, provision_coverage<br>FROM mas610_db.loan_classification<br>ORDER BY npl_ratio DESC</code></div>' +
      '<div class="aichat-result"><table><tr><th>Bank</th><th>Total Loans</th><th>NPL Ratio</th><th>Provision Coverage</th></tr><tr><td>UOB</td><td>S$298B</td><td>1.5%</td><td>105%</td></tr><tr><td>DBS</td><td>S$425B</td><td>1.2%</td><td>112%</td></tr><tr><td>OCBC</td><td>S$312B</td><td>1.0%</td><td>118%</td></tr></table></div>' +
      '<p style="font-size:0.78rem;color:var(--text-muted)">Source: MAS 610 — Balance Sheet of Banks</p>';
  }
  if (q.includes('acra') || q.includes('company') || q.includes('director')) {
    return '<p><strong>ACRA corporate registry</strong> search results:</p>' +
      '<div class="aichat-sql"><code>SELECT uen, company_name, entity_type, status, paid_up_capital<br>FROM acra_db.company_registry<br>WHERE status = \'Live\' LIMIT 3</code></div>' +
      '<div class="aichat-result"><table><tr><th>UEN</th><th>Company</th><th>Type</th><th>Capital</th></tr><tr><td>199901234A</td><td>DBS Group</td><td>Public</td><td>S$12.4B</td></tr><tr><td>200501678B</td><td>Grab Holdings</td><td>Public</td><td>S$2.1B</td></tr><tr><td>198702333K</td><td>Singapore Airlines</td><td>Public</td><td>S$8.9B</td></tr></table></div>' +
      '<p style="font-size:0.78rem;color:var(--text-muted)">Source: ACRA Corporate Registry</p>';
  }
  if (q.includes('sneer') || q.includes('neer') || q.includes('monetary policy')) {
    return '<p><strong>S$NEER</strong> — current position within MAS policy band:</p>' +
      '<div class="aichat-result"><table><tr><th>Date</th><th>S$NEER</th><th>Band Mid</th><th>Slope (p.a.)</th><th>Regime</th></tr><tr><td>2026-03-28</td><td>128.45</td><td>128.20</td><td>+1.5%</td><td>Modest Appreciation</td></tr></table></div>' +
      '<p>⚠️ S$NEER is within <strong>0.3%</strong> of the upper policy band edge. Forward markets pricing 65% probability of band re-centring at April 2026 review.</p>' +
      '<p style="font-size:0.78rem;color:var(--text-muted)">Source: MAS Exchange Rate Data</p>';
  }
  // Default response
  return '<p>I searched across <strong>' + DATASETS.length + ' datasets</strong> and <strong>' + Object.keys(DATASET_SCHEMAS).length + ' database schemas</strong> but couldn\'t find a specific match for your query.</p>' +
    '<p>Try asking about:</p><ul style="font-size:0.82rem;color:var(--text-muted);margin:0.5rem 0 0;padding-left:1rem">' +
    '<li>Equity prices (Bloomberg, SGX)</li><li>Exchange rates (MAS FX, S$NEER)</li><li>OTC derivatives (DTCC swaps)</li>' +
    '<li>Credit ratings (Fitch, Moody\'s)</li><li>Banking data (MAS 610, NPL)</li><li>Corporate registry (ACRA)</li></ul>';
}

// ── Adoption Summary ──────────────────────────────────────────────────────────
function renderAdoption() {
  var today = new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' });
  var totalDatasets = DATASETS.length;
  var totalTables = 0;
  Object.keys(DATASET_SCHEMAS).forEach(function(k) { totalTables += DATASET_SCHEMAS[k].tables.length; });
  var totalUsers = DEMO_USERS.length;
  var approved = state.requests.filter(function(r) { return r.status === 'approved'; }).length;
  var policies = state.rangerPolicies.length;
  var actionAlertCount = typeof ACTION_ALERTS !== 'undefined' ? ACTION_ALERTS.length : 0;
  var months = ['Oct','Nov','Dec','Jan','Feb','Mar'];

  document.getElementById('adoption-content').innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.75rem">
      <div>
        <h2 style="font-size:1.25rem;font-weight:900;margin-bottom:0.25rem">📊 Platform Adoption Summary</h2>
        <p style="font-size:0.82rem;color:var(--text-muted)">MAS Enterprise Data Marketplace · As of ${today}</p>
      </div>
    </div>

    <div class="stats-row" style="margin-bottom:1.75rem">
      <div class="stat-card" style="border-left:4px solid var(--accent)"><div class="stat-value" style="color:var(--accent)">${totalUsers}</div><div class="stat-label">Users</div></div>
      <div class="stat-card" style="border-left:4px solid var(--accent2)"><div class="stat-value" style="color:var(--accent2)">${totalDatasets}</div><div class="stat-label">Datasets</div></div>
      <div class="stat-card" style="border-left:4px solid #B8962E"><div class="stat-value" style="color:#B8962E">${totalTables}</div><div class="stat-label">Tables</div></div>
      <div class="stat-card approved"><div class="stat-value">${approved}</div><div class="stat-label">Active Grants</div></div>
      <div class="stat-card" style="border-left:4px solid #0F71BB"><div class="stat-value" style="color:#0F71BB">${policies}</div><div class="stat-label">Policies</div></div>
      <div class="stat-card" style="border-left:4px solid #D7260F"><div class="stat-value" style="color:#D7260F">${actionAlertCount}</div><div class="stat-label">Alerts</div></div>
    </div>

    <!-- Charts grid -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.25rem;margin-bottom:1.75rem">

      <div class="adoption-card">
        <div class="adoption-card-title">👥 Users & Access (6 months)</div>
        <canvas id="adopt-users" style="width:100%;display:block"></canvas>
        <div style="display:flex;justify-content:space-between;padding:0.35rem 0.25rem 0;font-size:0.68rem;color:var(--text-muted)">${months.map(function(m){return '<span>'+m+'</span>';}).join('')}</div>
      </div>

      <div class="adoption-card">
        <div class="adoption-card-title">🗄️ Data Catalog Growth (6 months)</div>
        <canvas id="adopt-datasets" style="width:100%;display:block"></canvas>
        <div style="display:flex;justify-content:space-between;padding:0.35rem 0.25rem 0;font-size:0.68rem;color:var(--text-muted)">${months.map(function(m){return '<span>'+m+'</span>';}).join('')}</div>
      </div>

      <div class="adoption-card">
        <div class="adoption-card-title">📋 Request Pipeline (6 months)</div>
        <canvas id="adopt-requests" style="width:100%;display:block"></canvas>
        <div style="display:flex;justify-content:space-between;padding:0.35rem 0.25rem 0;font-size:0.68rem;color:var(--text-muted)">${months.map(function(m){return '<span>'+m+'</span>';}).join('')}</div>
      </div>

      <div class="adoption-card">
        <div class="adoption-card-title">🛡️ Ranger Policies Active (6 months)</div>
        <canvas id="adopt-policies" style="width:100%;display:block"></canvas>
        <div style="display:flex;justify-content:space-between;padding:0.35rem 0.25rem 0;font-size:0.68rem;color:var(--text-muted)">${months.map(function(m){return '<span>'+m+'</span>';}).join('')}</div>
      </div>

      <div class="adoption-card">
        <div class="adoption-card-title">🚨 Intelligence Alerts (6 months)</div>
        <canvas id="adopt-alerts" style="width:100%;display:block"></canvas>
        <div style="display:flex;justify-content:space-between;padding:0.35rem 0.25rem 0;font-size:0.68rem;color:var(--text-muted)">${months.map(function(m){return '<span>'+m+'</span>';}).join('')}</div>
      </div>

      <div class="adoption-card">
        <div class="adoption-card-title">📊 Dashboard Views (6 months)</div>
        <canvas id="adopt-dashboards" style="width:100%;display:block"></canvas>
        <div style="display:flex;justify-content:space-between;padding:0.35rem 0.25rem 0;font-size:0.68rem;color:var(--text-muted)">${months.map(function(m){return '<span>'+m+'</span>';}).join('')}</div>
      </div>

    </div>

    <!-- Data providers -->
    <div>
      <h3 style="font-size:0.95rem;font-weight:900;margin-bottom:1rem">🏢 Data Providers</h3>
      <div style="display:flex;flex-wrap:wrap;gap:0.6rem">
        ${DATASETS.map(function(d) { return '<span style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.4rem 0.85rem;background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius);font-size:0.82rem;font-weight:600">' + d.icon + ' ' + d.provider + '</span>'; }).join('')}
      </div>
    </div>
  `;

  setTimeout(drawAdoptionCharts, 150);
}

// ── Actions & Intelligence ────────────────────────────────────────────────────
const ACTION_CATEGORIES = {
  'AML / CFT':           { icon: '🔎', color: '#D7260F', bg: '#FFF4F3', border: '#FB7463', desc: 'Anti-money laundering alerts, suspicious transaction reports, and network analysis' },
  'Market Integrity':    { icon: '📊', color: '#B54708', bg: '#FFFAEB', border: '#FEC84B', desc: 'Capital markets surveillance — insider trading, spoofing, and unusual volume alerts' },
  'Financial Stability': { icon: '🛡️', color: '#5925DC', bg: '#EBF1FF', border: '#99BBFF', desc: 'Systemic risk, contagion analysis, counterparty exposure, and stress testing signals' },
  'Monetary Policy':     { icon: '💱', color: '#B8962E', bg: '#FFFAEB', border: '#B8962E', desc: 'Exchange rate signals, S$NEER band proximity, and forward curve dislocations' },
  'Prudential':          { icon: '🏦', color: '#0F71BB', bg: '#E6F3FB', border: '#58A1D4', desc: 'Liquidity stress, capital adequacy, and entity risk score deterioration' },
  'Credit Risk':         { icon: '📉', color: '#0A8217', bg: '#ECFBEE', border: '#58BE62', desc: 'Rating downgrades, exposure concentration, and credit quality deterioration' },
  'Market Outlook':      { icon: '📈', color: '#1B2A4A', bg: '#EBF1FF', border: '#99BBFF', desc: 'Sentiment shifts, macro trends, and cross-asset market predictions' },
  'Statistical Bulletin': { icon: '📑', color: '#B8962E', bg: '#FFFAEB', border: '#B8962E', desc: 'MAS Monthly Statistical Bulletin — banking sector aggregates, monetary statistics, and macro indicators' },
  'Enforcement':          { icon: '⚖️', color: '#344054', bg: '#F7F7F9', border: '#98A2B3', desc: 'Regulatory enforcement actions, penalties, prohibition orders, and compliance directives issued by MAS' },
};
let actionsSelectedCategory = null;

function renderActions() {
  var container = document.getElementById('actions-content');
  if (actionsSelectedCategory) { renderActionAlerts(container); } else { renderActionCategories(container); }
}

const ACTION_ALERTS = [
  { id: 'ACT-001', time: '08:15', severity: 'critical', category: 'AML / CFT', source: 'MAS Supervision', sourceIcon: '🔎', title: 'CryptoX SG — AML Network Cluster Detected', desc: 'AML-GraphNet v2.1 identified network clustering between CryptoX SG and 3 known shell entities in Cayman Islands. Confidence: 92%.', prediction: 'High probability (88%) of trade-based money laundering. Pattern matches layering typology.', action: 'Escalate to STRO immediately. Initiate enhanced surveillance on all CryptoX accounts.', datasets: ['mas-supervision', 'acra-corporate'], status: 'Requires Action' },
  { id: 'ACT-010', time: '09:45', severity: 'medium', category: 'AML / CFT', source: 'MAS Supervision', sourceIcon: '🔎', title: 'PayNow Ops — Rapid Fund Movement to Myanmar', desc: 'S$2.4M in rapid fund transfers to Myanmar-based accounts over 48hrs. Layering typology match.', prediction: 'Cross-border ML risk elevated. Myanmar is FATF grey-listed.', action: 'Review all PayNow Ops transactions to Myanmar in past 90 days.', datasets: ['mas-supervision', 'acra-corporate'], status: 'Under Review' },
  { id: 'ACT-002', time: '08:30', severity: 'high', category: 'Market Integrity', source: 'SGX Trade Data', sourceIcon: '🇸🇬', title: 'Singtel (Z74) — Unusual Volume Ahead of Earnings', desc: 'Volume 3.2x 30-day average on SGX-ST, 48hrs before earnings. Concentrated buying from 5 retail accounts.', prediction: 'Insider trading probability: 72%. Price impact +1.8% if earnings beat.', action: 'Flag for surveillance. Cross-reference with ACRA insider registry.', datasets: ['sgx-trade', 'acra-corporate', 'bloomberg-terminal'], status: 'Under Review' },
  { id: 'ACT-009', time: '08:45', severity: 'high', category: 'Market Integrity', source: 'SGX Trade Data', sourceIcon: '🇸🇬', title: 'SiMSCI Future — Spoofing Pattern Detected', desc: 'Repeated large order placement/cancellation within 50ms by HFT Firm Alpha.', prediction: 'Estimated price distortion 0.4% on SiMSCI if unchecked.', action: 'Refer to SGX-DC for investigation. Request trading logs.', datasets: ['sgx-trade'], status: 'Requires Action' },
  { id: 'ACT-003', time: '09:00', severity: 'high', category: 'Financial Stability', source: 'OTC Derivatives', sourceIcon: '🔄', title: 'Systemic Exposure — Bank A Bilateral Concentration', desc: 'DebtRank: Bank A default impacts 72% of system. Eigenvalue λ₁ = 0.847.', prediction: 'Cascading impact on 4 counterparties within 5 days. CCP clearing reduces to 38%.', action: 'Request Bank A to increase CCP clearing from 65% to 80%.', datasets: ['otc-derivatives'], status: 'Requires Action' },
  { id: 'ACT-004', time: '09:15', severity: 'medium', category: 'Monetary Policy', source: 'MAS Exchange Rates', sourceIcon: '💱', title: 'S$NEER Approaching Upper Policy Band', desc: 'S$NEER at 128.45, within 0.3% of upper band. SGD +1.2% in 2 weeks.', prediction: 'MAS may intervene or re-centre at April 2026 review. 65% probability.', action: 'Alert Treasury. Prepare scenario analysis for band re-centring.', datasets: ['mas-exchange-rates', 'bloomberg-terminal'], status: 'Monitoring' },
  { id: 'ACT-005', time: '09:30', severity: 'medium', category: 'Prudential', source: 'MAS Supervision', sourceIcon: '🔎', title: 'PayNow Ops — Liquidity Stress Signal', desc: 'Outflow velocity exceeds 2σ of 90-day mean. LCR at 85%, below 100% minimum.', prediction: 'Projected LCR breach within 30 days (confidence: 87%).', action: 'Request immediate stress test. Schedule on-site inspection.', datasets: ['mas-supervision'], status: 'Requires Action' },
  { id: 'ACT-006', time: '10:00', severity: 'medium', category: 'Credit Risk', source: 'Fitch Ratings', sourceIcon: '🏦', title: 'Volkswagen AG — Rating Downgrade Watch', desc: 'Fitch outlook Negative for VW (BBB+). Moody\'s PD +1.82% for auto sector.', prediction: '45% probability of 1-notch downgrade within 6 months.', action: 'Review VW bond exposure. Run BBB downgrade scenario.', datasets: ['fitch-ratings', 'moodys-analytics', 'ice-data'], status: 'Monitoring' },
  { id: 'ACT-007', time: '10:30', severity: 'low', category: 'Credit Risk', source: 'ACRA Registry', sourceIcon: '🏛️', title: 'Grab Financial — Exposure Concentration Flag', desc: 'Top 5 borrowers at 42% of loan book. Net loss S$180M in FY2025.', prediction: 'Manageable given S$12.8B asset base. Profitability by Q3 2026.', action: 'Standard monitoring. Request concentration report next quarter.', datasets: ['acra-corporate', 'mas-supervision', 'sp-global'], status: 'No Action' },
  { id: 'ACT-008', time: '11:00', severity: 'low', category: 'Market Outlook', source: 'Bloomberg', sourceIcon: '📊', title: 'Market Sentiment — Risk-On Shift Detected', desc: 'Fed rate hold signal. NVDA +32% YTD. VIX 14.2.', prediction: 'Risk-on for 2-4 weeks. ASEAN inflows +8-12%. STI target 3,450-3,500.', action: 'Informational — share with Research and Trading.', datasets: ['bloomberg-terminal', 'refinitiv-eikon', 'factset'], status: 'Informational' },
  { id: 'ACT-011', time: '11:15', severity: 'low', category: 'Market Outlook', source: 'Refinitiv Eikon', sourceIcon: '📈', title: 'OPEC+ Production Cut Extension', desc: 'Cuts extended to Q3 2026. Brent +2.1% to $82.40.', prediction: 'Oil $80-85 range next quarter. Positive energy, negative transport.', action: 'Informational — alert sector analysts.', datasets: ['refinitiv-eikon', 'bloomberg-terminal'], status: 'Informational' },
  { id: 'MSB-001', time: '07:00', severity: 'medium', category: 'Statistical Bulletin', source: 'MAS 610', sourceIcon: '📑', title: 'Banking System Total Assets Hit S$2.82T — New Record', desc: 'Feb 2026 MAS 610 data shows total banking system assets at S$2.82T, up 2.1% YoY. Loan growth at 4.8% driven by trade finance and mortgages. System CAR stable at 15.2%.', prediction: 'Continued asset growth signals healthy credit demand. However, loan-to-deposit ratio at 82% approaching the 85% comfort zone — monitor for funding pressure.', action: 'Update banking sector dashboard. Flag loan-to-deposit ratio trend for next Financial Stability Review. No immediate supervisory action.', datasets: ['mas610', 'mas-supervision'], status: 'Monitoring' },
  { id: 'MSB-002', time: '07:15', severity: 'high', category: 'Statistical Bulletin', source: 'MAS 610', sourceIcon: '📑', title: 'System NPL Ratio Rising — 1.2% to 1.5% in 3 Months', desc: 'Non-performing loan ratio for the banking system increased from 1.0% to 1.2% over 3 months. UOB NPL at 1.5% is the highest among local banks. Special mention loans also rising (+0.2pp).', prediction: 'If NPL trend continues, system NPL could reach 1.8% by Q3 2026. Provision coverage at 105% for UOB is below the 110% industry average — potential earnings impact.', action: 'Schedule targeted review of UOB loan book quality. Request breakdown of NPL increase by sector (property, SME, trade finance). Alert Risk team.', datasets: ['mas610', 'fitch-ratings', 'moodys-analytics'], status: 'Requires Action' },
  { id: 'MSB-003', time: '07:30', severity: 'medium', category: 'Statistical Bulletin', source: 'MAS 610', sourceIcon: '📑', title: 'CASA Ratio Declining Across Local Banks', desc: 'Current Account Savings Account (CASA) ratio declined from 65.2% to 62.3% across local banks over 6 months as depositors shift to higher-yielding fixed deposits amid elevated interest rates.', prediction: 'Continued CASA decline will compress net interest margins by 5-8bps. Banks may need to raise fixed deposit rates further, impacting profitability in H2 2026.', action: 'Monitor NIM trends in next quarterly earnings. Update deposit cost assumptions in stress testing models.', datasets: ['mas610', 'bloomberg-terminal'], status: 'Monitoring' },
  { id: 'MSB-004', time: '07:45', severity: 'low', category: 'Statistical Bulletin', source: 'MAS 610', sourceIcon: '📑', title: 'Foreign Bank Assets Stable — No Systemic Shift', desc: 'Foreign bank assets in Singapore stable at S$420B. Citibank and HSBC maintain adequate CAR above 13%. No significant changes in cross-border lending patterns.', prediction: 'Foreign bank presence remains stable. No capital flight or deleveraging signals detected.', action: 'Informational — include in monthly banking sector summary report.', datasets: ['mas610'], status: 'Informational' },
  { id: 'ENF-001', time: '08:00', severity: 'critical', category: 'Enforcement', source: 'MAS Supervision', sourceIcon: '🔎', title: 'CryptoX SG — License Revocation Proceedings Initiated', desc: 'Following STR-2026-0138 and AML-GraphNet detection of shell entity network, MAS has initiated proceedings to revoke CryptoX SG Capital Markets Services (CMS) license under Section 95 of the Securities and Futures Act. Entity risk score: 35 (Critical).', prediction: 'License revocation expected within 60 days. CryptoX customer assets (~S$45M) will require orderly transfer to approved custodian. Potential contagion to 2 other crypto service providers sharing the same clearing infrastructure.', action: 'Issue formal notice to CryptoX SG. Appoint independent auditor for customer asset verification. Coordinate with STRO on ongoing criminal investigation. Notify affected customers via MAS media release.', datasets: ['mas-supervision', 'acra-corporate'], status: 'Requires Action' },
  { id: 'ENF-002', time: '08:10', severity: 'high', category: 'Enforcement', source: 'MAS Supervision', sourceIcon: '🔎', title: 'PayNow Ops — Composition Penalty S$150K for AML Failures', desc: 'MAS has imposed a composition penalty of S$150,000 on PayNow Ops Pte Ltd for failures in customer due diligence (CDD) and ongoing monitoring under MAS Notice PSN02. 12 instances of inadequate CDD identified during on-site inspection.', prediction: 'Penalty signals escalating supervisory intensity. If PayNow Ops fails to remediate within 90 days, further enforcement action including potential license conditions or revocation may follow.', action: 'Issue composition penalty notice. Require PayNow Ops to submit remediation plan within 30 days. Schedule follow-up inspection in 90 days. Publish enforcement action on MAS website.', datasets: ['mas-supervision'], status: 'Requires Action' },
  { id: 'ENF-003', time: '08:20', severity: 'high', category: 'Enforcement', source: 'SGX Trade Data', sourceIcon: '🇸🇬', title: 'HFT Firm Alpha — Prohibition Order for Market Manipulation', desc: 'Following investigation of spoofing pattern on SiMSCI futures (CMA-2026-042), MAS has issued a 5-year prohibition order against HFT Firm Alpha and its principal trader under Section 101A of the SFA. Total manipulated volume: 2,400 lots over 3 sessions.', prediction: 'Prohibition order will be published in Government Gazette. HFT Firm Alpha must unwind all open positions within 5 business days. Other HFT firms may reduce activity on SGX-DT temporarily, impacting derivatives liquidity.', action: 'Issue prohibition order. Coordinate with SGX-DC for orderly position unwinding. Monitor derivatives market liquidity for 2 weeks post-enforcement. Brief Minister on enforcement outcome.', datasets: ['sgx-trade', 'mas-supervision'], status: 'Requires Action' },
  { id: 'ENF-004', time: '08:35', severity: 'medium', category: 'Enforcement', source: 'SGX Trade Data', sourceIcon: '🇸🇬', title: 'Insider Trading Referral — Keppel Corp (BN4) Accounts', desc: 'Capital markets surveillance alert CMA-2026-039 has been formally referred to the Commercial Affairs Department (CAD) for criminal investigation. 3 retail accounts purchased S$1.2M of BN4 shares 48 hours before M&A announcement. Price impact: +4.2%.', prediction: 'CAD investigation typically takes 6-12 months. If prosecution proceeds, penalties under Section 218 SFA include up to S$250K fine and/or 7 years imprisonment per offence.', action: 'Formal referral to CAD completed. Freeze trading accounts of 3 suspects. Coordinate with SGX for trading records. Prepare MAS media statement on referral.', datasets: ['sgx-trade', 'acra-corporate'], status: 'Under Review' },
  { id: 'ENF-005', time: '09:00', severity: 'low', category: 'Enforcement', source: 'ACRA Registry', sourceIcon: '🏛️', title: 'Alpha Trading Pte Ltd — Struck Off Register', desc: 'Alpha Trading Pte Ltd (UEN 200812789D) has been struck off the ACRA register following persistent non-compliance with annual return filing requirements. Company had outstanding penalties of S$300 and failed to respond to 3 summons.', prediction: 'No systemic impact. Former directors may face restrictions on new company incorporations for 5 years under Section 155A of the Companies Act.', action: 'Informational — update counterparty databases. Flag former directors in KYC screening systems. No further MAS action required.', datasets: ['acra-corporate'], status: 'Informational' },
];

function selectActionCategory(cat) { actionsSelectedCategory = cat; renderActions(); }
function showActionCategories() { actionsSelectedCategory = null; renderActions(); }

function renderActionCategories(container) {
  var today = new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  var cc = {}, cu = {};
  ACTION_ALERTS.forEach(function(a) { cc[a.category] = (cc[a.category]||0)+1; if (a.severity==='critical'||a.severity==='high') cu[a.category]=(cu[a.category]||0)+1; });
  var ar = ACTION_ALERTS.filter(function(a){return a.status==='Requires Action';}).length;
  container.innerHTML = '<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem"><div><h2 style="font-size:1.25rem;font-weight:900;margin-bottom:0.25rem">🚨 Daily Intelligence</h2><p style="font-size:0.82rem;color:var(--text-muted)">'+today+' · Select a category to view alerts and predictions</p></div><button class="btn btn-primary btn-sm" onclick="renderActions()">↺ Refresh</button></div>'+
    '<div class="stats-row" style="margin-bottom:1.75rem"><div class="stat-card" style="border-left:4px solid #D7260F"><div class="stat-value" style="color:#D7260F">'+ar+'</div><div class="stat-label">Action Required</div></div><div class="stat-card" style="border-left:4px solid #B54708"><div class="stat-value" style="color:#B54708">'+ACTION_ALERTS.filter(function(a){return a.severity==='critical';}).length+'</div><div class="stat-label">Critical</div></div><div class="stat-card" style="border-left:4px solid #5925DC"><div class="stat-value" style="color:#5925DC">'+ACTION_ALERTS.filter(function(a){return a.severity==='high';}).length+'</div><div class="stat-label">High</div></div><div class="stat-card" style="border-left:4px solid #0F71BB"><div class="stat-value" style="color:#0F71BB">'+ACTION_ALERTS.length+'</div><div class="stat-label">Total Alerts</div></div></div>'+
    '<div class="catalog-cat-grid">'+Object.keys(ACTION_CATEGORIES).map(function(cat){var m=ACTION_CATEGORIES[cat],n=cc[cat]||0,u=cu[cat]||0;return '<div class="cat-tile" onclick="selectActionCategory(\''+cat.replace(/'/g,"\\'")+'\')" style="border-color:'+m.border+';background:'+m.bg+'"><div class="cat-tile-icon" style="background:'+m.color+'22;color:'+m.color+'">'+m.icon+'</div><div class="cat-tile-name" style="color:'+m.color+'">'+cat+'</div><div class="cat-tile-desc">'+m.desc+'</div><div class="cat-tile-footer"><span class="cat-tile-count" style="color:'+m.color+'">'+n+' alert'+(n!==1?'s':'')+'</span>'+(u>0?'<span style="font-size:0.72rem;font-weight:700;color:#D7260F;background:#FFF4F3;border:1px solid #FB7463;padding:0.1rem 0.45rem;border-radius:4px">🔴 '+u+' urgent</span>':'<span style="font-size:0.72rem;color:#0A8217">✅ No urgent</span>')+'</div></div>';}).join('')+'</div>';
}

function renderActionAlerts(container) {
  var cat=actionsSelectedCategory, m=ACTION_CATEGORIES[cat]||{};
  var today=new Date().toLocaleDateString('en-SG',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var S={critical:{color:'#D7260F',bg:'#FFF4F3',border:'#FB7463',icon:'🔴',label:'CRITICAL'},high:{color:'#B54708',bg:'#FFFAEB',border:'#FEC84B',icon:'🟠',label:'HIGH'},medium:{color:'#5925DC',bg:'#EBF1FF',border:'#99BBFF',icon:'🟡',label:'MEDIUM'},low:{color:'#0A8217',bg:'#ECFBEE',border:'#58BE62',icon:'🟢',label:'LOW'}};
  var alerts=ACTION_ALERTS.filter(function(a){return a.category===cat;});
  container.innerHTML='<div style="margin-bottom:1.25rem"><button class="btn btn-outline btn-sm" onclick="showActionCategories()" style="border-color:var(--border);color:var(--text);margin-bottom:0.5rem">← All Categories</button><div class="catalog-active-cat"><span style="font-size:1.2rem">'+(m.icon||'')+'</span><span style="font-weight:900;color:'+(m.color||'var(--accent)')+'">'+cat+'</span><span style="color:var(--text-muted);font-size:0.82rem">— '+alerts.length+' alert'+(alerts.length!==1?'s':'')+' · '+today+'</span></div></div>'+
    (alerts.length===0?'<div class="empty-state"><div class="empty-icon">✅</div><p>No alerts in this category today.</p></div>':
    alerts.map(function(a){var s=S[a.severity],sc=a.status==='Requires Action'?'#D7260F':a.status==='Under Review'?'#B54708':a.status==='Monitoring'?'#5925DC':'#0A8217';
      return '<div class="action-card" style="border-left:5px solid '+s.color+'"><div class="action-card-header"><div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap"><span class="action-severity" style="background:'+s.bg+';color:'+s.color+';border:1px solid '+s.border+'">'+s.icon+' '+s.label+'</span><span style="font-size:0.72rem;color:var(--text-muted);font-family:monospace">'+a.id+'</span><span style="font-size:0.72rem;color:var(--text-muted)">⏰ '+a.time+' SGT</span></div><span class="action-status" style="color:'+sc+';border-color:'+sc+'">'+a.status+'</span></div><div class="action-card-body"><div class="action-source">'+a.sourceIcon+' '+a.source+'</div><div class="action-title">'+a.title+'</div><p class="action-desc">'+a.desc+'</p><div class="action-section"><div class="action-section-label" style="color:#B8962E">🔮 Market Prediction</div><p class="action-section-text">'+a.prediction+'</p></div><div class="action-section"><div class="action-section-label" style="color:#D7260F">⚡ Recommended Action</div><p class="action-section-text">'+a.action+'</p></div><div class="action-datasets"><span style="font-size:0.7rem;color:var(--text-muted);font-weight:700">DATA SOURCES:</span>'+a.datasets.map(function(did){var ds=DATASETS.find(function(d){return d.id===did;});return ds?'<span class="action-ds-chip">'+ds.icon+' '+ds.provider+'</span>':'';}).join('')+'</div></div></div>';
    }).join(''));
}


// ── Process Flow ──────────────────────────────────────────────────────────────
function renderProcessFlow() {
  document.getElementById('flow-diagram-content').innerHTML = `
    <h2 style="font-size:1.25rem;font-weight:900;margin-bottom:0.25rem">🔄 Data Discovery & Access Lifecycle</h2>
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1.5rem">End-to-end journey from data discovery to ongoing governance</p>

    <!-- Main horizontal flow -->
    <div class="pflow-track">
      <div class="pflow-node" style="--c:#5925DC">
        <div class="pflow-icon">🔍</div>
        <div class="pflow-num">1</div>
        <div class="pflow-label">Discover</div>
        <div class="pflow-actor">Analyst</div>
      </div>
      <div class="pflow-arrow">→</div>
      <div class="pflow-node" style="--c:#0F71BB">
        <div class="pflow-icon">📝</div>
        <div class="pflow-num">2</div>
        <div class="pflow-label">Request</div>
        <div class="pflow-actor">Analyst</div>
      </div>
      <div class="pflow-arrow">→</div>
      <div class="pflow-node pflow-diamond" style="--c:#B54708">
        <div class="pflow-icon">⬦</div>
        <div class="pflow-label">Review</div>
        <div class="pflow-actor">DivHead</div>
      </div>
      <div class="pflow-branch">
        <div class="pflow-branch-yes">
          <span class="pflow-branch-label" style="color:#0A8217">✅ Approve</span>
          <div class="pflow-arrow" style="color:#0A8217">→</div>
        </div>
        <div class="pflow-branch-no">
          <span class="pflow-branch-label" style="color:#D7260F">❌ Reject</span>
          <div class="pflow-reject-end">Notify</div>
        </div>
      </div>
      <div class="pflow-node" style="--c:#0A8217">
        <div class="pflow-icon">🛡️</div>
        <div class="pflow-num">4</div>
        <div class="pflow-label">Provision</div>
        <div class="pflow-actor">System</div>
      </div>
      <div class="pflow-arrow">→</div>
      <div class="pflow-node" style="--c:#B8962E">
        <div class="pflow-icon">📊</div>
        <div class="pflow-num">5</div>
        <div class="pflow-label">Access</div>
        <div class="pflow-actor">Analyst</div>
      </div>
      <div class="pflow-arrow">→</div>
      <div class="pflow-node" style="--c:#D7260F">
        <div class="pflow-icon">📋</div>
        <div class="pflow-num">6</div>
        <div class="pflow-label">Monitor</div>
        <div class="pflow-actor">DivHead</div>
      </div>
    </div>

    <!-- Provisioning sub-steps -->
    <div class="pflow-sub-section">
      <div class="pflow-sub-title">🛡️ Provisioning Pipeline (Step 4 — Automated)</div>
      <div class="pflow-sub-track">
        <div class="pflow-sub-node" style="border-color:#0A8217"><span>✅</span>Approved</div>
        <div class="pflow-sub-arrow">→</div>
        <div class="pflow-sub-node" style="border-color:#5925DC"><span>🛡️</span>Create Policy</div>
        <div class="pflow-sub-arrow">→</div>
        <div class="pflow-sub-node" style="border-color:#0F71BB"><span>🗄️</span>Bind Resources</div>
        <div class="pflow-sub-arrow">→</div>
        <div class="pflow-sub-node" style="border-color:#B54708"><span>👤</span>Assign Principals</div>
        <div class="pflow-sub-arrow">→</div>
        <div class="pflow-sub-node" style="border-color:#B8962E"><span>🔑</span>Grant Perms</div>
        <div class="pflow-sub-arrow">→</div>
        <div class="pflow-sub-node" style="border-color:#D7260F"><span>🔒</span>Row Filters</div>
        <div class="pflow-sub-arrow">→</div>
        <div class="pflow-sub-node" style="border-color:#0A8217"><span>🚀</span>Live</div>
      </div>
    </div>

    <!-- Lifecycle details -->
    <div style="margin-bottom:1.25rem">
      <h3 style="font-size:1rem;font-weight:900;margin-bottom:1rem">📖 Data Lifecycle Stages — Explained</h3>
      <div class="pflow-details-grid">

        <div class="pflow-detail-card" style="border-left:4px solid #5925DC">
          <div class="pflow-detail-header">
            <span class="pflow-detail-icon" style="background:#5925DC22;color:#5925DC">🔍</span>
            <div>
              <div class="pflow-detail-title" style="color:#5925DC">1. Discover</div>
              <div class="pflow-detail-actor">Actor: Analyst</div>
            </div>
          </div>
          <p class="pflow-detail-desc">Browse the Data Catalog to find datasets relevant to your business need. The catalog is organised by category (Market Data, Trade Data, Regulatory Data, etc.) and filterable by tier (Premium, Standard, Restricted).</p>
          <div class="pflow-detail-what">
            <div class="pflow-detail-what-title">What you can do</div>
            <ul>
              <li>Search by provider, dataset name, or tags</li>
              <li>View business definitions and column-level meanings</li>
              <li>Review table schemas, sample data, and SLA</li>
              <li>Check data sensitivity classification and update frequency</li>
            </ul>
          </div>
        </div>

        <div class="pflow-detail-card" style="border-left:4px solid #0F71BB">
          <div class="pflow-detail-header">
            <span class="pflow-detail-icon" style="background:#0F71BB22;color:#0F71BB">📝</span>
            <div>
              <div class="pflow-detail-title" style="color:#0F71BB">2. Request</div>
              <div class="pflow-detail-actor">Actor: Analyst</div>
            </div>
          </div>
          <p class="pflow-detail-desc">Submit a formal access request specifying the dataset, access type, duration, and a business justification explaining why you need the data and how it will be used.</p>
          <div class="pflow-detail-what">
            <div class="pflow-detail-what-title">What you provide</div>
            <ul>
              <li>Access type: Read Only, Read/Write, API, or Bulk Download</li>
              <li>Duration: 1 month to permanent</li>
              <li>Business justification (mandatory)</li>
              <li>Request is auto-routed to your department's DivHead</li>
            </ul>
          </div>
        </div>

        <div class="pflow-detail-card" style="border-left:4px solid #B54708">
          <div class="pflow-detail-header">
            <span class="pflow-detail-icon" style="background:#B5470822;color:#B54708">⬦</span>
            <div>
              <div class="pflow-detail-title" style="color:#B54708">3. Review (Decision Gate)</div>
              <div class="pflow-detail-actor">Actor: DivHead</div>
            </div>
          </div>
          <p class="pflow-detail-desc">The DivHead reviews the request against business need, data sensitivity, and compliance requirements. They can approve, reject, or request additional information.</p>
          <div class="pflow-detail-what">
            <div class="pflow-detail-what-title">Decision criteria</div>
            <ul>
              <li>Is the business justification sufficient?</li>
              <li>Does the access scope match the stated need?</li>
              <li>Are there compliance or regulatory concerns?</li>
              <li>Restricted-tier data requires enhanced scrutiny</li>
            </ul>
          </div>
        </div>

        <div class="pflow-detail-card" style="border-left:4px solid #0A8217">
          <div class="pflow-detail-header">
            <span class="pflow-detail-icon" style="background:#0A821722;color:#0A8217">🛡️</span>
            <div>
              <div class="pflow-detail-title" style="color:#0A8217">4. Provision (Automated)</div>
              <div class="pflow-detail-actor">Actor: System</div>
            </div>
          </div>
          <p class="pflow-detail-desc">On approval, the system automatically creates an Apache Ranger policy that binds the user to the specific database, tables, and columns with the approved permission level.</p>
          <div class="pflow-detail-what">
            <div class="pflow-detail-what-title">What happens automatically</div>
            <ul>
              <li>Ranger policy created with unique ID</li>
              <li>Database and table resources bound</li>
              <li>User and group principals assigned</li>
              <li>Row-level filters and column masks applied</li>
              <li>Audit logging enabled for all queries</li>
            </ul>
          </div>
        </div>

        <div class="pflow-detail-card" style="border-left:4px solid #B8962E">
          <div class="pflow-detail-header">
            <span class="pflow-detail-icon" style="background:#B8962E22;color:#B8962E">📊</span>
            <div>
              <div class="pflow-detail-title" style="color:#B8962E">5. Access</div>
              <div class="pflow-detail-actor">Actor: Analyst</div>
            </div>
          </div>
          <p class="pflow-detail-desc">The analyst can now query the provisioned data within the granted permissions. All access is governed by the Ranger policy — row filters limit data to the analyst's department, and sensitive columns are masked.</p>
          <div class="pflow-detail-what">
            <div class="pflow-detail-what-title">Access controls in effect</div>
            <ul>
              <li>SQL queries scoped to approved tables and columns</li>
              <li>Row-level security filters by department</li>
              <li>PII columns (SSN, email, account) are masked</li>
              <li>Every query is audit-logged with timestamp and user</li>
            </ul>
          </div>
        </div>

        <div class="pflow-detail-card" style="border-left:4px solid #D7260F">
          <div class="pflow-detail-header">
            <span class="pflow-detail-icon" style="background:#D7260F22;color:#D7260F">📋</span>
            <div>
              <div class="pflow-detail-title" style="color:#D7260F">6. Monitor & Govern</div>
              <div class="pflow-detail-actor">Actor: DivHead</div>
            </div>
          </div>
          <p class="pflow-detail-desc">DivHeads continuously monitor data access through the Risk & Compliance dashboard, review audit logs, track policy status, and manage expiring grants. Intelligence alerts flag anomalies automatically.</p>
          <div class="pflow-detail-what">
            <div class="pflow-detail-what-title">Ongoing governance</div>
            <ul>
              <li>Review compliance scorecard and risk flags</li>
              <li>Monitor activity logs and SQL query patterns</li>
              <li>Track Ranger policy expiry and renewal</li>
              <li>Act on intelligence alerts (AML, market integrity, etc.)</li>
              <li>Revoke access if business need changes</li>
            </ul>
          </div>
        </div>

      </div>
    </div>

    <!-- Swimlane legend -->
    <div class="pflow-legend">
      <div class="pflow-legend-item"><div class="pflow-legend-dot" style="background:#5925DC"></div>Analyst</div>
      <div class="pflow-legend-item"><div class="pflow-legend-dot" style="background:#D7260F"></div>DivHead</div>
      <div class="pflow-legend-item"><div class="pflow-legend-dot" style="background:#0A8217"></div>System (Auto)</div>
      <div class="pflow-legend-item"><div class="pflow-legend-dot" style="background:#B54708"></div>Decision Gate</div>
    </div>

    <!-- Key rules -->
    <div class="pflow-rules">
      <div class="pflow-rule"><span style="color:#5925DC">🔐</span> All access requires formal request & DivHead approval</div>
      <div class="pflow-rule"><span style="color:#D7260F">🔒</span> Restricted datasets require enhanced justification</div>
      <div class="pflow-rule"><span style="color:#0A8217">🛡️</span> Apache Ranger enforces row filters, column masks & audit</div>
      <div class="pflow-rule"><span style="color:#B54708">⏱️</span> Grants auto-expire per approved duration</div>
      <div class="pflow-rule"><span style="color:#0F71BB">📋</span> All queries audit-logged for compliance review</div>
    </div>
  `;
}

// ── Init ──────────────────────────────────────────────────────────────────────
// ── Init ──────────────────────────────────────────────────────────────────────
// ── Login Tour ────────────────────────────────────────────────────────────────
var loginTourInterval = null;
function startLoginTour() {
  var slides = document.querySelectorAll('.login-tour-slide');
  var dotsEl = document.getElementById('login-tour-dots');
  if (!slides.length || !dotsEl) return;
  var total = slides.length;
  var current = 0;
  var dotsHtml = '';
  for (var i = 0; i < total; i++) dotsHtml += '<span class="login-tour-dot' + (i === 0 ? ' active' : '') + '" onclick="goToTourSlide(' + i + ')"></span>';
  dotsEl.innerHTML = dotsHtml;
  if (loginTourInterval) clearInterval(loginTourInterval);
  loginTourInterval = setInterval(function() { current = (current + 1) % total; showTourSlide(current); }, 3500);
  // Draw charts after DOM is ready
  setTimeout(drawTourCharts, 100);
}
function showTourSlide(idx) {
  document.querySelectorAll('.login-tour-slide').forEach(function(s) { s.classList.remove('active'); });
  document.querySelectorAll('.login-tour-dot').forEach(function(d) { d.classList.remove('active'); });
  var slides = document.querySelectorAll('.login-tour-slide');
  var dots = document.querySelectorAll('.login-tour-dot');
  if (slides[idx]) slides[idx].classList.add('active');
  if (dots[idx]) dots[idx].classList.add('active');
}
function goToTourSlide(idx) {
  showTourSlide(idx);
  if (loginTourInterval) clearInterval(loginTourInterval);
  var total = document.querySelectorAll('.login-tour-slide').length;
  var current = idx;
  loginTourInterval = setInterval(function() { current = (current + 1) % total; showTourSlide(current); }, 3500);
}

function init() {
  // Populate filter dropdowns
  const deptSelect = document.getElementById('req-department');
  DEPARTMENTS.forEach(d => { const o=document.createElement('option'); o.value=d; o.textContent=d; deptSelect.appendChild(o); });

  const actDeptSelect = document.getElementById('activity-filter-dept');
  DEPARTMENTS.forEach(d => { const o=document.createElement('option'); o.value=d; o.textContent=d; actDeptSelect.appendChild(o); });

  const accDeptSelect = document.getElementById('access-filter-dept');
  DEPARTMENTS.forEach(d => { const o=document.createElement('option'); o.value=d; o.textContent=d; accDeptSelect.appendChild(o); });

  document.getElementById('search-input').addEventListener('input', e => { state.catalogFilter.search=e.target.value; renderCatalog(); });
  document.getElementById('filter-tier').addEventListener('change', e => { state.catalogFilter.tier=e.target.value; renderCatalog(); });
  document.getElementById('request-modal').addEventListener('click', e => { if (e.target===document.getElementById('request-modal')) closeRequestModal(); });

  document.querySelector('[data-view="approvals"]').style.display = 'none';

  // Show login page
  renderLoginPage();
  startLoginTour();
}

document.addEventListener('DOMContentLoaded', init);

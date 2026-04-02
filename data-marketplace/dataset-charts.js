// OTC Derivatives — Financial Stability Charts

function _otcResize(canvas) {
  var w = 0, el = canvas.parentElement;
  while (el && w < 10) { w = el.offsetWidth || 0; el = el.parentElement; }
  w = w > 10 ? w : 320;
  canvas.width  = w;
  canvas.height = Math.round(w * 0.62);
  return { W: canvas.width, H: canvas.height };
}

function drawNetworkChart() {
  var canvas = document.getElementById('fsr-network');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  var nodes = [
    { id: 'Bank A',  x: W*.22, y: H*.28, r: Math.round(W*.06), color: '#D7260F' },
    { id: 'Bank B',  x: W*.72, y: H*.22, r: Math.round(W*.05), color: '#5925DC' },
    { id: 'Bank C',  x: W*.80, y: H*.65, r: Math.round(W*.04), color: '#0F71BB' },
    { id: 'Bank D',  x: W*.45, y: H*.78, r: Math.round(W*.04), color: '#B54708' },
    { id: 'CCP',     x: W*.50, y: H*.46, r: Math.round(W*.07), color: '#0A8217' },
    { id: 'HedgeF',  x: W*.16, y: H*.65, r: Math.round(W*.03), color: '#667085' },
  ];
  var edges = [
    { f:0, t:4, w:4, c:'#0A8217' }, { f:1, t:4, w:3, c:'#0A8217' },
    { f:2, t:4, w:2, c:'#0A8217' }, { f:3, t:4, w:2, c:'#0A8217' },
    { f:0, t:1, w:2, c:'#D7260F', dash:true },
    { f:0, t:5, w:1.5, c:'#B54708', dash:true },
    { f:1, t:3, w:1.5, c:'#5925DC', dash:true },
  ];

  edges.forEach(function(e) {
    var a = nodes[e.f], b = nodes[e.t];
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = e.c; ctx.lineWidth = e.w; ctx.globalAlpha = 0.6;
    ctx.setLineDash(e.dash ? [5, 3] : []); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  });

  nodes.forEach(function(n) {
    ctx.shadowColor = n.color; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = n.color + '33'; ctx.fill();
    ctx.strokeStyle = n.color; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = n.color;
    ctx.font = 'bold ' + Math.max(8, Math.round(n.r * 0.55)) + 'px Lato,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(n.id, n.x, n.y);
  });

  ctx.font = '9px Lato,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0A8217'; ctx.fillRect(10, H - 28, 16, 3);
  ctx.fillText('CCP-cleared', 30, H - 26);
  ctx.fillStyle = '#D7260F'; ctx.fillRect(10, H - 14, 16, 3);
  ctx.fillText('Bilateral OTC', 30, H - 12);
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('Counterparty Network Analysis', W / 2, 6);
}

function drawEigenvalueChart() {
  var canvas = document.getElementById('fsr-eigenvalue');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  var ev = [0.847,0.312,0.198,0.145,0.112,0.089,0.071,0.058,0.044,0.031,0.022,0.015,0.009,0.005,0.003];
  var pl = 44, pr = 12, pt = 28, pb = 36;
  var cW = W - pl - pr, cH = H - pt - pb;
  var maxV = ev[0] * 1.1;
  var bW = Math.max(4, cW / ev.length - 3);

  ctx.strokeStyle = '#2d3f55'; ctx.lineWidth = 1;
  [0.2, 0.4, 0.6, 0.8].forEach(function(f) {
    var y = pt + cH * (1 - f / maxV);
    ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(W - pr, y); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Lato,sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(f.toFixed(1), pl - 3, y);
  });

  var mpY = pt + cH * (1 - 0.18 / maxV);
  ctx.setLineDash([4, 3]); ctx.strokeStyle = '#B54708'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pl, mpY); ctx.lineTo(W - pr, mpY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#B54708'; ctx.font = 'bold 8px Lato,sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText('MP boundary', pl + 4, mpY - 2);

  ev.forEach(function(v, i) {
    var x = pl + i * (bW + 3), bH = (v / maxV) * cH, y = pt + cH - bH;
    var out = v > 0.18;
    ctx.fillStyle = out ? '#D7260Fbb' : '#5925DC44';
    ctx.strokeStyle = out ? '#D7260F' : '#5925DC'; ctx.lineWidth = 1;
    ctx.fillRect(x, y, bW, bH); ctx.strokeRect(x, y, bW, bH);
    if (i === 0) {
      ctx.fillStyle = '#D7260F'; ctx.font = 'bold 9px Lato,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('λ₁=' + v, x + bW / 2, y - 2);
    }
  });

  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('Eigenvalue Spectrum (Adjacency Matrix)', W / 2, 6);
  ctx.fillStyle = '#D7260F'; ctx.fillRect(pl, H - 20, 10, 10);
  ctx.fillStyle = '#94a3b8'; ctx.font = '8px Lato,sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Systemic outlier', pl + 14, H - 14);
}

function drawHeatmapChart() {
  var canvas = document.getElementById('fsr-heatmap');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  var sectors = ['Trading', 'Banking', 'Insurance', 'HedgeF', 'Pension'];
  var n = sectors.length;
  var mx = [
    [0, .85, .62, .45, .30], [.85, 0, .71, .58, .42],
    [.62, .71, 0, .38, .55], [.45, .58, .38, 0, .22], [.30, .42, .55, .22, 0]
  ];
  var pl = 56, pr = 12, pt = 22, pb = 56;
  var cW = (W - pl - pr) / n, cH = (H - pt - pb) / n;

  mx.forEach(function(row, i) {
    row.forEach(function(v, j) {
      var x = pl + j * cW, y = pt + i * cH;
      ctx.fillStyle = i === j ? '#2d3f55'
        : 'rgb(255,' + Math.round(255 * (1 - v * .85)) + ',' + Math.round(255 * (1 - v)) + ')';
      ctx.fillRect(x, y, cW - 1, cH - 1);
      if (v > 0) {
        ctx.fillStyle = v > .6 ? '#fff' : '#1D2939';
        ctx.font = 'bold 9px Lato,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(v.toFixed(2), x + cW / 2, y + cH / 2);
      }
    });
  });

  ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 8px Lato,sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  sectors.forEach(function(s, i) { ctx.fillText(s, pl - 3, pt + i * cH + cH / 2); });
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  sectors.forEach(function(s, j) { ctx.fillText(s, pl + j * cW + cW / 2, pt + n * cH + 3); });

  var g = ctx.createLinearGradient(pl, 0, pl + (W - pl - pr), 0);
  g.addColorStop(0, 'rgb(255,255,255)'); g.addColorStop(.5, 'rgb(255,170,0)'); g.addColorStop(1, 'rgb(255,0,0)');
  ctx.fillStyle = g; ctx.fillRect(pl, H - 12, W - pl - pr, 8);
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('Systemic Risk Heatmap', W / 2, 4);
}

function drawContagionChart() {
  var canvas = document.getElementById('fsr-contagion');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  var nodes  = ['Bank A', 'Bank B', 'Bank C', 'Bank D', 'CCP', 'HedgeF'];
  var impact = [0.72, 0.58, 0.34, 0.41, 0.89, 0.18];
  var colors = ['#D7260F', '#5925DC', '#0F71BB', '#B54708', '#0A8217', '#667085'];
  var pl = 44, pr = 12, pt = 28, pb = 44;
  var cW = W - pl - pr, cH = H - pt - pb;
  var bW = Math.max(4, cW / nodes.length - 6);

  ctx.strokeStyle = '#2d3f55'; ctx.lineWidth = 1;
  [.25, .5, .75, 1].forEach(function(f) {
    var y = pt + cH * (1 - f);
    ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(W - pr, y); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Lato,sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText((f * 100).toFixed(0) + '%', pl - 3, y);
  });

  var sY = pt + cH * .5;
  ctx.setLineDash([4, 3]); ctx.strokeStyle = '#D7260F'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pl, sY); ctx.lineTo(W - pr, sY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#D7260F'; ctx.font = 'bold 8px Lato,sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText('SIFI threshold 50%', W - pr - 2, sY - 2);

  nodes.forEach(function(nd, i) {
    var x = pl + i * (bW + 6), bH = impact[i] * cH, y = pt + cH - bH;
    var sifi = impact[i] >= .5;
    ctx.fillStyle = colors[i] + (sifi ? 'cc' : '55');
    ctx.strokeStyle = colors[i]; ctx.lineWidth = sifi ? 2 : 1;
    ctx.fillRect(x, y, bW, bH); ctx.strokeRect(x, y, bW, bH);
    ctx.fillStyle = colors[i]; ctx.font = 'bold 9px Lato,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText((impact[i] * 100).toFixed(0) + '%', x + bW / 2, y - 2);
    if (sifi) {
      ctx.fillStyle = '#D7260F'; ctx.font = 'bold 7px Lato,sans-serif';
      ctx.fillText('SIFI', x + bW / 2, y - 12);
    }
    ctx.fillStyle = '#94a3b8'; ctx.font = '8px Lato,sans-serif'; ctx.textBaseline = 'top';
    ctx.fillText(nd, x + bW / 2, pt + cH + 4);
  });

  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('Contagion Simulation (DebtRank)', W / 2, 6);
}

// SGX Charts
function drawSgxSTI() {
  var canvas = document.getElementById('sgx-sti');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var data = [3380,3392,3385,3398,3405,3412,3395,3388,3402,3410,3418,3425,3415,3408,3398,3404,3412,3420,3428,3435,3422,3415,3405,3398,3404,3398,3404,3412];
  var pl=44,pr=12,pt=28,pb=28,cW=W-pl-pr,cH=H-pt-pb;
  var minV=Math.min.apply(null,data)*0.998, maxV=Math.max.apply(null,data)*1.002, rng=maxV-minV;
  ctx.strokeStyle='#2d3f55'; ctx.lineWidth=1;
  [0,0.5,1].forEach(function(f){
    var y=pt+cH*(1-f); ctx.beginPath(); ctx.moveTo(pl,y); ctx.lineTo(W-pr,y); ctx.stroke();
    ctx.fillStyle='#94a3b8'; ctx.font='9px Lato,sans-serif'; ctx.textAlign='right'; ctx.textBaseline='middle';
    ctx.fillText((minV+rng*f).toFixed(0),pl-3,y);
  });
  var grad=ctx.createLinearGradient(0,pt,0,pt+cH);
  grad.addColorStop(0,'#D7260F33'); grad.addColorStop(1,'#D7260F05');
  ctx.beginPath(); ctx.moveTo(pl,pt+cH-((data[0]-minV)/rng)*cH);
  data.forEach(function(v,i){ctx.lineTo(pl+(i/(data.length-1))*cW, pt+cH-((v-minV)/rng)*cH);});
  ctx.lineTo(pl+cW,pt+cH); ctx.lineTo(pl,pt+cH); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
  ctx.beginPath(); ctx.moveTo(pl,pt+cH-((data[0]-minV)/rng)*cH);
  data.forEach(function(v,i){ctx.lineTo(pl+(i/(data.length-1))*cW, pt+cH-((v-minV)/rng)*cH);});
  ctx.strokeStyle='#D7260F'; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.stroke();
  ctx.fillStyle='#e2e8f0'; ctx.font='bold 11px Lato,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillText('STI Index (30 days)',W/2,6);
}

function drawSgxTurnover() {
  var canvas = document.getElementById('sgx-turnover');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var data = [1.12,1.28,0.98,1.45,1.32,1.18,1.55,1.22,1.38,1.42,1.15,1.28];
  var pl=44,pr=12,pt=28,pb=36,cW=W-pl-pr,cH=H-pt-pb;
  var maxV=Math.max.apply(null,data)*1.15, bW=Math.max(4,cW/data.length-4);
  ctx.strokeStyle='#2d3f55'; ctx.lineWidth=1;
  [0.5,1.0,1.5].forEach(function(f){
    var y=pt+cH*(1-f/maxV); ctx.beginPath(); ctx.moveTo(pl,y); ctx.lineTo(W-pr,y); ctx.stroke();
    ctx.fillStyle='#94a3b8'; ctx.font='9px Lato,sans-serif'; ctx.textAlign='right'; ctx.textBaseline='middle';
    ctx.fillText(f.toFixed(1)+'B',pl-3,y);
  });
  data.forEach(function(v,i){
    var x=pl+i*(bW+4), bH=(v/maxV)*cH, y=pt+cH-bH;
    ctx.fillStyle=v>=1.3?'#0A8217bb':'#5925DCbb'; ctx.strokeStyle=v>=1.3?'#0A8217':'#5925DC'; ctx.lineWidth=1;
    ctx.fillRect(x,y,bW,bH); ctx.strokeRect(x,y,bW,bH);
  });
  ctx.fillStyle='#e2e8f0'; ctx.font='bold 11px Lato,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillText('Daily Turnover (S$ Billion)',W/2,6);
}

function drawSgxTopVal() {
  var canvas = document.getElementById('sgx-topval');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var labels=['DBS','OCBC','UOB','Singtel','Keppel'];
  var values=[1920,1134,985,624,447];
  var colors=['#D7260F','#5925DC','#0F71BB','#B54708','#0A8217'];
  var pl=60,pr=12,pt=28,pb=12,cH=H-pt-pb;
  var maxV=Math.max.apply(null,values)*1.1, barH=Math.max(8,(cH/labels.length)-8);
  labels.forEach(function(l,i){
    var y=pt+i*(barH+8), bW=(values[i]/maxV)*(W-pl-pr);
    ctx.fillStyle=colors[i]+'bb'; ctx.strokeStyle=colors[i]; ctx.lineWidth=1;
    ctx.fillRect(pl,y,bW,barH); ctx.strokeRect(pl,y,bW,barH);
    ctx.fillStyle='#94a3b8'; ctx.font='bold 9px Lato,sans-serif'; ctx.textAlign='right'; ctx.textBaseline='middle';
    ctx.fillText(l,pl-4,y+barH/2);
    ctx.fillStyle=colors[i]; ctx.textAlign='left';
    ctx.fillText('S$'+(values[i]/1000).toFixed(1)+'M',pl+bW+4,y+barH/2);
  });
  ctx.fillStyle='#e2e8f0'; ctx.font='bold 11px Lato,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillText('Top Traded by Value (S$)',W/2,6);
}

function drawSgxDeriv() {
  var canvas = document.getElementById('sgx-deriv');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var labels=['SiMSCI','NK225','Iron Ore','USD/SGD'];
  var values=[120,50,200,80];
  var colors=['#D7260F','#5925DC','#B54708','#0F71BB'];
  var total=values.reduce(function(a,b){return a+b;},0);
  var cx=W*0.36,cy=H*0.54,r=Math.min(W*0.28,H*0.38),inner=r*0.55,angle=-Math.PI/2;
  values.forEach(function(v,i){
    var slice=(v/total)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,angle,angle+slice); ctx.closePath();
    ctx.fillStyle=colors[i]; ctx.fill(); angle+=slice;
  });
  ctx.beginPath(); ctx.arc(cx,cy,inner,0,Math.PI*2); ctx.fillStyle='#1D2939'; ctx.fill();
  ctx.fillStyle='#e2e8f0'; ctx.font='bold 11px Lato,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(total+' lots',cx,cy);
  labels.forEach(function(l,i){
    var lx=W*0.68,ly=H*0.2+i*22;
    ctx.fillStyle=colors[i]; ctx.fillRect(lx,ly,10,10);
    ctx.fillStyle='#94a3b8'; ctx.font='9px Lato,sans-serif'; ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillText(l+' '+Math.round((values[i]/total)*100)+'%',lx+14,ly+1);
  });
  ctx.fillStyle='#e2e8f0'; ctx.font='bold 11px Lato,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillText('Derivatives Volume by Product',W/2,6);
}

// ACRA Charts
function drawAcraEntity() {
  var canvas = document.getElementById('acra-entity');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var labels = ['Pte Ltd', 'Public Co', 'Sole Prop', 'LLP', 'Other'];
  var values = [412000, 8500, 85000, 22000, 22500];
  var colors = ['#5925DC', '#D7260F', '#0F71BB', '#B54708', '#667085'];
  var total = values.reduce(function(a,b){return a+b;}, 0);
  var cx = W * 0.36, cy = H * 0.54, r = Math.min(W * 0.28, H * 0.38), inner = r * 0.55, angle = -Math.PI / 2;
  values.forEach(function(v, i) {
    var slice = (v / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + slice); ctx.closePath();
    ctx.fillStyle = colors[i]; ctx.fill(); angle += slice;
  });
  ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2); ctx.fillStyle = '#1D2939'; ctx.fill();
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 10px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('550K+', cx, cy);
  labels.forEach(function(l, i) {
    var lx = W * 0.68, ly = H * 0.15 + i * 20;
    ctx.fillStyle = colors[i]; ctx.fillRect(lx, ly, 10, 10);
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Lato,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(l + ' ' + Math.round((values[i] / total) * 100) + '%', lx + 14, ly + 1);
  });
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('Entity Type Distribution', W / 2, 6);
}

function drawAcraRegistrations() {
  var canvas = document.getElementById('acra-registrations');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var data = [4200, 4500, 4100, 4800, 4600, 5100, 5400, 4900, 5200, 5000, 5500, 5800];
  var pl = 44, pr = 12, pt = 28, pb = 28, cW = W - pl - pr, cH = H - pt - pb;
  var minV = Math.min.apply(null, data) * 0.92, maxV = Math.max.apply(null, data) * 1.08, rng = maxV - minV;
  ctx.strokeStyle = '#2d3f55'; ctx.lineWidth = 1;
  [0, 0.5, 1].forEach(function(f) {
    var y = pt + cH * (1 - f); ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(W - pr, y); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Lato,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(minV + rng * f), pl - 3, y);
  });
  var grad = ctx.createLinearGradient(0, pt, 0, pt + cH);
  grad.addColorStop(0, '#0A821733'); grad.addColorStop(1, '#0A821705');
  ctx.beginPath(); ctx.moveTo(pl, pt + cH - ((data[0] - minV) / rng) * cH);
  data.forEach(function(v, i) { ctx.lineTo(pl + (i / (data.length - 1)) * cW, pt + cH - ((v - minV) / rng) * cH); });
  ctx.lineTo(pl + cW, pt + cH); ctx.lineTo(pl, pt + cH); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath(); ctx.moveTo(pl, pt + cH - ((data[0] - minV) / rng) * cH);
  data.forEach(function(v, i) { ctx.lineTo(pl + (i / (data.length - 1)) * cW, pt + cH - ((v - minV) / rng) * cH); });
  ctx.strokeStyle = '#0A8217'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('New Registrations (12 months)', W / 2, 6);
}

function drawAcraCompliance() {
  var canvas = document.getElementById('acra-compliance');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var labels = ['Compliant', 'Overdue', 'Non-Compliant'];
  var values = [88, 8.8, 3.2];
  var colors = ['#0A8217', '#B54708', '#D7260F'];
  var pl = 60, pr = 12, pt = 28, pb = 12, cH = H - pt - pb;
  var maxV = 100, barH = Math.max(12, (cH / labels.length) - 12);
  labels.forEach(function(l, i) {
    var y = pt + i * (barH + 12), bW = (values[i] / maxV) * (W - pl - pr);
    ctx.fillStyle = colors[i] + 'bb'; ctx.strokeStyle = colors[i]; ctx.lineWidth = 1;
    ctx.fillRect(pl, y, bW, barH); ctx.strokeRect(pl, y, bW, barH);
    ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 9px Lato,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(l, pl - 4, y + barH / 2);
    ctx.fillStyle = colors[i]; ctx.textAlign = 'left';
    ctx.fillText(values[i] + '%', pl + bW + 4, y + barH / 2);
  });
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('Compliance Status (%)', W / 2, 6);
}

function drawAcraNationality() {
  var canvas = document.getElementById('acra-nationality');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var labels = ['Singapore', 'Malaysia', 'China', 'India', 'Indonesia', 'Other'];
  var values = [42, 18, 14, 10, 6, 10];
  var colors = ['#D7260F', '#5925DC', '#B54708', '#0F71BB', '#0A8217', '#667085'];
  var total = values.reduce(function(a, b) { return a + b; }, 0);
  var cx = W * 0.36, cy = H * 0.54, r = Math.min(W * 0.28, H * 0.38), inner = r * 0.55, angle = -Math.PI / 2;
  values.forEach(function(v, i) {
    var slice = (v / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + slice); ctx.closePath();
    ctx.fillStyle = colors[i]; ctx.fill(); angle += slice;
  });
  ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2); ctx.fillStyle = '#1D2939'; ctx.fill();
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 10px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('1.2M+', cx, cy);
  labels.forEach(function(l, i) {
    var lx = W * 0.68, ly = H * 0.12 + i * 18;
    ctx.fillStyle = colors[i]; ctx.fillRect(lx, ly, 10, 10);
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Lato,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(l + ' ' + values[i] + '%', lx + 14, ly + 1);
  });
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('Director Nationality Mix', W / 2, 6);
}

// MAS Exchange Rate Charts
function drawFxSpot() {
  var canvas = document.getElementById('fx-spot');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var labels = ['USD', 'EUR', 'GBP', 'JPY*', 'CNY', 'MYR'];
  var values = [1.3425, 1.4531, 1.6964, 0.0089, 0.1848, 0.3017];
  var colors = ['#B8962E', '#5925DC', '#D7260F', '#0F71BB', '#B54708', '#0A8217'];
  var pl = 44, pr = 12, pt = 28, pb = 40, cW = W - pl - pr, cH = H - pt - pb;
  var maxV = Math.max.apply(null, values) * 1.15, bW = Math.max(4, cW / values.length - 6);
  ctx.strokeStyle = '#2d3f55'; ctx.lineWidth = 1;
  [0.5, 1.0, 1.5].forEach(function(f) {
    var y = pt + cH * (1 - f / maxV); ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(W - pr, y); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Lato,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(f.toFixed(1), pl - 3, y);
  });
  values.forEach(function(v, i) {
    var x = pl + i * (bW + 6), bH = Math.max(2, (v / maxV) * cH), y = pt + cH - bH;
    ctx.fillStyle = colors[i] + 'bb'; ctx.strokeStyle = colors[i]; ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, bW, bH); ctx.strokeRect(x, y, bW, bH);
    ctx.fillStyle = colors[i]; ctx.font = 'bold 8px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(v.toFixed(v < 0.1 ? 4 : 4), x + bW / 2, y - 1);
    ctx.fillStyle = '#94a3b8'; ctx.font = '8px Lato,sans-serif'; ctx.textBaseline = 'top';
    ctx.fillText(labels[i], x + bW / 2, pt + cH + 4);
  });
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('SGD per Unit of Foreign Currency', W / 2, 6);
}

function drawFxSneer() {
  var canvas = document.getElementById('fx-sneer');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var data = [127.8,127.9,128.0,128.1,127.9,128.0,128.2,128.1,128.3,128.2,128.0,128.1,128.3,128.2,128.4,128.3,128.1,128.2,128.4,128.3,128.5,128.4,128.3,128.4,128.42,128.39,128.42,128.45];
  var bandMid = [127.7,127.72,127.74,127.76,127.78,127.8,127.82,127.84,127.86,127.88,127.9,127.92,127.94,127.96,127.98,128.0,128.02,128.04,128.06,128.08,128.1,128.12,128.14,128.16,128.16,128.18,128.18,128.20];
  var pl = 44, pr = 12, pt = 28, pb = 28, cW = W - pl - pr, cH = H - pt - pb;
  var allV = data.concat(bandMid.map(function(m){return m+1.3;})).concat(bandMid.map(function(m){return m-1.3;}));
  var minV = Math.min.apply(null, allV) - 0.2, maxV = Math.max.apply(null, allV) + 0.2, rng = maxV - minV;
  var xp = function(i) { return pl + (i / (data.length - 1)) * cW; };
  var yp = function(v) { return pt + cH - ((v - minV) / rng) * cH; };
  // Band fill
  ctx.beginPath();
  bandMid.forEach(function(m, i) { var x = xp(i); if (i === 0) ctx.moveTo(x, yp(m + 1.3)); else ctx.lineTo(x, yp(m + 1.3)); });
  for (var i = bandMid.length - 1; i >= 0; i--) ctx.lineTo(xp(i), yp(bandMid[i] - 1.3));
  ctx.closePath(); ctx.fillStyle = '#5925DC15'; ctx.fill();
  // Band mid line
  ctx.beginPath(); bandMid.forEach(function(m, i) { if (i === 0) ctx.moveTo(xp(i), yp(m)); else ctx.lineTo(xp(i), yp(m)); });
  ctx.strokeStyle = '#5925DC'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
  // S$NEER line
  ctx.beginPath(); data.forEach(function(v, i) { if (i === 0) ctx.moveTo(xp(i), yp(v)); else ctx.lineTo(xp(i), yp(v)); });
  ctx.strokeStyle = '#B8962E'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('S$NEER Index with Policy Band', W / 2, 6);
  ctx.font = '8px Lato,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#B8962E'; ctx.fillRect(8, H - 22, 14, 3); ctx.fillText('S$NEER', 26, H - 20);
  ctx.fillStyle = '#5925DC'; ctx.fillRect(8, H - 10, 14, 3); ctx.fillText('Band mid', 26, H - 8);
}

function drawFxForward() {
  var canvas = document.getElementById('fx-forward');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var labels = ['Spot', '1M', '3M', '6M', '12M'];
  var values = [1.3425, 1.3418, 1.3395, 1.3358, 1.3285];
  var pl = 44, pr = 12, pt = 28, pb = 36, cW = W - pl - pr, cH = H - pt - pb;
  var minV = Math.min.apply(null, values) * 0.998, maxV = Math.max.apply(null, values) * 1.002, rng = maxV - minV;
  var xp = function(i) { return pl + (i / (values.length - 1)) * cW; };
  var yp = function(v) { return pt + cH - ((v - minV) / rng) * cH; };
  ctx.strokeStyle = '#2d3f55'; ctx.lineWidth = 1;
  [0, 0.5, 1].forEach(function(f) {
    var y = pt + cH * (1 - f); ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(W - pr, y); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Lato,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText((minV + rng * f).toFixed(4), pl - 3, y);
  });
  // Area fill
  var grad = ctx.createLinearGradient(0, pt, 0, pt + cH);
  grad.addColorStop(0, '#B8962E33'); grad.addColorStop(1, '#B8962E05');
  ctx.beginPath(); ctx.moveTo(xp(0), yp(values[0]));
  values.forEach(function(v, i) { ctx.lineTo(xp(i), yp(v)); });
  ctx.lineTo(xp(values.length - 1), pt + cH); ctx.lineTo(xp(0), pt + cH); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();
  // Line
  ctx.beginPath(); values.forEach(function(v, i) { if (i === 0) ctx.moveTo(xp(i), yp(v)); else ctx.lineTo(xp(i), yp(v)); });
  ctx.strokeStyle = '#B8962E'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
  // Points + labels
  values.forEach(function(v, i) {
    ctx.beginPath(); ctx.arc(xp(i), yp(v), 4, 0, Math.PI * 2); ctx.fillStyle = '#B8962E'; ctx.fill();
    ctx.fillStyle = '#94a3b8'; ctx.font = '8px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(labels[i], xp(i), pt + cH + 4);
    ctx.fillStyle = '#B8962E'; ctx.textBaseline = 'bottom'; ctx.font = 'bold 8px Lato,sans-serif';
    ctx.fillText(v.toFixed(4), xp(i), yp(v) - 5);
  });
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('USD/SGD Forward Curve', W / 2, 6);
}

function drawFxRegional() {
  var canvas = document.getElementById('fx-regional');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var labels = ['MYR', 'THB', 'IDR', 'PHP', 'VND', 'CNY'];
  var values = [-0.10, 0.15, -0.22, 0.08, -0.05, 0.15];
  var pl = 44, pr = 12, pt = 28, pb = 40, cW = W - pl - pr, cH = H - pt - pb;
  var maxAbs = Math.max.apply(null, values.map(function(v) { return Math.abs(v); })) * 1.5;
  var midY = pt + cH / 2;
  var bW = Math.max(4, cW / values.length - 6);
  // Zero line
  ctx.strokeStyle = '#667085'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(pl, midY); ctx.lineTo(W - pr, midY); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#94a3b8'; ctx.font = '8px Lato,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('0%', pl - 3, midY);
  values.forEach(function(v, i) {
    var x = pl + i * (bW + 6);
    var bH = Math.abs(v) / maxAbs * (cH / 2);
    var y = v >= 0 ? midY - bH : midY;
    var col = v >= 0 ? '#0A8217' : '#D7260F';
    ctx.fillStyle = col + 'bb'; ctx.strokeStyle = col; ctx.lineWidth = 1;
    ctx.fillRect(x, y, bW, bH); ctx.strokeRect(x, y, bW, bH);
    ctx.fillStyle = col; ctx.font = 'bold 8px Lato,sans-serif'; ctx.textAlign = 'center';
    ctx.textBaseline = v >= 0 ? 'bottom' : 'top';
    ctx.fillText((v >= 0 ? '+' : '') + v.toFixed(2) + '%', x + bW / 2, v >= 0 ? y - 1 : y + bH + 1);
    ctx.fillStyle = '#94a3b8'; ctx.font = '8px Lato,sans-serif'; ctx.textBaseline = 'top';
    ctx.fillText(labels[i], x + bW / 2, pt + cH + 4);
  });
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('Regional Currency Change vs SGD (%)', W / 2, 6);
}

// MAS Supervision Charts
function drawSupvScores() {
  var canvas = document.getElementById('supv-scores');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var buckets = ['0-20', '20-40', '40-60', '60-80', '80-100'];
  var counts = [45, 98, 285, 520, 252];
  var colors = ['#D7260F', '#D7260F', '#B54708', '#0F71BB', '#0A8217'];
  var pl = 44, pr = 12, pt = 28, pb = 40, cW = W - pl - pr, cH = H - pt - pb;
  var maxV = Math.max.apply(null, counts) * 1.15, bW = Math.max(4, cW / counts.length - 6);
  ctx.strokeStyle = '#2d3f55'; ctx.lineWidth = 1;
  [150, 300, 450].forEach(function(f) {
    var y = pt + cH * (1 - f / maxV); ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(W - pr, y); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Lato,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(f, pl - 3, y);
  });
  counts.forEach(function(v, i) {
    var x = pl + i * (bW + 6), bH = (v / maxV) * cH, y = pt + cH - bH;
    ctx.fillStyle = colors[i] + 'bb'; ctx.strokeStyle = colors[i]; ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, bW, bH); ctx.strokeRect(x, y, bW, bH);
    ctx.fillStyle = colors[i]; ctx.font = 'bold 8px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(v, x + bW / 2, y - 1);
    ctx.fillStyle = '#94a3b8'; ctx.font = '8px Lato,sans-serif'; ctx.textBaseline = 'top';
    ctx.fillText(buckets[i], x + bW / 2, pt + cH + 4);
  });
  // Threshold line at 50
  var thY = pt + cH * (1 - 0); // just label
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('Entity Risk Score Distribution', W / 2, 6);
  ctx.fillStyle = '#94a3b8'; ctx.font = '8px Lato,sans-serif'; ctx.textBaseline = 'bottom';
  ctx.fillText('Score range →', W / 2, H - 2);
}

function drawSupvAml() {
  var canvas = document.getElementById('supv-aml');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var data = [320, 345, 338, 380, 395, 410, 425, 440, 435, 450, 462, 478];
  var pl = 44, pr = 12, pt = 28, pb = 28, cW = W - pl - pr, cH = H - pt - pb;
  var minV = Math.min.apply(null, data) * 0.92, maxV = Math.max.apply(null, data) * 1.08, rng = maxV - minV;
  ctx.strokeStyle = '#2d3f55'; ctx.lineWidth = 1;
  [0, 0.5, 1].forEach(function(f) {
    var y = pt + cH * (1 - f); ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(W - pr, y); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Lato,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(minV + rng * f), pl - 3, y);
  });
  var grad = ctx.createLinearGradient(0, pt, 0, pt + cH);
  grad.addColorStop(0, '#D7260F33'); grad.addColorStop(1, '#D7260F05');
  ctx.beginPath(); ctx.moveTo(pl, pt + cH - ((data[0] - minV) / rng) * cH);
  data.forEach(function(v, i) { ctx.lineTo(pl + (i / (data.length - 1)) * cW, pt + cH - ((v - minV) / rng) * cH); });
  ctx.lineTo(pl + cW, pt + cH); ctx.lineTo(pl, pt + cH); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath(); ctx.moveTo(pl, pt + cH - ((data[0] - minV) / rng) * cH);
  data.forEach(function(v, i) { ctx.lineTo(pl + (i / (data.length - 1)) * cW, pt + cH - ((v - minV) / rng) * cH); });
  ctx.strokeStyle = '#D7260F'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('AML Alerts / STRs (12 months)', W / 2, 6);
}

function drawSupvSignals() {
  var canvas = document.getElementById('supv-signals');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var labels = ['Liquidity', 'AML Pattern', 'Exposure', 'Conduct'];
  var values = [0.87, 0.92, 0.74, 0.61];
  var colors = ['#B54708', '#D7260F', '#5925DC', '#0A8217'];
  var pl = 70, pr = 12, pt = 28, pb = 12, cH = H - pt - pb;
  var barH = Math.max(12, (cH / labels.length) - 12);
  labels.forEach(function(l, i) {
    var y = pt + i * (barH + 12), bW = values[i] * (W - pl - pr);
    ctx.fillStyle = colors[i] + 'bb'; ctx.strokeStyle = colors[i]; ctx.lineWidth = 1;
    ctx.fillRect(pl, y, bW, barH); ctx.strokeRect(pl, y, bW, barH);
    ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 9px Lato,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(l, pl - 4, y + barH / 2);
    ctx.fillStyle = colors[i]; ctx.textAlign = 'left'; ctx.font = 'bold 9px Lato,sans-serif';
    ctx.fillText(values[i].toFixed(2), pl + bW + 4, y + barH / 2);
  });
  // Threshold line at 0.8
  var thX = pl + 0.8 * (W - pl - pr);
  ctx.setLineDash([4, 3]); ctx.strokeStyle = '#B8962E'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(thX, pt); ctx.lineTo(thX, pt + cH); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#B8962E'; ctx.font = 'bold 7px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('Action threshold', thX, pt - 2);
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('Predictive Signal Confidence', W / 2, 6);
}

function drawSupvTiers() {
  var canvas = document.getElementById('supv-tiers');
  if (!canvas) return;
  var d = _otcResize(canvas), W = d.W, H = d.H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var labels = ['Low', 'Medium', 'High', 'Critical'];
  var values = [640, 380, 135, 45];
  var colors = ['#0A8217', '#0F71BB', '#B54708', '#D7260F'];
  var total = values.reduce(function(a, b) { return a + b; }, 0);
  var cx = W * 0.36, cy = H * 0.54, r = Math.min(W * 0.28, H * 0.38), inner = r * 0.55, angle = -Math.PI / 2;
  values.forEach(function(v, i) {
    var slice = (v / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + slice); ctx.closePath();
    ctx.fillStyle = colors[i]; ctx.fill(); angle += slice;
  });
  ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2); ctx.fillStyle = '#1D2939'; ctx.fill();
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 10px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('1,200', cx, cy);
  labels.forEach(function(l, i) {
    var lx = W * 0.68, ly = H * 0.18 + i * 22;
    ctx.fillStyle = colors[i]; ctx.fillRect(lx, ly, 10, 10);
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px Lato,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(l + ' ' + values[i] + ' (' + Math.round((values[i] / total) * 100) + '%)', lx + 14, ly + 1);
  });
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('Risk Tier Distribution', W / 2, 6);
}

// Adoption Charts
function _adoptChart(id, data, color, label, isBars) {
  var canvas = document.getElementById(id);
  if (!canvas) return;
  var d = _otcResize(canvas);
  canvas.height = Math.round(d.W * 0.45);
  var W = canvas.width, H = canvas.height;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  var pl = 48, pr = 12, pt = 24, pb = 8;
  var cW = W - pl - pr, cH = H - pt - pb;
  var minV = Math.min.apply(null, data) * 0.85;
  var maxV = Math.max.apply(null, data) * 1.12;
  var rng = maxV - minV || 1;
  // Grid
  ctx.strokeStyle = '#E4E7EC'; ctx.lineWidth = 1;
  [0, 0.5, 1].forEach(function(f) {
    var y = pt + cH * (1 - f);
    ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(W - pr, y); ctx.stroke();
    ctx.fillStyle = '#98A2B3'; ctx.font = '9px Lato,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    var v = minV + rng * f;
    ctx.fillText(v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v.toFixed(0), pl - 3, y);
  });
  if (isBars) {
    var bW = Math.max(6, cW / data.length - 8);
    data.forEach(function(v, i) {
      var x = pl + i * (bW + 8);
      var bH = ((v - minV) / rng) * cH;
      var y = pt + cH - bH;
      ctx.fillStyle = color + 'bb'; ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.fillRect(x, y, bW, bH); ctx.strokeRect(x, y, bW, bH);
      ctx.fillStyle = color; ctx.font = 'bold 9px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v, x + bW / 2, y - 2);
    });
  } else {
    // Area fill
    var grad = ctx.createLinearGradient(0, pt, 0, pt + cH);
    grad.addColorStop(0, color + '33'); grad.addColorStop(1, color + '05');
    ctx.beginPath();
    data.forEach(function(v, i) {
      var x = pl + (i / (data.length - 1)) * cW;
      var y = pt + cH - ((v - minV) / rng) * cH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.lineTo(pl + cW, pt + cH); ctx.lineTo(pl, pt + cH); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    // Line
    ctx.beginPath();
    data.forEach(function(v, i) {
      var x = pl + (i / (data.length - 1)) * cW;
      var y = pt + cH - ((v - minV) / rng) * cH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
    // Dots + values
    data.forEach(function(v, i) {
      var x = pl + (i / (data.length - 1)) * cW;
      var y = pt + cH - ((v - minV) / rng) * cH;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = color; ctx.font = 'bold 9px Lato,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v, x, y - 6);
    });
  }
  // Title
  ctx.fillStyle = '#1D2939'; ctx.font = 'bold 10px Lato,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(label, pl, 4);
  // MoM change
  var last = data[data.length - 1], prev = data[data.length - 2];
  var pct = prev ? (((last - prev) / prev) * 100).toFixed(1) : '0.0';
  var up = last >= prev;
  ctx.fillStyle = up ? '#0A8217' : '#D7260F'; ctx.textAlign = 'right';
  ctx.fillText((up ? '▲ +' : '▼ ') + pct + '% MoM', W - pr, 4);
}

function drawAdoptionCharts() {
  _adoptChart('adopt-users',      [2, 3, 3, 4, 5, 6],           '#5925DC', 'Registered Users', true);
  _adoptChart('adopt-datasets',   [5, 6, 7, 8, 9, 11],          '#1F69FF', 'Datasets Available', false);
  _adoptChart('adopt-requests',   [4, 6, 8, 10, 12, 16],        '#B54708', 'Total Requests', true);
  _adoptChart('adopt-policies',   [3, 5, 6, 8, 10, 12],         '#0A8217', 'Active Ranger Policies', false);
  _adoptChart('adopt-alerts',     [5, 7, 8, 10, 12, 16],        '#D7260F', 'Intelligence Alerts', true);
  _adoptChart('adopt-dashboards', [120, 185, 245, 310, 420, 580],'#0F71BB', 'Dashboard Page Views', false);
}

// Tour charts for login carousel — full-width versions of actual dataset charts
function drawTourCharts() {
  // Helper to size tour canvas
  function _tourSize(canvas) {
    var p = canvas.parentElement;
    var w = p ? p.clientWidth : 300;
    w = w > 10 ? w : 300;
    canvas.width = w; canvas.height = 140;
    return { W: w, H: 140 };
  }

  // 0: Catalog — category bar chart
  var c0 = document.getElementById('tour-chart-0');
  if (c0) {
    var d = _tourSize(c0), W = d.W, H = d.H, ctx = c0.getContext('2d');
    var labels = ['Market','Trade','Credit','Exchange','Research','Regulatory','Supervision'];
    var vals = [4,2,2,1,1,2,1];
    var cols = ['#5925DC','#D7260F','#B54708','#0F71BB','#0A8217','#1B2A4A','#B8962E'];
    var pl=40,pr=8,pt=16,pb=24,cW=W-pl-pr,cH=H-pt-pb,maxV=5,bW=Math.max(6,cW/vals.length-8);
    ctx.strokeStyle='#2d3f55';ctx.lineWidth=1;
    [1,2,3,4].forEach(function(f){var y=pt+cH*(1-f/maxV);ctx.beginPath();ctx.moveTo(pl,y);ctx.lineTo(W-pr,y);ctx.stroke();ctx.fillStyle='#667085';ctx.font='8px Lato,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(f,pl-3,y);});
    vals.forEach(function(v,i){var x=pl+i*(bW+8),bH=(v/maxV)*cH,y=pt+cH-bH;ctx.fillStyle=cols[i]+'cc';ctx.strokeStyle=cols[i];ctx.lineWidth=1.5;ctx.fillRect(x,y,bW,bH);ctx.strokeRect(x,y,bW,bH);ctx.fillStyle='#94a3b8';ctx.font='7px Lato,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(labels[i],x+bW/2,pt+cH+3);});
    ctx.fillStyle='#e2e8f0';ctx.font='bold 9px Lato,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('Datasets by Category',W/2,2);
  }

  // 1: OTC — network diagram (mini version)
  var c1 = document.getElementById('tour-chart-1');
  if (c1) {
    var d = _tourSize(c1), W = d.W, H = d.H, ctx = c1.getContext('2d');
    var nodes=[{x:W*.18,y:H*.35,r:14,c:'#D7260F',l:'Bank A'},{x:W*.65,y:H*.25,r:12,c:'#5925DC',l:'Bank B'},{x:W*.75,y:H*.7,r:10,c:'#0F71BB',l:'Bank C'},{x:W*.4,y:H*.75,r:11,c:'#B54708',l:'Bank D'},{x:W*.45,y:H*.48,r:18,c:'#0A8217',l:'CCP'},{x:W*.12,y:H*.7,r:7,c:'#667085',l:'HF'}];
    var edges=[{f:0,t:4,c:'#0A8217',w:3},{f:1,t:4,c:'#0A8217',w:2.5},{f:2,t:4,c:'#0A8217',w:2},{f:3,t:4,c:'#0A8217',w:2},{f:0,t:1,c:'#D7260F',w:1.5,dash:true},{f:0,t:5,c:'#B54708',w:1,dash:true}];
    edges.forEach(function(e){var a=nodes[e.f],b=nodes[e.t];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=e.c;ctx.lineWidth=e.w;ctx.globalAlpha=0.6;ctx.setLineDash(e.dash?[4,3]:[]);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;});
    nodes.forEach(function(n){ctx.shadowColor=n.c;ctx.shadowBlur=6;ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fillStyle=n.c+'33';ctx.fill();ctx.strokeStyle=n.c;ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle=n.c;ctx.font='bold 7px Lato,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.l,n.x,n.y);});
    // Eigenvalue mini bars on right side
    var ev=[0.847,0.312,0.198,0.145,0.112,0.089];
    var ex=W*0.82,ey=20,ebw=6;
    ev.forEach(function(v,i){var bH=v*80,by=H-15-bH;ctx.fillStyle=v>0.18?'#D7260Fbb':'#5925DC44';ctx.fillRect(ex+i*(ebw+3),by,ebw,bH);});
    ctx.fillStyle='#e2e8f0';ctx.font='bold 9px Lato,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('OTC Counterparty Network + Eigenvalues',W/2,2);
  }

  // 2: SGX — STI line + turnover bars
  var c2 = document.getElementById('tour-chart-2');
  if (c2) {
    var d = _tourSize(c2), W = d.W, H = d.H, ctx = c2.getContext('2d');
    var sti=[3380,3392,3385,3398,3405,3412,3395,3388,3402,3410,3418,3425,3415,3408,3398,3404,3412];
    var pl=35,pr=8,pt=16,pb=12,cW=W*0.55-pl,cH=H-pt-pb;
    var minV=3370,maxV=3430,rng=maxV-minV;
    var grad=ctx.createLinearGradient(0,pt,0,pt+cH);grad.addColorStop(0,'#D7260F33');grad.addColorStop(1,'#D7260F05');
    ctx.beginPath();sti.forEach(function(v,i){var px=pl+(i/(sti.length-1))*cW,py=pt+cH-((v-minV)/rng)*cH;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);});
    ctx.lineTo(pl+cW,pt+cH);ctx.lineTo(pl,pt+cH);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
    ctx.beginPath();sti.forEach(function(v,i){var px=pl+(i/(sti.length-1))*cW,py=pt+cH-((v-minV)/rng)*cH;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);});
    ctx.strokeStyle='#D7260F';ctx.lineWidth=2;ctx.lineJoin='round';ctx.stroke();
    // Turnover bars on right
    var turnover=[1.12,1.28,0.98,1.45,1.32,1.18,1.55,1.22];
    var bx=W*0.6,bw=Math.max(4,(W*0.38)/turnover.length-3),maxT=1.6;
    turnover.forEach(function(v,i){var bH=(v/maxT)*cH,by=pt+cH-bH;ctx.fillStyle=v>=1.3?'#0A8217bb':'#5925DCbb';ctx.fillRect(bx+i*(bw+3),by,bw,bH);});
    ctx.fillStyle='#e2e8f0';ctx.font='bold 9px Lato,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('STI Index + Daily Turnover (S$B)',W/2,2);
  }

  // 3: MAS FX — S$NEER with band + spot bars
  var c3 = document.getElementById('tour-chart-3');
  if (c3) {
    var d = _tourSize(c3), W = d.W, H = d.H, ctx = c3.getContext('2d');
    var sneer=[127.8,127.9,128.0,128.1,128.2,128.1,128.3,128.2,128.4,128.3,128.42,128.45];
    var pl=35,pr=8,pt=16,pb=12,cW=W*0.55-pl,cH=H-pt-pb;
    var minV=127.5,maxV=129.0,rng=maxV-minV;
    // Band fill
    ctx.fillStyle='#5925DC12';ctx.fillRect(pl,pt+cH*((maxV-128.8)/rng),cW,cH*((128.8-127.0)/rng));
    ctx.beginPath();sneer.forEach(function(v,i){var px=pl+(i/(sneer.length-1))*cW,py=pt+cH-((v-minV)/rng)*cH;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);});
    ctx.strokeStyle='#B8962E';ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.stroke();
    // Spot rate bars on right
    var labels=['USD','EUR','GBP','JPY','CNY','MYR'];
    var vals=[1.34,1.45,1.70,0.009,0.18,0.30];
    var cols=['#B8962E','#5925DC','#D7260F','#0F71BB','#B54708','#0A8217'];
    var bx=W*0.6,bw=Math.max(4,(W*0.38)/vals.length-3),maxS=1.8;
    vals.forEach(function(v,i){var bH=Math.max(2,(v/maxS)*cH),by=pt+cH-bH;ctx.fillStyle=cols[i]+'bb';ctx.fillRect(bx+i*(bw+3),by,bw,bH);});
    ctx.fillStyle='#e2e8f0';ctx.font='bold 9px Lato,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('S$NEER Policy Band + SGD Spot Rates',W/2,2);
  }

  // 4: Risk — compliance donut + risk tier bars
  var c4 = document.getElementById('tour-chart-4');
  if (c4) {
    var d = _tourSize(c4), W = d.W, H = d.H, ctx = c4.getContext('2d');
    var scores=[85,92,70,80,100,78]; var labels=['Approval','Pending','Restricted','Bulk','Policy','Permanent'];
    var cols=['#0A8217','#0A8217','#B54708','#B54708','#0A8217','#D7260F'];
    var pl=8,bw=Math.max(6,(W*0.5-pl)/scores.length-4),pt=16,pb=20,cH=H-pt-pb;
    scores.forEach(function(v,i){var bH=(v/100)*cH,by=pt+cH-bH,x=pl+i*(bw+4);ctx.fillStyle=cols[i]+'bb';ctx.strokeStyle=cols[i];ctx.lineWidth=1;ctx.fillRect(x,by,bw,bH);ctx.strokeRect(x,by,bw,bH);ctx.fillStyle='#94a3b8';ctx.font='6px Lato,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(labels[i].slice(0,5),x+bw/2,pt+cH+2);});
    // Donut on right
    var tiers=[640,380,135,45]; var tcols=['#0A8217','#0F71BB','#B54708','#D7260F'];
    var cx=W*0.72,cy=H*0.52,r=35,inner=18,angle=-Math.PI/2,total=1200;
    tiers.forEach(function(v,i){var s=(v/total)*Math.PI*2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,angle+s);ctx.closePath();ctx.fillStyle=tcols[i];ctx.fill();angle+=s;});
    ctx.beginPath();ctx.arc(cx,cy,inner,0,Math.PI*2);ctx.fillStyle='#141e2b';ctx.fill();
    ctx.fillStyle='#e2e8f0';ctx.font='bold 9px Lato,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('85%',cx,cy);
    ctx.fillStyle='#e2e8f0';ctx.textBaseline='top';ctx.fillText('Compliance Scorecard + Risk Tiers',W/2,2);
  }

  // 5: Actions — alert severity timeline + AI sparkline
  var c5 = document.getElementById('tour-chart-5');
  if (c5) {
    var d = _tourSize(c5), W = d.W, H = d.H, ctx = c5.getContext('2d');
    // Severity dots timeline
    var alerts=[{s:'critical',c:'#D7260F'},{s:'high',c:'#B54708'},{s:'high',c:'#B54708'},{s:'high',c:'#B54708'},{s:'medium',c:'#5925DC'},{s:'medium',c:'#5925DC'},{s:'medium',c:'#5925DC'},{s:'low',c:'#0A8217'},{s:'low',c:'#0A8217'},{s:'low',c:'#0A8217'},{s:'low',c:'#0A8217'}];
    var sizes={critical:12,high:10,medium:8,low:6};
    alerts.forEach(function(a,i){var x=20+i*((W*0.5-20)/alerts.length),y=H*0.35;var r=sizes[a.s];ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=a.c+'88';ctx.fill();ctx.strokeStyle=a.c;ctx.lineWidth=1.5;ctx.stroke();});
    // Connecting line
    ctx.beginPath();ctx.moveTo(20,H*0.35);ctx.lineTo(20+(alerts.length-1)*((W*0.5-20)/alerts.length),H*0.35);ctx.strokeStyle='#344054';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
    // AI sparkline on right
    var ai=[0.2,0.4,0.3,0.6,0.5,0.8,0.7,0.9,0.85,0.95];
    var ax=W*0.55,aw=W*0.42;
    var grad=ctx.createLinearGradient(0,20,0,H-20);grad.addColorStop(0,'#B8962E33');grad.addColorStop(1,'#B8962E05');
    ctx.beginPath();ai.forEach(function(v,i){var px=ax+(i/(ai.length-1))*aw,py=H-20-v*(H-40);if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);});
    ctx.lineTo(ax+aw,H-20);ctx.lineTo(ax,H-20);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
    ctx.beginPath();ai.forEach(function(v,i){var px=ax+(i/(ai.length-1))*aw,py=H-20-v*(H-40);if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);});
    ctx.strokeStyle='#B8962E';ctx.lineWidth=2;ctx.lineJoin='round';ctx.stroke();
    ctx.fillStyle='#e2e8f0';ctx.font='bold 9px Lato,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('Alert Severity Timeline + AI Query Trend',W/2,2);
    // Labels
    ctx.fillStyle='#94a3b8';ctx.font='7px Lato,sans-serif';ctx.textAlign='left';ctx.fillText('Alerts',8,H-8);ctx.textAlign='right';ctx.fillText('AI Queries',W-8,H-8);
  }
}


// В начало app.js добавьте:
const API_BASE_URL = window.location.origin;

class TimeTrackingAPI {
  static async getEmployees() {
    const response = await fetch(`${API_BASE_URL}/api/employees`);
    if (!response.ok) throw new Error('Ошибка загрузки сотрудников');
    return await response.json();
  }

  static async saveEmployees(employees) {
    const response = await fetch(`${API_BASE_URL}/api/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employees)
    });
    if (!response.ok) throw new Error('Ошибка сохранения сотрудников');
    return await response.json();
  }

  static async getTimeData() {
    const response = await fetch(`${API_BASE_URL}/api/time-data`);
    if (!response.ok) throw new Error('Ошибка загрузки данных времени');
    return await response.json();
  }

  static async saveTimeData(timeData) {
    const response = await fetch(`${API_BASE_URL}/api/time-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(timeData)
    });
    if (!response.ok) throw new Error('Ошибка сохранения данных времени');
    return await response.json();
  }
}

// Замените инициализацию данных в вашем коде:
async function loadInitialData() {
  try {
    // Загружаем данные с сервера
    employees = await TimeTrackingAPI.getEmployees();
    const timeData = await TimeTrackingAPI.getTimeData();
    
    // Инициализируем meta данные для каждого сотрудника
    for (let e0 = 0; e0 < employees.length; e0++) {
      ensureEmployeeMeta(employees[e0]);
    }
    
    // Объединяем с локальными данными
    state.plan = { ...state.plan, ...timeData.plan };
    state.fact = { ...state.fact, ...timeData.fact };
    
    // Проверяем наличие данных для текущего месяца
    ensureMonthData(cursor);
    
    render();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    showErr('Ошибка загрузки данных с сервера');
  }
}

// Обновите функцию сохранения при изменениях
function saveState() {
  try {
    // Сохраняем сотрудников
    TimeTrackingAPI.saveEmployees(employees);
    
    // Сохраняем данные времени
    TimeTrackingAPI.saveTimeData({
      plan: state.plan,
      fact: state.fact
    });
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    showErr('Ошибка сохранения на сервере');
  }
}

// Вызывайте saveState() после изменений:
// - После редактирования сотрудника
// - После изменения данных времени







(function(){
    'use strict';

    function $(id){
      var n = document.getElementById(id);
      if (!n) throw new Error('Missing element #' + id);
      return n;
    }

    var errBox = document.getElementById('errBox');
    var errText = document.getElementById('errText');
    function showErr(msg){
      try{
        if (!errBox || !errText) return;
        errText.textContent = String(msg || 'Unknown error');
        errBox.style.display = 'block';
      }catch(_){ }
    }

    window.addEventListener('error', function(e){
      var stack = '';
      try{ stack = (e && e.error && e.error.stack) ? ('\n' + e.error.stack) : ''; }catch(_){ stack=''; }
      showErr((e && e.message ? e.message : 'Error') + stack);
    });

    var contentEl = $('content');
    var viewTitleEl = $('viewTitle');
    var viewHintEl = $('viewHint');
    var navEl = $('nav');
    var modeSegEl = $('modeSeg');
    var empViewSegEl = $('empViewSeg');
    var prevBtn = $('prevBtn');
    var nextBtn = $('nextBtn');
    var periodLabelEl = $('periodLabel');
    var empMS = $('empMS');
    var empMSBtn = $('empMSBtn');
    var empMSPop = $('empMSPop');
    var periodSelect = $('periodSelect');
    var toggleWorkTimeBtn = $('toggleWorkTime');
    var toggleHighlightBtn = $('toggleHighlight');
    var toggleChronoBtn = $('toggleChrono');

    var empModal = $('empModal');
    var mFirst = $('mFirst');
    var mLast = $('mLast');
    var mRole = $('mRole');
    var mDays = $('mDays');
    var mFrom = $('mFrom');
    var mTo = $('mTo');
    var mHours = $('mHours');
    var mTg = $('mTg');
    var mEmail = $('mEmail');
    var mEmailMeaning = $('mEmailMeaning');
    var mPhone = $('mPhone');
    var mSocials = $('mSocials');
    var mInTeamYes = $('mInTeamYes');
    var mInTeamNo = $('mInTeamNo');
    var mHireDate = $('mHireDate');
    var mLinkYes = $('mLinkYes');
    var mLinkNo = $('mLinkNo');
    var mSave = $('mSave');
    var mCancel = $('mCancel');

    var mProject = $('mProject');
    var mDept = $('mDept');
    var mStatus = $('mStatus');
    // mStatus2 removed
    var mEmployment = $('mEmployment');
    var mInteraction = $('mInteraction');
    var mWorkFormat = $('mWorkFormat');
    var mPayoutType = $('mPayoutType');
    var mPayoutFreq = $('mPayoutFreq');
    var mCity = $('mCity');
    var mTz = $('mTz');

    function pad2(n){ return String(n).padStart(2,'0'); }

    function stableHash(str){
      var h = 2166136261;
      for (var i=0;i<str.length;i++){
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return (h >>> 0);
    }

    function seededRand(seed){
      var t = seed + 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    function weightedPick(seed, items){
      var sum = 0;
      for (var i=0;i<items.length;i++) sum += items[i].w;
      if (sum <= 0) return items[0] ? items[0].v : null;
      var r = seededRand(seed) * sum;
      var acc = 0;
      for (var j=0;j<items.length;j++){
        acc += items[j].w;
        if (r <= acc) return items[j].v;
      }
      return items[items.length-1].v;
    }

    var OPT = {
      projects: ['DP','Маркет','УК'],
      departments: ['Дизайн','СММ','Ивент','Управление'],
      status: ['В штате','Уволен','Временно не работает'],
      employment: ['Фултайм','Парттайм','Проект'],
      interaction: ['Инхаус','Аутсорс','Фриланс','Подряд'],
      workFormat: ['Удалёнка','Гибрид','Офис'],
      payoutType: ['Постоплата','Аванс'],
      payoutFreq: ['Два раза в месяц','Ежемесячно','Поквартально','По этапам','Раз в полгода'],
      city: ['Москва','Питер','Новосиб'],
      tz: ['МСК','+4'],
      emails: ['pm.designprosmot@mail.ru','fm.designprosmot@mail.ru','hr.designprosmot@mail.ru'],
      emailMeaning: {
        'pm.designprosmot@mail.ru':'Project Manager',
        'fm.designprosmot@mail.ru':'Finance Manager',
        'hr.designprosmot@mail.ru':'HR'
      },
      socials: ['Telegram','Instagram','ВКонтакте']
    };

    function fillSelect(sel, values){
      var html = [];
      for (var i=0;i<values.length;i++){
        var v = values[i];
        html.push('<option value="' + v + '">' + v + '</option>');
      }
      sel.innerHTML = html.join('');
    }

    fillSelect(mProject, OPT.projects);
    fillSelect(mDept, OPT.departments);
    fillSelect(mStatus, OPT.status);
    fillSelect(mEmployment, OPT.employment);
    fillSelect(mInteraction, OPT.interaction);
    fillSelect(mWorkFormat, OPT.workFormat);
    fillSelect(mPayoutType, OPT.payoutType);
    fillSelect(mPayoutFreq, OPT.payoutFreq);
    fillSelect(mCity, OPT.city);
    fillSelect(mTz, OPT.tz);
    fillSelect(mEmail, OPT.emails);

    function syncEmailMeaning(){
      var em = (mEmail && mEmail.value) ? mEmail.value : '';
      var meaning = (OPT.emailMeaning && OPT.emailMeaning[em]) ? OPT.emailMeaning[em] : '';
      if (mEmailMeaning) mEmailMeaning.value = meaning || '';
    }
    if (mEmail) mEmail.addEventListener('change', syncEmailMeaning);

    function inferDeptByRole(role){
      var r = (role || '').toLowerCase();
      if (r.indexOf('диз') >= 0) return 'Дизайн';
      if (r.indexOf('контент') >= 0 || r.indexOf('smm') >= 0) return 'СММ';
      if (r.indexOf('pm') >= 0 || r.indexOf('ивент') >= 0) return 'Ивент';
      if (r.indexOf('pr') >= 0 || r.indexOf('управ') >= 0) return 'Управление';
      if (r.indexOf('разраб') >= 0) return 'Управление';
      return 'Управление';
    }

    function ensureEmployeeMeta(e){
      if (!e.meta) e.meta = Object.create(null);
      var seed = stableHash(e.id || e.name || 'emp');

      if (!e.meta.project){
        e.meta.project = weightedPick(seed + 11, [
          {v:'DP', w:80},
          {v:'Маркет', w:10},
          {v:'УК', w:10}
        ]);
      }

      if (!e.meta.department){
        e.meta.department = inferDeptByRole(e.role);
      }

      if (!e.meta.status){
        e.meta.status = 'В штате';
      }

      if (!e.meta.employment){
        e.meta.employment = weightedPick(seed + 21, [
          {v:'Фултайм', w:80},
          {v:'Проект', w:10},
          {v:'Парттайм', w:10}
        ]);
      }

      if (!e.meta.interaction){
        e.meta.interaction = weightedPick(seed + 31, [
          {v:'Инхаус', w:75},
          {v:'Фриланс', w:20},
          {v:'Аутсорс', w:5},
          {v:'Подряд', w:0}
        ]);
      }

      if (!e.meta.workFormat){
        e.meta.workFormat = weightedPick(seed + 41, [
          {v:'Удалёнка', w:70},
          {v:'Гибрид', w:20},
          {v:'Офис', w:10}
        ]);
      }

      if (!e.meta.payoutType){
        e.meta.payoutType = weightedPick(seed + 51, [
          {v:'Постоплата', w:80},
          {v:'Аванс', w:20}
        ]);
      }

      if (!e.meta.payoutFreq){
        e.meta.payoutFreq = weightedPick(seed + 61, [
          {v:'Два раза в месяц', w:85},
          {v:'Ежемесячно', w:10},
          {v:'Поквартально', w:5},
          {v:'По этапам', w:5},
          {v:'Раз в полгода', w:5}
        ]);
      }

      if (!e.meta.city){
        e.meta.city = weightedPick(seed + 71, [
          {v:'Питер', w:50},
          {v:'Москва', w:40},
          {v:'Новосиб', w:10}
        ]);
      }

      if (!e.meta.tz){
        e.meta.tz = weightedPick(seed + 81, [
          {v:'МСК', w:95},
          {v:'+4', w:5}
        ]);
      }

      if (!e.meta.email){
        e.meta.email = weightedPick(seed + 91, [
          {v:'pm.designprosmot@mail.ru', w:34},
          {v:'fm.designprosmot@mail.ru', w:33},
          {v:'hr.designprosmot@mail.ru', w:33}
        ]);
      }

      if (!e.meta.emailMeaning){
        e.meta.emailMeaning = (OPT.emailMeaning && OPT.emailMeaning[e.meta.email]) ? OPT.emailMeaning[e.meta.email] : '';
      }

      if (!e.meta.phone){
        var a = 900 + Math.floor(seededRand(seed + 101) * 100);
        var b = Math.floor(seededRand(seed + 102) * 10000000);
        e.meta.phone = '+7 ' + a + ' ' + String(b).padStart(7,'0');
      }

      if (!e.meta.socials){
        var r1 = seededRand(seed + 111);
        var count = (r1 > 0.92) ? 3 : (r1 > 0.35) ? 2 : 1;
        var pool = OPT.socials.slice();
        var pick = [];
        for (var i=0;i<count;i++){
          var idx = Math.floor(seededRand(seed + 112 + i) * pool.length);
          pick.push(pool[idx]);
          pool.splice(idx, 1);
        }
        e.meta.socials = pick;
      }

      if (typeof e.meta.inTeam !== 'boolean'){
        e.meta.inTeam = seededRand(seed + 121) > 0.08;
      }

      if (!e.meta.hireDate){
        var nm = (e.name || '').toLowerCase();
        function mk(d, m, y){ return pad2(d) + '.' + pad2(m) + '.' + y; }
        if (nm.indexOf('мальцев александр') >= 0){
          e.meta.hireDate = mk(12, 3, 2012);
        } else if (nm.indexOf('великанов виктор') >= 0){
          e.meta.hireDate = mk(4, 3, 2012);
        } else if (nm.indexOf('семёнцов александр') >= 0 || nm.indexOf('семенцов александр') >= 0){
          e.meta.hireDate = mk(18, 6, 2013);
        } else {
          var yy = 2020 + Math.floor(seededRand(seed + 131) * 6);
          var mm = 1 + Math.floor(seededRand(seed + 132) * 12);
          var dd = 1 + Math.floor(seededRand(seed + 133) * 28);
          e.meta.hireDate = mk(dd, mm, yy);
        }
      }
    }

    var employees = [
      { id:'sem', name:'Семёнцов Александр', role:'дизайнер', days:['Пн','Вт','Ср','Чт','Пт'], from:'10:00', to:'18:00', hours:'8:00', tg:'safon', tgLinked:true },
      { id:'vel', name:'Великанов Виктор', role:'дизайнер', days:['Пн','Вт','Ср','Чт','Пт'], from:'10:00', to:'18:00', hours:'8:00', tg:'safon', tgLinked:true },
      { id:'mal', name:'Мальцев Александр', role:'дизайнер', days:['Пн','Вт','Ср','Чт','Пт'], from:'11:00', to:'19:00', hours:'8:00', tg:'', tgLinked:false },
      { id:'sha', name:'Шарапова Арина', role:'PM', days:['Пн','Вт','Ср','Чт','Пт'], from:'10:30', to:'18:30', hours:'8:00', tg:'', tgLinked:false },
      { id:'iod', name:'Иодис Татьяна', role:'контент', days:['Пн','Вт','Ср','Чт','Пт'], from:'10:00', to:'18:00', hours:'8:00', tg:'', tgLinked:false },
      { id:'pri', name:'Прилуцкий Богдан', role:'разработка', days:['Пн','Вт','Ср','Чт','Пт'], from:'10:00', to:'18:00', hours:'8:00', tg:'', tgLinked:false },
      { id:'saf', name:'Сафонов Александр', role:'дизайнер', days:['Пн','Вт','Ср','Чт','Пт'], from:'10:00', to:'18:00', hours:'8:00', tg:'safon', tgLinked:true },
      { id:'vol', name:'Волдаева Ольга', role:'контент', days:['Пн','Вт','Ср','Чт','Пт'], from:'10:00', to:'18:00', hours:'8:00', tg:'', tgLinked:false },
      { id:'zdr', name:'Здробилко Елизавета', role:'PR', days:['Пн','Вт','Ср','Чт','Пт'], from:'10:00', to:'18:00', hours:'8:00', tg:'', tgLinked:false },
      { id:'rub', name:'Рубцов Никита', role:'дизайнер', days:['Пн','Вт','Ср','Чт','Пт'], from:'10:00', to:'18:00', hours:'8:00', tg:'', tgLinked:false }
    ];

    for (var e0=0;e0<employees.length;e0++) ensureEmployeeMeta(employees[e0]);

    var TODAY = new Date(2026, 0, 15);
    TODAY.setHours(0,0,0,0);

    var cursor = new Date(2026, 0, 1);
    var view = 'table';
    var mode = 'mix';
    var showWorkTime = false;
    var highlightOn = false;
    var timeOrder = 'desc';

    var employeesView = 'cards';

    var allSelected = true;
    var selectedEmpIds = new Set();

    var state = { plan:Object.create(null), fact:Object.create(null) };
    var editingId = null;

    function keyOf(d){ return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate()); }
    function ruDate(d){ return pad2(d.getDate()) + '.' + pad2(d.getMonth()+1) + '.' + d.getFullYear(); }
    function fmtHM(m){
      if (m == null) return '—';
      var h = Math.floor(m/60);
      var mm = pad2(m%60);
      return h + ':' + mm;
    }
    function fmtDev(min){
      if (min == null) return 'N/A';
      var a = Math.abs(min);
      var h = Math.floor(a/60);
      var mm = pad2(a%60);
      if (min === 0) return h + ':' + mm;
      return (min > 0 ? '+' : '-') + h + ':' + mm;
    }

    function dateFromKey(k){
      var parts = k.split('-');
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }

    function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

    function isWeekend(d){
      var js = d.getDay();
      return js === 0 || js === 6;
    }

    function dowRu(d){
      var DOW = ['пн','вт','ср','чт','пт','сб','вс'];
      var js = d.getDay();
      return js === 0 ? 'вс' : DOW[js-1];
    }

    function monthRange(date){
      var start = new Date(date.getFullYear(), date.getMonth(), 1);
      var end = new Date(date.getFullYear(), date.getMonth()+1, 0);
      return { start:start, end:end };
    }

    function daysInRange(start, end){
      var out = [];
      var d = new Date(start);
      while (d <= end){
        out.push(new Date(d));
        d.setDate(d.getDate()+1);
      }
      return out;
    }

    function statusLabel(type){
      switch(type){
        case 'off': return 'выходной';
        case 'paid_off': return 'опл. выходной';
        case 'unpaid_off': return 'за свой счёт';
        case 'vac': return 'отпуск';
        case 'sick': return 'больничный';
        case 'special': return 'особый';
        case 'no_show': return 'неявка';
        case 'no_fact': return 'нет факта';
        default: return '';
      }
    }

    function statusShort(type){
      switch(type){
        case 'off': return 'вых';
        case 'paid_off': return 'вых';
        case 'unpaid_off': return 'вых';
        case 'vac': return 'отп';
        case 'sick': return 'бол';
        case 'no_show': return 'н/я';
        case 'no_fact': return 'нет';
        default: return '';
      }
    }

    var DAY_ORDER = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    function formatWorkDays(list){
      if (!list || !list.length) return '—';

      var set = Object.create(null);
      for (var i=0;i<list.length;i++){
        var d = list[i];
        if (DAY_ORDER.indexOf(d) >= 0) set[d] = true;
      }

      var arr = [];
      for (var j=0;j<DAY_ORDER.length;j++) if (set[DAY_ORDER[j]]) arr.push(DAY_ORDER[j]);
      if (!arr.length) return '—';

      var parts = [];
      var k = 0;
      while (k < arr.length){
        var start = k;
        var end = k;
        while (end + 1 < arr.length){
          var a = DAY_ORDER.indexOf(arr[end]);
          var b = DAY_ORDER.indexOf(arr[end + 1]);
          if (b === a + 1) end++;
          else break;
        }
        if (end > start) parts.push(arr[start] + '–' + arr[end]);
        else parts.push(arr[start]);
        k = end + 1;
      }

      return parts.join(', ');
    }

    function summaryLabel(){
      if (allSelected || selectedEmpIds.size === 0) return 'Все';
      if (selectedEmpIds.size === 1){
        var id = Array.from(selectedEmpIds)[0];
        for (var i=0;i<employees.length;i++) if (employees[i].id===id) return employees[i].name;
        return '1 выбран';
      }
      return selectedEmpIds.size + ' выбрано';
    }

    function getFilteredEmployees(){
      if (allSelected || selectedEmpIds.size === 0) return employees;
      var res = [];
      for (var i=0;i<employees.length;i++) if (selectedEmpIds.has(employees[i].id)) res.push(employees[i]);
      return res;
    }

    function startOfToday(){ return new Date(TODAY); }

    function isPlannedWorking(p){
      return !!p && (p.type === 'work' || p.type === 'special') && p.minutes != null;
    }

    function isReasonedNonWork(f){
      return !!f && (f.type === 'vac' || f.type === 'sick' || f.type === 'paid_off' || f.type === 'unpaid_off' || f.type === 'off');
    }

    function hasFactFilled(f){
      if (!f) return false;
      if (isReasonedNonWork(f)) return true;
      if (f.type === 'work') return f.minutes != null;
      return true;
    }

    function isNoShow(empId, dateKey){
      var day = dateFromKey(dateKey);
      var today = startOfToday();
      if (!(day < today)) return false;

      var p = state.plan[dateKey] && state.plan[dateKey][empId];
      var f = state.fact[dateKey] && state.fact[dateKey][empId];

      if (!isPlannedWorking(p)) return false;
      if (!f) return true;
      if (isReasonedNonWork(f)) return false;
      if (f.type === 'work' && f.minutes == null) return true;
      return false;
    }

    function isNoFact(empId, dateKey){
      var day = dateFromKey(dateKey);
      var today = startOfToday();
      if (!(day < today)) return false;

      var p = state.plan[dateKey] && state.plan[dateKey][empId];
      var f = state.fact[dateKey] && state.fact[dateKey][empId];

      if (!isPlannedWorking(p)) return false;

      if (f){
        if (isReasonedNonWork(f)) return false;
        if (f.type === 'work' && f.minutes != null) return false;
      }
      return true;
    }

    function ensureMonthData(date){
      var mr = monthRange(date);
      var days = daysInRange(mr.start, mr.end);

      var FACT_CUTOFF = new Date(2026, 0, 15);
      FACT_CUTOFF.setHours(0,0,0,0);

      for (var di=0; di<days.length; di++){
        var d = days[di];
        var k = keyOf(d);
        if (!state.plan[k]) state.plan[k] = Object.create(null);
        if (!state.fact[k]) state.fact[k] = Object.create(null);

        var afterCutoff = d > FACT_CUTOFF;

        for (var ei=0; ei<employees.length; ei++){
          var e = employees[ei];
          var weekend = isWeekend(d);

          var pType = weekend ? 'off' : 'work';
          var pMin = weekend ? null : 8*60;

          var dayN = d.getDate();
          if (!weekend){
            if ((e.id==='iod' && dayN>=9 && dayN<=13) || (e.id==='sha' && dayN>=16 && dayN<=18) || (e.id==='pri' && dayN>=23 && dayN<=24)){
              pType='vac'; pMin=null;
            }
            if (e.id==='zdr' && dayN===6){ pType='paid_off'; pMin=null; }
            if (e.id==='vol' && dayN===20){ pType='unpaid_off'; pMin=null; }
            if (e.id==='rub' && dayN===11){ pType='special'; pMin=6*60; }
          }

          state.plan[k][e.id] = { type:pType, minutes:pMin };

          if (afterCutoff){
            delete state.fact[k][e.id];
            continue;
          }

          var fType = pType;
          var fMin = pMin;
          var seed = Number(String(d.getFullYear()) + pad2(d.getMonth()+1) + pad2(d.getDate())) + ei*97;
          var r = seededRand(seed);

          if (pType==='work' || pType==='special'){
            if (r < 0.02){
              fType='sick'; fMin=null;
            } else {
              var base = (pType==='special') ? 6*60 : 8*60;
              var jitter = Math.round((seededRand(seed+17)-0.5)*180);
              fMin = clamp(base + jitter, 3*60, 14*60);
              fType='work';
              if (seededRand(seed+99) > 0.992) fMin = clamp(base + 8*60, 0, 18*60);
              if (seededRand(seed+7) < 0.015) { fMin=null; fType='work'; }
            }
          } else {
            if (pType==='off' && seededRand(seed+33) > 0.94){
              fType='work';
              fMin = clamp(2*60 + Math.round(seededRand(seed+55)*6*60), 60, 9*60);
            } else {
              fMin=null;
            }
          }

          if (pType==='vac' || pType==='paid_off' || pType==='unpaid_off'){
            fType=pType; fMin=null;
          }

          state.fact[k][e.id] = { type:fType, minutes:fMin };
        }
      }
    }

    function getPlanCell(empId, dateKey){
      var p = state.plan[dateKey] && state.plan[dateKey][empId];
      if (!p) return { text:'—', type:'none', minutes:null };
      if (p.type==='work' || p.type==='special') return { text:fmtHM(p.minutes), type:p.type, minutes:p.minutes };
      return { text:statusLabel(p.type) || '—', type:p.type, minutes:null };
    }

    function getFactCell(empId, dateKey){
      if (isNoShow(empId, dateKey)) return { text:'неявка', type:'no_show', minutes:null };
      if (isNoFact(empId, dateKey)) return { text:'нет факта', type:'no_fact', minutes:null };
      var f = state.fact[dateKey] && state.fact[dateKey][empId];
      if (!f) return { text:'—', type:'none', minutes:null };
      if (f.type==='work'){
        if (f.minutes == null) return { text:'—', type:'none', minutes:null };
        return { text:fmtHM(f.minutes), type:'work', minutes:f.minutes };
      }
      return { text:statusLabel(f.type) || '—', type:f.type, minutes:null };
    }

    function getMixCell(empId, dateKey){
      if (isNoShow(empId, dateKey)) return { text:'неявка', type:'no_show', minutes:null };
      var f = state.fact[dateKey] && state.fact[dateKey][empId];
      if (hasFactFilled(f)) return getFactCell(empId, dateKey);
      return getPlanCell(empId, dateKey);
    }

    function getDevCell(empId, dateKey){
      var p = state.plan[dateKey] && state.plan[dateKey][empId];
      var f = state.fact[dateKey] && state.fact[dateKey][empId];
      if (!p) return { planText:'—', planType:'none', devText:'N/A', devMinutes:null };

      var day = dateFromKey(dateKey);
      var today = startOfToday();
      var dayClosed = day < today;

      if (!(p.type==='work' || p.type==='special')){
        return { planText: statusShort(p.type) || '—', planType:p.type, devText:'N/A', devMinutes:null };
      }

      var planMin = (p.minutes == null) ? 0 : p.minutes;

      if (!hasFactFilled(f)){
        if (dayClosed && isNoShow(empId, dateKey)){
          var devNS = 0 - planMin;
          return { planText:fmtHM(planMin), planType:'work', devText:fmtDev(devNS), devMinutes:devNS };
        }
        return { planText:fmtHM(planMin), planType:'work', devText:'N/A', devMinutes:null };
      }

      var factMin = (f && f.type==='work' && f.minutes != null) ? f.minutes : 0;
      var dev = factMin - planMin;
      return { planText:fmtHM(planMin), planType:'work', devText:fmtDev(dev), devMinutes:dev };
    }

    function setEmpMSOpen(open){
      empMS.classList.toggle('open', !!open);
      empMSBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function renderEmployeeMS(){
      empMSBtn.textContent = summaryLabel();
      var rows = [];

      rows.push(
        '<div class="ms-item" data-id="__all">' +
          '<div class="ms-check ' + (allSelected ? '' : 'off') + '">✓</div>' +
          '<div>Все</div>' +
        '</div>'
      );
      rows.push('<div class="ms-sep"></div>');

      for (var i=0;i<employees.length;i++){
        var e = employees[i];
        var on = (!allSelected && selectedEmpIds.has(e.id));
        rows.push(
          '<div class="ms-item" data-id="' + e.id + '">' +
            '<div class="ms-check ' + (on ? '' : 'off') + '">✓</div>' +
            '<div>' + e.name + '</div>' +
          '</div>'
        );
      }

      empMSPop.innerHTML = rows.join('');
    }

    function setChronoBtn(){
      toggleChronoBtn.textContent = (timeOrder === 'desc') ? 'Хронология ↑' : 'Хронология ↓';
      toggleChronoBtn.classList.toggle('active', timeOrder === 'asc');
    }

    function setPeriodLabel(){
      if (periodSelect.value === 'month'){
        var mr = monthRange(cursor);
        periodLabelEl.textContent = pad2(mr.start.getDate()) + '.' + pad2(mr.start.getMonth()+1) + ' - ' + pad2(mr.end.getDate()) + '.' + pad2(mr.end.getMonth()+1);
      } else {
        var days = getPeriodDays();
        var a = days[0];
        var b = days[days.length-1];
        periodLabelEl.textContent = pad2(a.getDate()) + '.' + pad2(a.getMonth()+1) + ' - ' + pad2(b.getDate()) + '.' + pad2(b.getMonth()+1);
      }
    }

    function getPeriodDays(){
      var mr = monthRange(cursor);
      var all = daysInRange(mr.start, mr.end);

      if (periodSelect.value === 'week'){
        var endW = new Date(cursor.getFullYear(), cursor.getMonth(), Math.min(7, mr.end.getDate()));
        var startW = new Date(endW);
        startW.setDate(endW.getDate()-6);
        return daysInRange(startW, endW);
      }
      return all;
    }

    function setActiveNav(){
      var btns = navEl.querySelectorAll('button[data-view]');
      for (var i=0;i<btns.length;i++) btns[i].classList.toggle('active', btns[i].dataset.view === view);
    }

    function setActiveSeg(){
      var btns = modeSegEl.querySelectorAll('button[data-mode]');
      for (var i=0;i<btns.length;i++) btns[i].classList.toggle('active', btns[i].dataset.mode === mode);
    }

    function setActiveEmpView(){
      var btns = empViewSegEl.querySelectorAll('button[data-empview]');
      for (var i=0;i<btns.length;i++) btns[i].classList.toggle('active', btns[i].dataset.empview === employeesView);
    }

    function renderTable(){
      var days = getPeriodDays().slice();
      if (timeOrder === 'desc') days.reverse();
      var isDev = (mode === 'dev');
      var html = [];

      html.push('<div class="table-wrap"><table>');
      html.push('<colgroup><col class="col-date">');
      for (var i=0;i<employees.length;i++) html.push('<col class="col-emp">');
      html.push('</colgroup>');

      html.push('<thead><tr>');
      html.push('<th class="sticky">Дата</th>');
      for (var ei=0; ei<employees.length; ei++){
        var e = employees[ei];
        var out = (!allSelected && selectedEmpIds.size>0 && !selectedEmpIds.has(e.id));
        html.push('<th class="' + (out ? 'filtered-out' : '') + '"><div class="head-name">' + e.name + '<span>' + e.role + '</span></div></th>');
      }
      html.push('</tr></thead>');

      html.push('<tbody>');
      for (var di=0; di<days.length; di++){
        var d = days[di];
        var k = keyOf(d);
        html.push('<tr>');
        html.push('<td class="sticky"><div>' + ruDate(d) + '</div><div class="date">' + dowRu(d) + '</div></td>');

        for (var ej=0; ej<employees.length; ej++){
          var emp = employees[ej];
          var hide = (!allSelected && selectedEmpIds.size>0 && !selectedEmpIds.has(emp.id));
          var outCls = hide ? 'filtered-out' : '';

          if (!isDev){
            var cell;
            if (mode === 'fact') cell = getFactCell(emp.id, k);
            else if (mode === 'plan') cell = getPlanCell(emp.id, k);
            else if (mode === 'mix') cell = getMixCell(emp.id, k);
            else cell = { text:'—', type:'none', minutes:null };

            var planMuted = false;
            if (mode === 'plan'){
              planMuted = true;
            } else if (mode === 'mix'){
              var fMix = state.fact[k] && state.fact[k][emp.id];
              if (!isNoShow(emp.id, k) && !hasFactFilled(fMix)) planMuted = true;
            }

            var hl = '';
            if (highlightOn && view === 'table' && (mode === 'fact' || mode === 'mix')){
              var p0 = state.plan[k] && state.plan[k][emp.id];
              var plannedWork = p0 && (p0.type==='work' || p0.type==='special') && p0.minutes != null;
              if (plannedWork){
                if (cell.type === 'no_show'){
                  hl = 'hl-bad';
                } else if (cell.type === 'no_fact'){
                  hl = 'hl-gray';
                } else if (cell.type === 'work' && cell.minutes != null){
                  var devMin = cell.minutes - p0.minutes;
                  var a = Math.abs(devMin);
                  if (a > 240) hl = 'hl-bad';
                  else if (a > 120) hl = 'hl-warn';
                }
              }
            }

            html.push('<td class="t ' + outCls + (planMuted ? ' plan-gray' : '') + (hl ? (' ' + hl) : '') + '">' + cell.text + '</td>');
          } else {
            var dv = getDevCell(emp.id, k);
            var devClass = 'devNA';
            if (dv.devMinutes != null){
              if (dv.devMinutes > 0) devClass = 'devPos';
              else if (dv.devMinutes < 0) devClass = 'devNeg';
              else devClass = 'devZero';
            }

            html.push(
              '<td class="t ' + outCls + '">' +
                '<div class="devCell">' +
                  '<span class="devPlan">' + dv.planText + '</span>' +
                  '<span class="' + devClass + '">' + dv.devText + '</span>' +
                '</div>' +
              '</td>'
            );
          }
        }

        html.push('</tr>');
      }
      html.push('</tbody></table></div>');

      contentEl.innerHTML = html.join('');
    }

    function dotClassForStatus(type){
      if (type === 'off' || type == null) return null;
      if (type === 'paid_off') return 'dot-paidoff';
      if (type === 'unpaid_off') return 'dot-offpay';
      if (type === 'vac') return 'dot-vac';
      if (type === 'sick') return 'dot-sick';
      if (type === 'no_fact') return 'dot-nofact';
      if (type === 'no_show') return 'dot-noshow';
      if (type === 'work' || type === 'special') return 'dot-work';
      return null;
    }

    function renderCalendar(){
      var mr = monthRange(cursor);
      var start = mr.start;
      var end = mr.end;

      var first = new Date(start);
      var js = first.getDay();
      var offset = (js === 0) ? 6 : js-1;
      first.setDate(first.getDate() - offset);

      var last = new Date(end);
      var js2 = last.getDay();
      var offset2 = (js2 === 0) ? 0 : 7-js2;
      last.setDate(last.getDate() + offset2);

      var baseDays = daysInRange(first, last);
      var weeksCount = Math.floor(baseDays.length / 7);
      var empList = getFilteredEmployees();

      var html = [];
      html.push('<div class="cal-grid">');
      html.push('<div class="dow">');
      var dows = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
      for (var i=0;i<dows.length;i++) html.push('<div>' + dows[i] + '</div>');
      html.push('</div>');

      html.push('<div class="days">');
      for (var di=0; di<baseDays.length; di++){
        var idx = di;
        if (timeOrder === 'desc'){
          var w = Math.floor(di / 7);
          var j = di % 7;
          idx = (weeksCount - 1 - w) * 7 + j;
        }

        var d = baseDays[idx];
        var k = keyOf(d);

        var dayStart = new Date(d); dayStart.setHours(0,0,0,0);
        var isPast = dayStart < TODAY;

        html.push('<div class="day">');
        html.push('<div class="num">' + d.getDate() + '</div>');
        html.push('<div class="dots">');

        for (var ei=0; ei<empList.length; ei++){
          var emp = empList[ei];
          var p = state.plan[k] && state.plan[k][emp.id];
          var f = state.fact[k] && state.fact[k][emp.id];

          var source = mode;
          if (mode === 'dev') source = 'fact';
          if (mode === 'mix'){
            var factFilled = hasFactFilled(f);
            if (isPast) source = (isNoShow(emp.id, k) || factFilled) ? 'fact' : 'plan';
            else source = 'plan';
          }

          var st = null;
          var minutes = null;
          var muted = false;

          if (source === 'fact'){
            if (isNoShow(emp.id, k)){
              st = 'no_show';
            } else if (isNoFact(emp.id, k)){
              st = 'no_fact';
            } else if (f){
              st = f.type;
              if (showWorkTime && f.type === 'work' && f.minutes != null) minutes = f.minutes;
            }
          } else {
            if (p){
              st = p.type;
              muted = true;
            }
          }

          var clsDot = dotClassForStatus(st);
          if (!clsDot) continue;

          var parts = emp.name.split(' ');
          var initials = ((parts[0] && parts[0][0]) ? parts[0][0] : '') + ((parts[1] && parts[1][0]) ? parts[1][0] : '');
          initials = initials.toUpperCase();

          var planCls = muted ? ' dot-plan' : '';

          var timeCls = '';
          if (highlightOn && (mode === 'fact' || mode === 'mix') && source === 'fact' && minutes != null){
            var plannedWork = p && (p.type==='work' || p.type==='special') && p.minutes != null;
            if (plannedWork){
              var devMin = minutes - p.minutes;
              var a = Math.abs(devMin);
              if (a > 240) timeCls = ' hl-bad';
              else if (a > 120) timeCls = ' hl-warn';
            }
          }

          if (minutes != null){
            html.push(
              '<span class="dot ' + clsDot + planCls + ' wide" title="' + emp.name + '">' +
                initials + '<span class="time' + timeCls + '">' + fmtHM(minutes) + '</span>' +
              '</span>'
            );
          } else {
            html.push('<span class="dot ' + clsDot + planCls + '" title="' + emp.name + '">' + initials + '</span>');
          }
        }

        html.push('</div>');
        html.push('</div>');
      }
      html.push('</div></div>');

      contentEl.innerHTML = html.join('');
    }

    function renderEmployees(){
      if (employeesView === 'table') renderEmployeesTable();
      else renderEmployeesCards();
    }

    function renderEmployeesCards(){
      var html = [];
      html.push('<div class="emp-grid" id="empGrid">');

      for (var i=0;i<employees.length;i++){
        var e = employees[i];
        ensureEmployeeMeta(e);

        var days = formatWorkDays(e.days);
        var hours = (e.hours || '—').replace(':00','') + ' часов';
        var range = (e.from && e.to) ? ('с ' + e.from + ' до ' + e.to) : 'с N/A до N/A';
        var tg = e.tg ? ('tg: ' + e.tg) : 'tg: —';

        var meta = (e.meta.project || '—') + ' • ' + (e.meta.department || '—');

        html.push(
          '<div class="emp-card" data-emp="' + e.id + '">' +
            '<div class="name">' + e.name + '</div>' +
            '<div class="role">' + e.role + '</div>' +
            '<div class="meta">' + meta + '</div>' +
            '<div class="days">' + days + '</div>' +
            '<div class="hours">' +
              '<div class="h">' + hours + '</div>' +
              '<div class="r">' + range + '</div>' +
            '</div>' +
            '<div class="tg"><span class="linkdot">⛓</span><span>' + tg + '</span></div>' +
          '</div>'
        );
      }

      html.push(
        '<div class="emp-add" data-add="1">' +
          '<div class="plus">+</div>' +
          '<div>Добавить сотрудника</div>' +
        '</div>'
      );

      html.push('</div>');
      contentEl.innerHTML = html.join('');
    }

    function renderEmployeesTable(){
      var html = [];
      html.push('<div class="emp-table" id="empTable">');
      html.push(
        '<div class="row head">' +
          '<div class="cell">Сотрудник</div>' +
          '<div class="cell">Должность</div>' +
          '<div class="cell">Проект</div>' +
          '<div class="cell">Отдел</div>' +
          '<div class="cell">Статус</div>' +
          '<div class="cell">Занятость</div>' +
          '<div class="cell">Взаимодействие</div>' +
          '<div class="cell">Формат</div>' +
          '<div class="cell">Тип выплат</div>' +
          '<div class="cell">Частота выплат</div>' +
          '<div class="cell">Город</div>' +
          '<div class="cell">ЧП</div>' +
          '<div class="cell">Дни</div>' +
          '<div class="cell">Часов/день</div>' +
          '<div class="cell">График</div>' +
          '<div class="cell">Telegram</div>' +
          '<div class="cell">Почта</div>' +
          '<div class="cell">Телефон</div>' +
          '<div class="cell">Соцсети</div>' +
          '<div class="cell">В команде</div>' +
          '<div class="cell">Дата найма</div>' +
          '<div class="cell">Значение почты</div>' +
        '</div>'
      );

      for (var i=0;i<employees.length;i++){
        var e = employees[i];
        ensureEmployeeMeta(e);

        var days = formatWorkDays(e.days);
        var hours = (e.hours || '—');
        var range = (e.from && e.to) ? (e.from + '–' + e.to) : '—';
        var tg = e.tg ? e.tg : '—';

        html.push(
          '<div class="row item" data-emp="' + e.id + '">' +
            '<div class="cell">' + e.name + '</div>' +
            '<div class="cell mut">' + e.role + '</div>' +
            '<div class="cell subtle">' + (e.meta.project || '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.department || '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.status || '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.employment || '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.interaction || '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.workFormat || '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.payoutType || '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.payoutFreq || '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.city || '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.tz || '—') + '</div>' +
            '<div class="cell num">' + days + '</div>' +
            '<div class="cell num">' + hours + '</div>' +
            '<div class="cell num">' + range + '</div>' +
            '<div class="cell">' + tg + '</div>' +
            '<div class="cell subtle">' + (e.meta.email || '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.phone || '—') + '</div>' +
            '<div class="cell subtle">' + ((e.meta.socials && e.meta.socials.length) ? e.meta.socials.join(', ') : '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.inTeam ? 'да' : 'нет') + '</div>' +
            '<div class="cell subtle">' + (e.meta.hireDate || '—') + '</div>' +
            '<div class="cell subtle">' + (e.meta.emailMeaning || '—') + '</div>' +
          '</div>'
        );
      }

      html.push(
        '<div class="row add" data-add="1">' +
          '<div class="cell">+ Добавить сотрудника</div>' +
        '</div>'
      );

      html.push('</div>');
      contentEl.innerHTML = html.join('');
    }

    function renderAnalytics(){
      var days = getPeriodDays().slice();
      if (timeOrder === 'desc') days.reverse();
      var filtered = getFilteredEmployees();
      var empMode = (allSelected || selectedEmpIds.size===0) ? 'all' : (selectedEmpIds.size===1 ? 'one' : 'many');
      var oneId = (empMode==='one') ? Array.from(selectedEmpIds)[0] : null;

      var series = [];
      for (var di=0; di<days.length; di++){
        var d = days[di];
        var k = keyOf(d);
        var plan=0, fact=0, mix=0;

        if (empMode==='all' || empMode==='many'){
          var list = (empMode==='all') ? employees : filtered;
          for (var ei=0; ei<list.length; ei++){
            var emp = list[ei];
            var p = state.plan[k] && state.plan[k][emp.id];
            var f = state.fact[k] && state.fact[k][emp.id];

            if (p && (p.type==='work' || p.type==='special') && p.minutes != null) plan += p.minutes;
            if (f && f.type==='work' && f.minutes != null) fact += f.minutes;

            if (isNoShow(emp.id, k)){
            } else if (hasFactFilled(f)){
              if (f && f.type==='work' && f.minutes != null) mix += f.minutes;
            } else {
              if (p && (p.type==='work' || p.type==='special') && p.minutes != null) mix += p.minutes;
            }
          }
        } else {
          var p1 = state.plan[k] && state.plan[k][oneId];
          var f1 = state.fact[k] && state.fact[k][oneId];

          if (p1 && (p1.type==='work' || p1.type==='special') && p1.minutes != null) plan = p1.minutes;
          if (f1 && f1.type==='work' && f1.minutes != null) fact = f1.minutes;

          if (isNoShow(oneId, k)){
            mix = 0;
          } else if (hasFactFilled(f1)){
            mix = (f1 && f1.type==='work' && f1.minutes != null) ? f1.minutes : 0;
          } else {
            mix = (p1 && (p1.type==='work' || p1.type==='special') && p1.minutes != null) ? p1.minutes : 0;
          }
        }

        series.push({ d:d, plan:plan, fact:fact, mix:mix, dev:(fact-plan) });
      }

      var max = 1;
      for (var i=0;i<series.length;i++){
        var v = (mode==='plan') ? series[i].plan : (mode==='fact') ? series[i].fact : (mode==='mix') ? series[i].mix : Math.abs(series[i].dev);
        if (v > max) max = v;
      }

      var totalPlan=0, totalFact=0, totalMix=0;
      for (var j=0;j<series.length;j++){ totalPlan += series[j].plan; totalFact += series[j].fact; totalMix += series[j].mix; }

      var label = 'Все';
      if (!(allSelected || selectedEmpIds.size===0)){
        if (selectedEmpIds.size===1){
          var id = Array.from(selectedEmpIds)[0];
          for (var z=0;z<employees.length;z++) if (employees[z].id===id) label = employees[z].name;
        } else {
          label = filtered.length + ' человек';
        }
      }

      var html = [];
      html.push('<div class="grid2">');
      html.push('<div class="card">');
      html.push('<h3>' + label + ' • часы по дням</h3>');
      html.push('<div class="bars">');
      for (var bi=0; bi<series.length; bi++){
        var s = series[bi];
        var val = (mode==='plan') ? s.plan : (mode==='fact') ? s.fact : (mode==='mix') ? s.mix : Math.abs(s.dev);
        var h = Math.round((val/max)*100);
        var tip = (mode==='dev') ? fmtDev(s.dev) : fmtHM(val);
        html.push('<div class="bar" title="' + ruDate(s.d) + ' • ' + tip + '"><div class="fill" style="height:' + h + '%;"></div></div>');
      }
      html.push('</div>');

      html.push('<div class="kpi">');
      html.push('<div class="box"><span>План</span><b>' + fmtHM(totalPlan) + '</b></div>');
      html.push('<div class="box"><span>Факт</span><b>' + fmtHM(totalFact) + '</b></div>');
      html.push('<div class="box"><span>План/факт</span><b>' + fmtHM(totalMix) + '</b></div>');
      html.push('</div>');

      html.push('</div>');
      html.push('<div class="card">');
      html.push('<h3>Правила (демо)</h3>');
      html.push('<div style="font-size:12px; color:var(--mut); line-height:1.6; font-weight:900;">');
      html.push('<div>• В календаре не показываем обычный выходной.</div>');
      html.push('<div>• Красный кружок = выходной за свой счёт.</div>');
      html.push('<div>• Розовый кружок = согласованный/оплачиваемый выходной.</div>');
      html.push('<div>• Ярко-красный кружок = неявка.</div>');
      html.push('<div>• Серый кружок = нет факта (только прошедшие дни).</div>');
      html.push('<div>• В будущих днях вместо факта — прочерк (без статуса).</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');

      contentEl.innerHTML = html.join('');
    }

    function setLinkButtons(yes){
      mLinkYes.classList.toggle('active', !!yes);
      mLinkNo.classList.toggle('active', !yes);
    }

    function setInTeamButtons(yes){
      mInTeamYes.classList.toggle('active', !!yes);
      mInTeamNo.classList.toggle('active', !yes);
    }

    function buildSocialButtons(){
      var html = [];
      for (var i=0;i<OPT.socials.length;i++){
        html.push('<button type="button" class="daybtn" data-social="' + OPT.socials[i] + '">' + OPT.socials[i] + '</button>');
      }
      mSocials.innerHTML = html.join('');
    }

    function buildDayButtons(){
      var all = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
      var html = [];
      for (var i=0;i<all.length;i++) html.push('<button type="button" class="daybtn" data-day="' + all[i] + '">' + all[i] + '</button>');
      mDays.innerHTML = html.join('');
    }

    function openModal(empId){
      editingId = empId;
      buildDayButtons();
      buildSocialButtons();

      var emp = null;
      for (var i=0;i<employees.length;i++) if (employees[i].id===empId) emp = employees[i];

      if (!emp){
        mFirst.value=''; mLast.value=''; mRole.value='';
        mFrom.value=''; mTo.value=''; mHours.value=''; mTg.value='';
        setLinkButtons(true);

        mProject.value = 'DP';
        mDept.value = 'Управление';
        mStatus.value = 'В штате';
                mEmployment.value = 'Фултайм';
        mInteraction.value = 'Инхаус';
        mWorkFormat.value = 'Удалёнка';
        mPayoutType.value = 'Постоплата';
        mPayoutFreq.value = 'Два раза в месяц';
        mCity.value = 'Москва';
        mTz.value = 'МСК';

        empModal.hidden = false;
        return;
      }

      ensureEmployeeMeta(emp);

      var parts = emp.name.split(' ');
      mFirst.value = parts[0] || '';
      mLast.value = parts.slice(1).join(' ') || '';
      mRole.value = emp.role || '';
      mFrom.value = emp.from || '';
      mTo.value = emp.to || '';
      mHours.value = emp.hours || '';
      mTg.value = emp.tg || '';
      setLinkButtons(!!emp.tgLinked);

      mProject.value = emp.meta.project || 'DP';
      mDept.value = emp.meta.department || 'Управление';
      mStatus.value = emp.meta.status || 'В штате';
      mStatus2.value = emp.meta.status2 || 'Активен';
      mEmployment.value = emp.meta.employment || 'Фултайм';
      mInteraction.value = emp.meta.interaction || 'Инхаус';
      mWorkFormat.value = emp.meta.workFormat || 'Удалёнка';
      mPayoutType.value = emp.meta.payoutType || 'Постоплата';
      mPayoutFreq.value = emp.meta.payoutFreq || 'Два раза в месяц';
      mCity.value = emp.meta.city || 'Москва';
      mTz.value = emp.meta.tz || 'МСК';

      var set = new Set(emp.days || []);
      var btns = mDays.querySelectorAll('.daybtn');
      for (var b=0;b<btns.length;b++) btns[b].classList.toggle('on', set.has(btns[b].dataset.day));

      empModal.hidden = false;
    }

    function closeModal(){
      empModal.hidden = true;
      editingId = null;
    }

    function render(){
      setChronoBtn();
      setPeriodLabel();

      if (view === 'calendar' && mode === 'dev') mode = 'fact';

      toggleWorkTimeBtn.style.display = (view === 'calendar') ? '' : 'none';
      toggleWorkTimeBtn.classList.toggle('active', !!showWorkTime);

      var showH = (view === 'table' || view === 'calendar') && (mode === 'fact' || mode === 'mix');
      toggleHighlightBtn.style.display = showH ? '' : 'none';
      toggleHighlightBtn.classList.toggle('active', !!highlightOn);

      empViewSegEl.style.display = (view === 'employees') ? '' : 'none';
      setActiveEmpView();

      modeSegEl.style.display = (view === 'employees') ? 'none' : '';

      var isTimeViews = (view === 'table' || view === 'calendar' || view === 'analytics');
      prevBtn.style.display = isTimeViews ? '' : 'none';
      nextBtn.style.display = isTimeViews ? '' : 'none';
      periodLabelEl.style.display = isTimeViews ? '' : 'none';
      periodSelect.style.display = isTimeViews ? '' : 'none';
      empMS.style.display = isTimeViews ? '' : 'none';
      toggleChronoBtn.style.display = isTimeViews ? '' : 'none';

      ensureMonthData(cursor);
      setActiveNav();
      setActiveSeg();
      renderEmployeeMS();

      var monthLabel = cursor.toLocaleString('ru-RU', { month:'long', year:'numeric' });
      monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
      var who = summaryLabel();
      var modeLabel = (mode==='mix') ? 'план/факт' : (mode==='fact') ? 'факт' : (mode==='plan') ? 'план' : 'отклонение';

      if (view === 'table'){
        viewTitleEl.textContent = 'Таблица';
        viewHintEl.textContent = monthLabel + ' • ' + who + ' • ' + modeLabel;
        renderTable();
        return;
      }

      if (view === 'calendar'){
        viewTitleEl.textContent = 'Календарь';
        viewHintEl.textContent = monthLabel + ' • ' + who + ' • ' + modeLabel;
        renderCalendar();
        return;
      }

      if (view === 'analytics'){
        viewTitleEl.textContent = 'Аналитика';
        viewHintEl.textContent = monthLabel + ' • ' + who + ' • ' + modeLabel;
        renderAnalytics();
        return;
      }

      if (view === 'employees'){
        viewTitleEl.textContent = 'Условия';
        viewHintEl.textContent = 'Карточки сотрудников • настройки и редактирование';
        renderEmployees();
        return;
      }

      if (view === 'deviations'){
        viewTitleEl.textContent = 'Отклонения по периодам';
        viewHintEl.textContent = 'Пустая страница (ТЗ будет позже)';
        contentEl.innerHTML = '<div class="card"><h3>Отклонения по периодам</h3><div style="font-size:12px;color:var(--mut);line-height:1.6;font-weight:900;">Пусто. ТЗ будет позже.</div></div>';
        return;
      }

      if (view === 'settings-statuses'){
        viewTitleEl.textContent = 'Настройки';
        viewHintEl.textContent = 'Статусы • пустая страница (ТЗ будет позже)';
        contentEl.innerHTML = '<div class="card"><h3>Статусы</h3><div style="font-size:12px;color:var(--mut);line-height:1.6;font-weight:900;">Пусто. ТЗ будет позже.</div></div>';
        return;
      }

      if (view === 'settings-colors'){
        viewTitleEl.textContent = 'Настройки';
        viewHintEl.textContent = 'Цвет в таблице • пустая страница (ТЗ будет позже)';
        contentEl.innerHTML = '<div class="card"><h3>Цвет в таблице</h3><div style="font-size:12px;color:var(--mut);line-height:1.6;font-weight:900;">Пусто. ТЗ будет позже.</div></div>';
        return;
      }

      if (view === 'settings-highlight'){
        viewTitleEl.textContent = 'Настройки';
        viewHintEl.textContent = 'Условия для подсветки • пустая страница (ТЗ будет позже)';
        contentEl.innerHTML = '<div class="card"><h3>Условия для подсветки</h3><div style="font-size:12px;color:var(--mut);line-height:1.6;font-weight:900;">Пусто. ТЗ будет позже.</div></div>';
        return;
      }

      if (view === 'team-contacts'){
        viewTitleEl.textContent = 'Команда';
        viewHintEl.textContent = 'Контакты • пустая страница (ТЗ будет позже)';
        contentEl.innerHTML = '<div class="card"><h3>Контакты</h3><div style="font-size:12px;color:var(--mut);line-height:1.6;font-weight:900;">Пусто. ТЗ будет позже.</div></div>';
        return;
      }

      viewTitleEl.textContent = '—';
      viewHintEl.textContent = '';
      contentEl.innerHTML = '<div class="card"><h3>Неизвестный экран</h3></div>';
    }

    function bindEvents(){
      navEl.addEventListener('click', function(e){
        var b = e.target.closest('button[data-view]');
        if (!b) return;
        view = b.dataset.view;
        render();
      });

      modeSegEl.addEventListener('click', function(e){
        var b = e.target.closest('button[data-mode]');
        if (!b) return;
        var m = b.dataset.mode;
        if (view === 'calendar' && m === 'dev') return;
        mode = m;
        render();
      });

      empViewSegEl.addEventListener('click', function(e){
        var b = e.target.closest('button[data-empview]');
        if (!b) return;
        employeesView = b.dataset.empview;
        render();
      });

      prevBtn.addEventListener('click', function(){ cursor = new Date(cursor.getFullYear(), cursor.getMonth()-1, 1); render(); });
      nextBtn.addEventListener('click', function(){ cursor = new Date(cursor.getFullYear(), cursor.getMonth()+1, 1); render(); });
      periodSelect.addEventListener('change', function(){ render(); });

      toggleWorkTimeBtn.addEventListener('click', function(){ showWorkTime = !showWorkTime; render(); });
      toggleHighlightBtn.addEventListener('click', function(){ highlightOn = !highlightOn; render(); });

      toggleChronoBtn.addEventListener('click', function(){
        timeOrder = (timeOrder === 'desc') ? 'asc' : 'desc';
        render();
      });

      empMSBtn.addEventListener('click', function(){ setEmpMSOpen(!empMS.classList.contains('open')); });

      empMSPop.addEventListener('click', function(ev){
        var item = ev.target.closest('.ms-item');
        if (!item) return;
        var id = item.getAttribute('data-id');

        if (id === '__all'){
          allSelected = true;
          selectedEmpIds.clear();
          render();
          return;
        }

        allSelected = false;
        if (selectedEmpIds.has(id)) selectedEmpIds.delete(id);
        else selectedEmpIds.add(id);

        if (selectedEmpIds.size === 0) allSelected = true;
        render();
      });

      document.addEventListener('click', function(e){
        if (!empMS.contains(e.target)) setEmpMSOpen(false);
      });

      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape'){
          setEmpMSOpen(false);
          if (!empModal.hidden) closeModal();
        }
        if (!(e.metaKey || e.ctrlKey)) return;
        if (e.key === '1'){ view='calendar'; render(); }
        if (e.key === '2'){ view='table'; render(); }
        if (e.key === '3'){ view='analytics'; render(); }
      });

      contentEl.addEventListener('click', function(e){
        var card = e.target.closest('.emp-card');
        if (card && view === 'employees'){
          openModal(card.getAttribute('data-emp'));
          return;
        }
        var add = e.target.closest('.emp-add');
        if (add && view === 'employees'){
          openModal('__new');
          return;
        }

        var row = e.target.closest('.emp-table .row.item');
        if (row && view === 'employees'){
          openModal(row.getAttribute('data-emp'));
          return;
        }
        var addRow = e.target.closest('.emp-table .row.add');
        if (addRow && view === 'employees'){
          openModal('__new');
          return;
        }
      });

      empModal.addEventListener('click', function(e){
        if (e.target && e.target.getAttribute && e.target.getAttribute('data-close') === '1') closeModal();
      });

      mCancel.addEventListener('click', closeModal);

      mDays.addEventListener('click', function(e){
        var b = e.target.closest('.daybtn');
        if (!b) return;
        b.classList.toggle('on');
      });

      mLinkYes.addEventListener('click', function(){ setLinkButtons(true); });
      mLinkNo.addEventListener('click', function(){ setLinkButtons(false); });
      mInTeamYes.addEventListener('click', function(){ setInTeamButtons(true); });
      mInTeamNo.addEventListener('click', function(){ setInTeamButtons(false); });

      mSocials.addEventListener('click', function(e){
        var b = e.target.closest('.daybtn[data-social]');
        if (!b) return;
        b.classList.toggle('on');
      });

      mSave.addEventListener('click', function(){
        var first = (mFirst.value || '').trim();
        var last = (mLast.value || '').trim();
        var full = (first + ' ' + last).trim();

        var daySet = [];
        var btns = mDays.querySelectorAll('.daybtn.on');
        for (var i=0;i<btns.length;i++) daySet.push(btns[i].dataset.day);

        var yes = mLinkYes.classList.contains('active');

        function collectMeta(){
          var socials = [];
          var sBtns = mSocials.querySelectorAll('.daybtn.on[data-social]');
          for (var i=0;i<sBtns.length;i++) socials.push(sBtns[i].getAttribute('data-social'));

          return {
            project: (mProject.value || '').trim(),
            department: (mDept.value || '').trim(),
            status: (mStatus.value || '').trim(),
            employment: (mEmployment.value || '').trim(),
            interaction: (mInteraction.value || '').trim(),
            workFormat: (mWorkFormat.value || '').trim(),
            payoutType: (mPayoutType.value || '').trim(),
            payoutFreq: (mPayoutFreq.value || '').trim(),
            city: (mCity.value || '').trim(),
            tz: (mTz.value || '').trim(),
            email: (mEmail.value || '').trim(),
            emailMeaning: (mEmailMeaning.value || '').trim(),
            phone: (mPhone.value || '').trim(),
            socials: socials,
            inTeam: mInTeamYes.classList.contains('active'),
            hireDate: (mHireDate.value || '').trim()
          };
        }

        if (editingId === '__new'){
          var id = 'u' + Math.random().toString(16).slice(2,7);
          employees.push({
            id:id,
            name: full || 'Новый сотрудник',
            role:(mRole.value||'').trim() || '—',
            days: daySet,
            from:(mFrom.value||'').trim(),
            to:(mTo.value||'').trim(),
            hours:(mHours.value||'').trim(),
            tg:(mTg.value||'').trim(),
            tgLinked: yes,
            meta: collectMeta()
          });
        } else {
          for (var j=0;j<employees.length;j++){
            if (employees[j].id !== editingId) continue;

            employees[j].name = full || employees[j].name;
            employees[j].role = (mRole.value||'').trim() || employees[j].role;
            employees[j].days = daySet;
            employees[j].from = (mFrom.value||'').trim();
            employees[j].to = (mTo.value||'').trim();
            employees[j].hours = (mHours.value||'').trim();
            employees[j].tg = (mTg.value||'').trim();
            employees[j].tgLinked = yes;

            if (!employees[j].meta) employees[j].meta = Object.create(null);
            var meta = collectMeta();
            employees[j].meta.project = meta.project;
            employees[j].meta.department = meta.department;
            employees[j].meta.status = meta.status;
            employees[j].meta.status2 = meta.status2;
            employees[j].meta.employment = meta.employment;
            employees[j].meta.interaction = meta.interaction;
            employees[j].meta.workFormat = meta.workFormat;
            employees[j].meta.payoutType = meta.payoutType;
            employees[j].meta.payoutFreq = meta.payoutFreq;
            employees[j].meta.city = meta.city;
            employees[j].meta.tz = meta.tz;
            employees[j].meta.email = meta.email;
            employees[j].meta.emailMeaning = meta.emailMeaning;
            employees[j].meta.phone = meta.phone;
            employees[j].meta.socials = meta.socials;
            employees[j].meta.inTeam = meta.inTeam;
            employees[j].meta.hireDate = meta.hireDate;

            break;
          }
        }

        state.plan = Object.create(null);
        state.fact = Object.create(null);

        closeModal();
        renderEmployeeMS();
        render();
      });
    }

    function assert(cond, msg){
      if (!cond) throw new Error(msg || 'assert');
    }

    function runTests(){
      ensureMonthData(cursor);

      var futureKey = '2026-01-20';
      assert(isNoFact('sem', futureKey) === false, 'no_fact must be false for future');

      assert(dotClassForStatus('paid_off') === 'dot-paidoff', 'paid_off dot class');

      var past = new Date(2026,0,10);
      var pk = keyOf(past);
      if (!state.plan[pk]) state.plan[pk] = Object.create(null);
      if (!state.fact[pk]) state.fact[pk] = Object.create(null);
      state.plan[pk]['sem'] = { type:'work', minutes:8*60 };
      delete state.fact[pk]['sem'];
      assert(isNoFact('sem', pk) === true, 'no_fact must be true for past planned work with no fact');

      assert(formatWorkDays(['Пн','Ср','Пт']) === 'Пн, Ср, Пт', 'days singles');
      assert(formatWorkDays(['Пн','Вт','Чт']) === 'Пн–Вт, Чт', 'days ranges + single');

      assert(!!employees[0].meta && !!employees[0].meta.project, 'employee meta exists');
    }

    function init(){
      bindEvents();
      render();
      try{ runTests(); }
      catch(ex){
        try{ console.warn(ex); }catch(_){ }
        showErr('TESTS: ' + String(ex && ex.message ? ex.message : ex));
      }
    }

    function boot(){
      try{ init(); }
      catch(ex){
        showErr(String(ex && ex.message ? ex.message : ex) + (ex && ex.stack ? ('\n' + ex.stack) : ''));
      }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
    else boot();

  })();
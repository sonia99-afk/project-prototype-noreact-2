// const API_BASE_URL = window.location.origin;

// class TimeTrackingAPI {
//   static async getEmployees() {
//     const response = await fetch(`${API_BASE_URL}/api/employees`);
//     if (!response.ok) throw new Error('Ошибка загрузки сотрудников');
//     return await response.json();
//   }

//   static async saveEmployees(employees) {
//     const response = await fetch(`${API_BASE_URL}/api/employees`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(employees)
//     });
//     if (!response.ok) throw new Error('Ошибка сохранения сотрудников');
//     return await response.json();
//   }

//   static async getTimeData() {
//     const response = await fetch(`${API_BASE_URL}/api/time-data`);
//     if (!response.ok) throw new Error('Ошибка загрузки данных времени');
//     return await response.json();
//   }

//   static async saveTimeData(timeData) {
//     const response = await fetch(`${API_BASE_URL}/api/time-data`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(timeData)
//     });
//     if (!response.ok) throw new Error('Ошибка сохранения данных времени');
//     return await response.json();
//   }
// }

// // Замените инициализацию данных в вашем коде:
// async function loadInitialData() {
//   try {
//     // Загружаем данные с сервера
//     employees = await TimeTrackingAPI.getEmployees();
//     const timeData = await TimeTrackingAPI.getTimeData();
    
//     // Инициализируем meta данные для каждого сотрудника
//     for (let e0 = 0; e0 < employees.length; e0++) {
//       ensureEmployeeMeta(employees[e0]);
//     }
    
//     // Объединяем с локальными данными
//     state.plan = { ...state.plan, ...timeData.plan };
//     state.fact = { ...state.fact, ...timeData.fact };
    
//     // Проверяем наличие данных для текущего месяца
//     ensureMonthData(cursor);
    
//     render();
//   } catch (error) {
//     console.error('Ошибка загрузки данных:', error);
//     showErr('Ошибка загрузки данных с сервера');
//   }
// }

// // Обновите функцию сохранения при изменениях
// function saveState() {
//   try {
//     // Сохраняем сотрудников
//     TimeTrackingAPI.saveEmployees(employees);
    
//     // Сохраняем данные времени
//     TimeTrackingAPI.saveTimeData({
//       plan: state.plan,
//       fact: state.fact
//     });
//   } catch (error) {
//     console.error('Ошибка сохранения:', error);
//     showErr('Ошибка сохранения на сервере');
//   }
// }

// // Вызывайте saveState() после изменений:
// // - После редактирования сотрудника
// // - После изменения данных времени


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
      }catch(_){ }   //тут нет условия
    }

    window.addEventListener('error', function(e){
      var stack = '';
      try{ stack = (e && e.error && e.error.stack) ? ('\n' + e.error.stack) : ''; }catch(_){ stack=''; }
      showErr((e && e.message ? e.message : 'Error') + stack); //опять же переписать
    });

    var contentEl = $('content');
    var viewTitleEl = $('viewTitle');
    var viewHintEl = $('viewHint');
    var navEl = $('nav');
    var modeSegEl = $('modeSeg');
    var empViewSegEl = $('empViewSeg');
    var prevBtn = $('prevBtn');
    var todayBtn = document.getElementById('todayBtn');
    var nextBtn = $('nextBtn');
    var periodLabelEl = $('periodLabel');
    var empMS = $('empMS');
    var empMSBtn = $('empMSBtn');
    var empMSPop = $('empMSPop');
    var periodSelect = $('periodSelect');
    var toggleWorkTimeBtn = $('toggleWorkTime');
    var toggleHighlightBtn = $('toggleHighlight');
    var toggleChronoBtn = $('toggleChrono');

   

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
      emails: ['pm.designprosmot@mail.ru','fm.designprosmot@mail.ru','hr.designprosmot@mail.ru'],
      emailMeaning: {
        'pm.designprosmot@mail.ru':'Project Manager',
        'fm.designprosmot@mail.ru':'Finance Manager',
        'hr.designprosmot@mail.ru':'HR'
      },
      socials: ['Telegram', 'Instagram','ВКонтакте']
    };

    
   

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
      } //фикс из-за смены названий

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
    
      // Важно: TODAY уже есть в твоём коде
      var today = startOfToday();
    
      function dowRuShort(d){
        // DAY_ORDER: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
        // JS: 0=Вс,1=Пн,...,6=Сб
        var js = d.getDay();
        return js === 0 ? 'Вс' : DAY_ORDER[js - 1];
      }
    
      function parseHMToMinutes(s){
        if (!s || typeof s !== 'string') return null;
        var parts = s.split(':');
        if (parts.length < 2) return null;
        var h = Number(parts[0]);
        var m = Number(parts[1]);
        if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
        return h * 60 + m;
      }
    
      function minutesFromSchedule(emp){
        // 1) если есть hours вида "8:00" -> 480
        var hm = parseHMToMinutes(emp.hours);
        if (hm != null) return hm;
    
        // 2) иначе считаем from/to
        var from = parseHMToMinutes(emp.from);
        var to = parseHMToMinutes(emp.to);
        if (from == null || to == null) return null;
    
        var diff = to - from;
        if (diff < 0) diff += 24 * 60;
        return diff;
      }
    
      function isWorkingDayForEmp(emp, d){
        var ru = dowRuShort(d); // 'Пн'...'Вс'
        return !!(emp.days && emp.days.indexOf(ru) >= 0);
      }
    
      for (var di=0; di<days.length; di++){
        var d = days[di];
        var k = keyOf(d);
    
        if (!state.plan[k]) state.plan[k] = Object.create(null);
        if (!state.fact[k]) state.fact[k] = Object.create(null);
    
        var isPast = d < today;
    
        for (var ei=0; ei<employees.length; ei++){
          var e = employees[ei];
    
          // ---- PLAN: только если ещё нет записи ----
          if (!state.plan[k][e.id]){
            var work = isWorkingDayForEmp(e, d);
    
            if (!work){
              state.plan[k][e.id] = { type:'off', minutes:null };
            } else {
              var mins = minutesFromSchedule(e);
              // если совсем не можем посчитать — ставим 8ч как безопасный дефолт
              if (mins == null) mins = 8 * 60;
              state.plan[k][e.id] = { type:'work', minutes:mins };
            }
          }
    
          // ---- FACT: НЕ РАНДОМ, только “заполнить пустоту” в прошлом ----
          // Чтобы таблица не показывала "неявка" просто из-за отсутствия факта.
          // Если факт уже есть (введён вручную) — НЕ ТРОГАЕМ.
          if (isPast && !state.fact[k][e.id]){
            var p = state.plan[k][e.id];
            if (!p){
              // на всякий
              state.fact[k][e.id] = { type:'off', minutes:null };
            } else if (p.type === 'work' || p.type === 'special'){
              state.fact[k][e.id] = { type:'work', minutes:(p.minutes != null ? p.minutes : 0) };
            } else {
              state.fact[k][e.id] = { type:p.type, minutes:null };
            }
          }
    
          // В будущем факт лучше оставлять пустым (пусть будет "—")
          // Ничего не делаем.
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
      // Для «Производственного календаря» диапазон в шапке должен соответствовать
      // его собственному состоянию (ProdCalendar.getState().current), а не общему cursor.
      var pcState = null;
      try{
        pcState = (view === 'prodcalendar' && window.ProdCalendar && typeof window.ProdCalendar.getState === 'function')
          ? window.ProdCalendar.getState()
          : null;
      }catch(_){ pcState = null; }

      var baseDate = (view === 'prodcalendar' && pcState && pcState.current)
        ? pcState.current
        : cursor;

      if (periodSelect.value === 'month' || view === 'prodcalendar'){
        var mr = monthRange(baseDate);
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

    

    function renderEmployees(){
      try{
        if (window.EmployeesView && typeof window.EmployeesView.render === 'function'){
          window.EmployeesView.render({
            employees: employees,
            ensureEmployeeMeta: ensureEmployeeMeta,
            formatWorkDays: formatWorkDays,
            employeesView: employeesView,
            contentEl: contentEl
          });
          return;
        }
      }catch(e){
        showErr(e && e.message ? e.message : e);
      }
    
      contentEl.innerHTML =
        '<div class="card"><h3>Сотрудники</h3>' +
        '<div style="font-size:12px;color:var(--mut);line-height:1.6;font-weight:900;">' +
        'Не найден скрипт сотрудников (scripts/employees-view.js).' +
        '</div></div>';
    }
    




// ...новый блок контакты в начале страницы
function renderTeamContacts(){
  try{
    if (window.TeamContacts && typeof window.TeamContacts.render === 'function'){
      window.TeamContacts.render({
        employees: employees,
        ensureEmployeeMeta: ensureEmployeeMeta,
        contentEl: contentEl
      });
      return;
    }
  }catch(e){
    showErr(e && e.message ? e.message : e);
  }

  contentEl.innerHTML =
    '<div class="card"><h3>Контакты</h3>' +
    '<div style="font-size:12px;color:var(--mut);line-height:1.6;font-weight:900;">' +
    'Не найден скрипт контактов (scripts/team-contacts.js).' +
    '</div></div>';
}


    // ...
    

   
    

    

    

    

   

    // ============================
    // Производственный календарь (вынесен в scripts/prod-calendar.js)
    // ============================
    function renderProdCalendar(){
      try{
        if (window.ProdCalendar && typeof window.ProdCalendar.render === 'function'){
          window.ProdCalendar.render({
            contentEl: contentEl,
            TODAY: TODAY
          });
          return;
        }
      }catch(e){
        showErr(e && e.message ? e.message : e);
      }

      contentEl.innerHTML =
        '<div class="card"><h3>Производственный календарь</h3>' +
        '<div style="font-size:12px;color:var(--mut);line-height:1.6;font-weight:900;">' +
        'Не найден скрипт производственного календаря (scripts/prod-calendar.js).' +
        '</div></div>';
    }


function render(){
      // Для производственного календаря стейт инициализируется в prod-calendar.js,
      // но шапка (periodLabel) рисуется до renderProdCalendar().
      // Подстрахуемся: попросим модуль создать стейт заранее.
      if (view === 'prodcalendar' && window.ProdCalendar && typeof window.ProdCalendar.ensureState === 'function'){
        try{ window.ProdCalendar.ensureState(TODAY); }catch(_){ }
      }

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

      modeSegEl.style.display = (view === 'table' || view === 'calendar' || view === 'analytics') ? '' : 'none';

      var isTimeViews = (view === 'table' || view === 'calendar' || view === 'analytics' || view === 'vaccalendar' || view === 'prodcalendar' || view === 'deviations');
      var isTimeViewsTwo = (view === 'table' || view === 'calendar' || view === 'analytics');
      
      prevBtn.style.display = isTimeViews ? '' : 'none';
      nextBtn.style.display = isTimeViews ? '' : 'none';

      if (todayBtn){
        todayBtn.style.display = isTimeViews ? '' : 'none';
      }

      periodLabelEl.style.display = isTimeViews ? '' : 'none';
      
      periodSelect.style.display = isTimeViewsTwo ? '' : 'none';
      empMS.style.display = isTimeViewsTwo ? '' : 'none';
      toggleChronoBtn.style.display = isTimeViewsTwo ? '' : 'none';

     

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
      
        window.TimeTable.render({
          contentEl,
          employees,
          state,
          getPeriodDays,
          keyOf,
          ruDate,
          dowRu,
          getPlanCell,
          getFactCell,
          getMixCell,
          mode,
          timeOrder,
          allSelected,
          selectedEmpIds,
          highlightOn,
          view
        });
      
        return;
      }
      

      if (view === 'calendar'){
        viewTitleEl.textContent = 'Календарь';
        viewHintEl.textContent = monthLabel + ' • ' + who + ' • ' + modeLabel;
      
        window.TimeCalendar.render({
          contentEl,
          employees,
          state,
          cursor,
          TODAY,
          mode,
          timeOrder,
          showWorkTime,
          highlightOn,
          getFilteredEmployees,
          monthRange,
          daysInRange,
          keyOf,
          hasFactFilled,
          isNoShow,
          isNoFact,
          dotClassForStatus,
          fmtHM
        });
      
        return;
      }
      

      if (view === 'analytics'){
        viewTitleEl.textContent = 'Аналитика';
        viewHintEl.textContent = monthLabel + ' • ' + who + ' • ' + modeLabel;
      
        if (window.TimeAnalytics && typeof window.TimeAnalytics.render === 'function'){
          window.TimeAnalytics.render({
            contentEl: contentEl,
            employees: employees,
            state: state,
            mode: mode,
            timeOrder: timeOrder,
          
            allSelected: allSelected,
            selectedEmpIds: selectedEmpIds,
          
            getFilteredEmployees: getFilteredEmployees,
            getPeriodDays: getPeriodDays,
            keyOf: keyOf,
            ruDate: ruDate,
            fmtHM: fmtHM,
            fmtDev: fmtDev,
            hasFactFilled: hasFactFilled,
            isNoShow: isNoShow
          });          
        } else {
          // временная страховка (можно убрать позже)
          // renderAnalytics();
          contentEl.innerHTML = '<div class="card"><h3>Аналитика</h3><div style="font-size:12px;color:var(--mut);line-height:1.6;font-weight:900;">Не найден скрипт аналитики (scripts/time-analytics.js).</div></div>';
        }
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
        viewHintEl.textContent = 'Контакты • таблица';
        renderTeamContacts();
        return;
      }

      if (view === 'prodcalendar'){
        viewTitleEl.textContent = 'Производственный календарь';
        viewHintEl.textContent = 'Сб–Вс = выходные по умолчанию • можно переопределять и добавлять события (состояние только в памяти)';
        renderProdCalendar();
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

      // Навигация по периоду в шапке должна управлять активным экраном.
      // Для «Производственного календаря» используем модуль ProdCalendar.
      prevBtn.addEventListener('click', function(){
        if (view === 'prodcalendar' && window.ProdCalendar && typeof window.ProdCalendar.shiftMonth === 'function'){
          window.ProdCalendar.shiftMonth(-1);
          render();
          return;
        }
        cursor = new Date(cursor.getFullYear(), cursor.getMonth()-1, 1);
        render();
      });

      nextBtn.addEventListener('click', function(){
        if (view === 'prodcalendar' && window.ProdCalendar && typeof window.ProdCalendar.shiftMonth === 'function'){
          window.ProdCalendar.shiftMonth(1);
          render();
          return;
        }
        cursor = new Date(cursor.getFullYear(), cursor.getMonth()+1, 1);
        render();
      });


      if (todayBtn){
        todayBtn.addEventListener('click', function(){
          // Для «Производственного календаря» кнопка «Сегодня» управляет его локальным стейтом.
          if (view === 'prodcalendar' && window.ProdCalendar && typeof window.ProdCalendar.goToday === 'function'){
            window.ProdCalendar.goToday(new Date());
            render();
            return;
          }

          // На остальных экранах «Сегодня» сбрасывает общий cursor на текущий месяц и делает render().
          var now = new Date();
          cursor = new Date(now.getFullYear(), now.getMonth(), 1);
          render();
        });
      }

      periodSelect.addEventListener('change', function(){ render(); });

      toggleWorkTimeBtn.addEventListener('click', function(){ showWorkTime = !showWorkTime; render(); });
      toggleHighlightBtn.addEventListener('click', function(){ highlightOn = !highlightOn; render(); });

      toggleChronoBtn.addEventListener('click', function(){
        timeOrder = (timeOrder === 'desc') ? 'asc' : 'desc';
        render();
      });

      empMSBtn.addEventListener('click', function(ev){
        ev.stopPropagation();
        setEmpMSOpen(!empMS.classList.contains('open'));
      });

      empMSPop.addEventListener('click', function(ev){
        ev.stopPropagation();
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
          if (window.EmployeesModal && window.EmployeesModal.isOpen()) window.EmployeesModal.close();
        }
        if (!(e.metaKey || e.ctrlKey)) return;
        if (e.key === '1'){ view='calendar'; render(); }
        if (e.key === '2'){ view='table'; render(); }
        if (e.key === '3'){ view='analytics'; render(); }
      });

      contentEl.addEventListener('click', function(e){
        var card = e.target.closest('.emp-card');
        if (card && view === 'employees'){
          window.EmployeesModal.open(card.getAttribute('data-emp'));
          return;
        }
        var add = e.target.closest('.emp-add');
        if (add && view === 'employees'){
          window.EmployeesModal.open('__new');
          return;
        }

        var row = e.target.closest('.emp-table .row.item');
        if (row && view === 'employees'){
          window.EmployeesModal.open(row.getAttribute('data-emp'));
          return;
        }
        var addRow = e.target.closest('.emp-table .row.add');
        if (addRow && view === 'employees'){
          window.EmployeesModal.open('__new');
          return;
        }
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
      window.EmployeesModal.init({
        showErr: showErr,
        ensureEmployeeMeta: ensureEmployeeMeta,
        renderEmployeeMS: renderEmployeeMS,
        render: render,
        OPT: OPT,
      
        getEmployees: function(){ return employees; },
        getState: function(){ return state; },
        getSelectedEmpIds: function(){ return selectedEmpIds; },
      
        getAllSelected: function(){ return allSelected; },
        setAllSelected: function(v){ allSelected = !!v; }
      });
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

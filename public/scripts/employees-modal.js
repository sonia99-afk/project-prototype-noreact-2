/**
 * Employees modal extracted from app.js
 * Usage from app.js:
 *   EmployeesModal.init({ ...deps... })
 *   EmployeesModal.open(empId)
 *   EmployeesModal.close()
 *   EmployeesModal.isOpen()
 */
(function(){
    'use strict';
  
    function $(id){
      var n = document.getElementById(id);
      if (!n) throw new Error('Missing element #' + id);
      return n;
    }
  
    // DOM
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
    var mDelet = $('mDelet');
    var mCancel = $('mCancel');
  
    // state inside module
    var deps = null;
    var editingId = null;
    var bound = false;
  
    // ---------- helpers ----------
    function setLinkButtons(yes){
      mLinkYes.classList.toggle('active', !!yes);
      mLinkNo.classList.toggle('active', !yes);
    }
  
    function setInTeamButtons(yes){
      mInTeamYes.classList.toggle('active', !!yes);
      mInTeamNo.classList.toggle('active', !yes);
    }
  
    function setButtonsOn(container, attrName, values){
      if (!container) return;
  
      var all = container.querySelectorAll('.daybtn');
      for (var i=0;i<all.length;i++) all[i].classList.remove('on');
  
      if (!values || !values.length) return;
  
      for (var j=0;j<values.length;j++){
        var v = values[j];
        var btn = container.querySelector('.daybtn[' + attrName + '="' + v + '"]');
        if (btn) btn.classList.add('on');
      }
    }
  
    // ---------- time calc ----------
    function parseHM(value){
      if (!value || typeof value !== 'string') return null;
      var parts = value.split(':');
      if (parts.length < 2) return null;
  
      var h = Number(parts[0]);
      var m = Number(parts[1]);
      if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  
      h = Math.max(0, Math.min(23, h));
      m = Math.max(0, Math.min(59, m));
      return h * 60 + m;
    }
  
    function fmtHMFromMinutes(totalMin){
      totalMin = Math.max(0, Math.floor(totalMin));
      var h = Math.floor(totalMin / 60);
      var m = totalMin % 60;
      return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }
  
    function updateWorkHours(){
      var fromMin = parseHM(mFrom.value);
      var toMin = parseHM(mTo.value);
  
      if (fromMin == null || toMin == null){
        mHours.value = '';
        return;
      }
  
      var diff = toMin - fromMin;
      if (diff < 0) diff += 24 * 60;
  
      mHours.value = fmtHMFromMinutes(diff);
    }
  
    // ---------- phone mask (как в app.js) ----------
    function bindPhoneMask(){
      var phone = mPhone;
      if (!phone) return;
  
      phone.addEventListener('input', function(){
        var v = phone.value.replace(/\D/g, '');
  
        if (v.startsWith('8')) v = '7' + v.slice(1);
  
        // ограничим длину "7XXXXXXXXXX"
        if (v.length > 11) v = v.slice(0, 11);
  
        // если пользователь начал с 9 — считаем что это РФ без кода
        if (v.length === 10 && v.startsWith('9')) v = '7' + v;
  
        // формат: +7 999 123-45-67 (мягко)
        if (v.startsWith('7')){
          var p = v.slice(1);
          var out = '+7';
          if (p.length > 0) out += ' ' + p.slice(0,3);
          if (p.length > 3) out += ' ' + p.slice(3,6);
          if (p.length > 6) out += '-' + p.slice(6,8);
          if (p.length > 8) out += '-' + p.slice(8,10);
          phone.value = out;
        } else {
          phone.value = v;
        }
      });
    }
  
    // ---------- open/close ----------
    function open(empId){
      if (!deps) throw new Error('EmployeesModal: init() was not called');
  
      editingId = empId;
  
      // «Удалить» показываем только если редактируем существующего
      if (mDelet) mDelet.style.display = (empId === '__new') ? 'none' : '';
  
      // сброс кнопок
      setButtonsOn(mDays, 'data-day', []);
      setButtonsOn(mSocials, 'data-social', []);
  
      // найти сотрудника
      var employees = deps.getEmployees();
      var emp = null;
      for (var i=0;i<employees.length;i++){
        if (employees[i].id === empId) { emp = employees[i]; break; }
      }
  
      if (!emp){
        // режим "создание"
        if (mDelet) mDelet.style.display = 'none';
  
        mFirst.value=''; mLast.value=''; mRole.value='';
        mFrom.value=''; mTo.value=''; mHours.value=''; mTg.value='';
        if (mEmail) mEmail.value='';
        if (mEmailMeaning) mEmailMeaning.value='';
        if (mPhone) mPhone.value='';
        if (mHireDate) mHireDate.value='';
  
        setLinkButtons(true);
        setInTeamButtons(true);
  
        empModal.hidden = false;
        return;
  _btEmpFound: ;
      }
  
      deps.ensureEmployeeMeta(emp);
  
      var parts = (emp.name || '').split(' ');
      mFirst.value = parts[0] || '';
      mLast.value = parts.slice(1).join(' ') || '';
      mRole.value = emp.role || '';
      mFrom.value = emp.from || '';
      mTo.value = emp.to || '';
      mHours.value = emp.hours || '';
      mTg.value = emp.tg || '';
      setLinkButtons(!!emp.tgLinked);
  
      // meta
      var meta = emp.meta || {};
      if (mEmail) mEmail.value = meta.email || '';
      if (mEmailMeaning) mEmailMeaning.value = meta.emailMeaning || '';
      if (mPhone) mPhone.value = meta.phone || '';
      if (mHireDate) mHireDate.value = meta.hireDate || '';
  
      setInTeamButtons(!!meta.inTeam);
  
      // дни / соцсети
      setButtonsOn(mDays, 'data-day', emp.days || []);
      setButtonsOn(mSocials, 'data-social', meta.socials ? meta.socials : []);
  
      empModal.hidden = false;
    }
  
    function close(){
      empModal.hidden = true;
      editingId = null;
    }
  
    function isOpen(){
      return !empModal.hidden;
    }
  
    // ---------- save/delete ----------
    function collectMeta(){
      function v(el){
        if (!el) return undefined;
        return (el.value || '').trim();
      }
  
      var socials = [];
      if (mSocials){
        var sBtns = mSocials.querySelectorAll('.daybtn.on[data-social]');
        for (var i=0;i<sBtns.length;i++) socials.push(sBtns[i].getAttribute('data-social'));
      }
  
      return {
        email: v(mEmail),
        emailMeaning: v(mEmailMeaning),
        phone: v(mPhone),
        socials: socials,
        inTeam: mInTeamYes ? mInTeamYes.classList.contains('active') : false,
        hireDate: v(mHireDate)
      };
    }
  
    function onSave(){
      try{
        mLast.classList.toggle('invalid', !mLast.value.trim());
        if (!mLast.value.trim()){
          mLast.focus();
          return;
        }
  
        var employees = deps.getEmployees();
        var state = deps.getState();
  
        var first = (mFirst.value || '').trim();
        var last = (mLast.value || '').trim();
        var full = (first + ' ' + last).trim();
  
        var daySet = [];
        var btns = mDays.querySelectorAll('.daybtn.on');
        for (var i=0;i<btns.length;i++) daySet.push(btns[i].dataset.day);
  
        var yes = mLinkYes.classList.contains('active');
  
        if (editingId === '__new'){
          var id = 'u' + Math.random().toString(16).slice(2,7);
          employees.push({
            id: id,
            name: full || 'Новый сотрудник',
            role: (mRole.value||'').trim() || '—',
            days: daySet,
            from: (mFrom.value||'').trim(),
            to: (mTo.value||'').trim(),
            hours: (mHours.value||'').trim(),
            tg: (mTg.value||'').trim(),
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
  
            if (meta.email !== undefined) employees[j].meta.email = meta.email;
            if (meta.emailMeaning !== undefined) employees[j].meta.emailMeaning = meta.emailMeaning;
            if (meta.phone !== undefined) employees[j].meta.phone = meta.phone;
  
            employees[j].meta.socials = meta.socials;
            employees[j].meta.inTeam = meta.inTeam;
  
            if (meta.hireDate !== undefined) employees[j].meta.hireDate = meta.hireDate;
  
            break;
          }
        }
  
        // сброс кеша план/факт
        state.plan = Object.create(null);
        state.fact = Object.create(null);
  
        close();
        deps.renderEmployeeMS();
        deps.render();
      }catch(e){
        deps.showErr(e && e.message ? e.message : e);
      }
    }
  
    function onDelete(){
      try{
        if (!editingId || editingId === '__new') return;
  
        var employees = deps.getEmployees();
        var state = deps.getState();
        var selectedEmpIds = deps.getSelectedEmpIds();
  
        var empId = editingId;
  
        var emp = null;
        for (var i=0;i<employees.length;i++){
          if (employees[i].id === empId) { emp = employees[i]; break; }
        }
        var name = emp ? emp.name : empId;
  
        if (!confirm('Удалить сотрудника «' + name + '»?')) return;
  
        for (var j=employees.length-1; j>=0; j--){
          if (employees[j].id === empId) employees.splice(j, 1);
        }
  
        // обновляем мультиселект
        if (!deps.getAllSelected()){
          selectedEmpIds.delete(empId);
          if (selectedEmpIds.size === 0) deps.setAllSelected(true);
        }
  
        state.plan = Object.create(null);
        state.fact = Object.create(null);
  
        close();
        deps.renderEmployeeMS();
        deps.render();
      }catch(e){
        deps.showErr(e && e.message ? e.message : e);
      }
    }
  
    // ---------- bindings ----------
    function bindOnce(){
        fillSelect(mEmail, (deps && deps.OPT && deps.OPT.emails) ? deps.OPT.emails : []);
if (mEmail) mEmail.addEventListener('change', syncEmailMeaning);



      if (bound) return;
      bound = true;
  
      // пересчет часов
      mFrom.addEventListener('input', updateWorkHours);
      mTo.addEventListener('input', updateWorkHours);
      mFrom.addEventListener('change', updateWorkHours);
      mTo.addEventListener('change', updateWorkHours);
  
      // маска телефона
      bindPhoneMask();

      function fillSelect(sel, values){
        if (!sel) return;
        var html = [];
        for (var i=0;i<values.length;i++){
          var v = values[i];
          html.push('<option value="' + v + '">' + v + '</option>');
        }
        sel.innerHTML = html.join('');
      }
      
      function syncEmailMeaning(){
        var em = (mEmail && mEmail.value) ? mEmail.value : '';
        var meaning = (deps && deps.OPT && deps.OPT.emailMeaning && deps.OPT.emailMeaning[em]) ? deps.OPT.emailMeaning[em] : '';
        if (mEmailMeaning) mEmailMeaning.value = meaning || '';
      }
      
  
      // дни / соцсети
      mDays.addEventListener('click', function(e){
        var b = e.target.closest('.daybtn');
        if (!b) return;
        b.classList.toggle('on');
      });
  
      mSocials.addEventListener('click', function(e){
        var b = e.target.closest('.daybtn[data-social]');
        if (!b) return;
        b.classList.toggle('on');
      });
  
      // да/нет
      mLinkYes.addEventListener('click', function(){ setLinkButtons(true); });
      mLinkNo.addEventListener('click', function(){ setLinkButtons(false); });
      mInTeamYes.addEventListener('click', function(){ setInTeamButtons(true); });
      mInTeamNo.addEventListener('click', function(){ setInTeamButtons(false); });
  
      // закрытие по клику в крестик/фон
      empModal.addEventListener('click', function(e){
        if (e.target && e.target.getAttribute && e.target.getAttribute('data-close') === '1') close();
      });
  
      mCancel.addEventListener('click', close);
  
      if (mDelet) mDelet.addEventListener('click', onDelete);
      mSave.addEventListener('click', onSave);
    }
  
    function init(d){
      deps = d;
      bindOnce();
    }
  
    // public
    window.EmployeesModal = {
      init: init,
      open: open,
      close: close,
      isOpen: isOpen
    };
  })();
  
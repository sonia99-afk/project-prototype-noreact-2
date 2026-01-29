/**
 * Team Contacts table
 * app.js calls window.TeamContacts.render({ employees, ensureEmployeeMeta, contentEl })
 */
(function(){
    'use strict';
  
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
  
    function todayRuDOW(d){
      // JS: 0 Sun ... 6 Sat -> 'Вс','Пн'..'Сб'
      var map = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
      return map[d.getDay()];
    }
  
    function isInRange(nowMin, fromMin, toMin){
      // supports overnight shift
      if (fromMin == null || toMin == null) return false;
      if (fromMin === toMin) return true;
      if (toMin > fromMin){
        return nowMin >= fromMin && nowMin < toMin;
      }
      // crosses midnight
      return (nowMin >= fromMin) || (nowMin < toMin);
    }
  
    function isEmployeeOnline(emp, now){
      try{
        if (!emp) return false;
        var day = todayRuDOW(now);
  
        // дни работы: ['Пн','Вт',...]
        if (!emp.days || emp.days.indexOf(day) === -1) return false;
  
        var fromMin = parseHM(emp.from);
        var toMin = parseHM(emp.to);
        if (fromMin == null || toMin == null) return false;
  
        var nowMin = now.getHours() * 60 + now.getMinutes();
        return isInRange(nowMin, fromMin, toMin);
      }catch(_){
        return false;
      }
    }
  
    function esc(s){
      return String(s == null ? '' : s)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
    }
  
    function render(ctx){
      var employees = (ctx && ctx.employees) ? ctx.employees : [];
      var ensureEmployeeMeta = ctx && ctx.ensureEmployeeMeta;
      var contentEl = ctx && ctx.contentEl;
  
      var tpl = document.getElementById('tpl-team-contacts-table');
      if (!tpl) throw new Error('Не найден шаблон #tpl-team-contacts-table в index.html');
      if (!contentEl) throw new Error('Не передан contentEl');
  
      contentEl.innerHTML = '';
      var root = tpl.content.firstElementChild.cloneNode(true);
      contentEl.appendChild(root);
  
      var body = root.querySelector('[data-team-contacts-body]');
      if (!body) throw new Error('Не найден контейнер [data-team-contacts-body]');
  
      var now = new Date();
  
      var rows = [];
      for (var i=0; i<employees.length; i++){
        var e = employees[i];
        if (typeof ensureEmployeeMeta === 'function') ensureEmployeeMeta(e);
  
        var online = isEmployeeOnline(e, now);
        var dotCls = online ? 'online' : 'offline';
  
        var socials = (e.meta && Array.isArray(e.meta.socials)) ? e.meta.socials : [];
        var socialsHtml = socials.length
          ? '<div class="chips">' + socials.map(function(s){
              // как на твоей картинке: Vk / Inst
              var label = (s === 'ВКонтакте') ? 'Vk' : (s === 'Instagram') ? 'Inst' : s;
              return '<span class="chip">' + esc(label) + '</span>';
            }).join('') + '</div>'
          : '—';
  
        rows.push(
          '<div class="row item">' +
            '<div class="cell"><span class="status-dot ' + dotCls + '" title="' + (online ? 'Онлайн' : 'Офлайн') + '"></span></div>' +
            '<div class="cell mut">' + esc(e.role || '—') + '</div>' +
            '<div class="cell">' + esc(e.name || '—') + '</div>' +
            '<div class="cell">' + esc(e.tg || '—') + '</div>' +
            '<div class="cell subtle">' + esc((e.meta && e.meta.email) ? e.meta.email : '—') + '</div>' +
            '<div class="cell subtle">' + esc((e.meta && e.meta.emailMeaning) ? e.meta.emailMeaning : '—') + '</div>' +
            '<div class="cell subtle">' + esc((e.meta && e.meta.phone) ? e.meta.phone : '—') + '</div>' +
            '<div class="cell subtle">' + socialsHtml + '</div>' +
            '<div class="cell subtle">' + ((e.meta && e.meta.inTeam) ? 'да' : 'нет') + '</div>' +
          '</div>'
        );
      }
  
      body.innerHTML = rows.join('');
    }
  
    window.TeamContacts = { render: render };
  })();
  
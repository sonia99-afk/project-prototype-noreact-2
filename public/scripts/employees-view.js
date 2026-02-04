/**
 * Employees view (cards/table) extracted from app.js
 * app.js calls window.EmployeesView.render({ employees, ensureEmployeeMeta, formatWorkDays, employeesView, contentEl })
 */
(function(){
    'use strict';
  
    function renderCards(ctx){
      var employees = ctx.employees || [];
      var ensureEmployeeMeta = ctx.ensureEmployeeMeta;
      var formatWorkDays = ctx.formatWorkDays;
      var contentEl = ctx.contentEl;
  
      var html = [];
      html.push('<div class="emp-grid" id="empGrid">');
  
      for (var i=0;i<employees.length;i++){
        var e = employees[i];
        if (typeof ensureEmployeeMeta === 'function') ensureEmployeeMeta(e);
  
        var days = (typeof formatWorkDays === 'function') ? formatWorkDays(e.days) : '—';
        var hours = (e.hours || '—').replace(':00','') + ' часов';
        var range = (e.from && e.to) ? ('с ' + e.from + ' до ' + e.to) : 'с N/A до N/A';
        var tg = e.tg ? ('tg: ' + e.tg) : 'tg: —';
  
        var meta = ((e.meta && e.meta.project) ? e.meta.project : '—') + ' • ' + ((e.meta && e.meta.department) ? e.meta.department : '—');
  
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
  
    function renderTable(ctx){
      var employees = ctx.employees || [];
      var ensureEmployeeMeta = ctx.ensureEmployeeMeta;
      var formatWorkDays = ctx.formatWorkDays;
      var contentEl = ctx.contentEl;
  
      var tpl = document.getElementById('tpl-employees-table');
      if (!tpl) throw new Error('Не найден шаблон #tpl-employees-table в index.html');
  
      contentEl.innerHTML = '';
      var root = tpl.content.firstElementChild.cloneNode(true);
      contentEl.appendChild(root);
  
      var body = root.querySelector('[data-emp-table-body]');
      if (!body) throw new Error('Не найден контейнер [data-emp-table-body]');
  
      var rows = [];
  
      for (var i=0; i<employees.length; i++){
        var e = employees[i];
        if (typeof ensureEmployeeMeta === 'function') ensureEmployeeMeta(e);
  
        var days = (typeof formatWorkDays === 'function') ? formatWorkDays(e.days) : '—';
        var hours = (e.hours || '—');
        var range = (e.from && e.to) ? (e.from + '–' + e.to) : '—';
        var tg = e.tg ? e.tg : '—';
  
        rows.push(`
            <div class="row item" data-emp="${e.id}">
              <div class="cell">${e.name}</div>
              <div class="cell mut">${e.role}</div>
              
              <div class="cell num">${days}</div>
              <div class="cell num">${hours}</div>
              <div class="cell num">${range}</div>
              <div class="cell">${tg}</div>
              <div class="cell subtle">${(e.meta && e.meta.email) || '—'}</div>
              <div class="cell subtle">${(e.meta && e.meta.phone) || '—'}</div>
              <div class="cell subtle">${((e.meta && e.meta.socials) || []).join(', ') || '—'}</div>
              <div class="cell subtle">${(e.meta && e.meta.hireDate) || '—'}</div>
              <div class="cell subtle">${(e.meta && e.meta.inTeam) ? 'В штате' : 'Уволен'}</div>
              <div class="cell subtle">${(e.meta && e.meta.emailMeaning) || '—'}</div>
            </div>
          `);
      }
  
      body.innerHTML = rows.join('');
    }
  
    function render(ctx){
      if (!ctx || !ctx.contentEl) throw new Error('EmployeesView: не передан contentEl');
  
      if (ctx.employeesView === 'table') renderTable(ctx);
      else renderCards(ctx);
    }
  
    window.EmployeesView = { render: render };
  })();
  
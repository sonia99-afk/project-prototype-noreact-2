(function(){
    'use strict';
  
    function renderCalendar(ctx){
      var {
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
      } = ctx;
  
      var mr = monthRange(cursor);
      var start = mr.start;
      var end = mr.end;
  
      var first = new Date(start);
      var js = first.getDay();
      var offset = (js === 0) ? 6 : js - 1;
      first.setDate(first.getDate() - offset);
  
      var last = new Date(end);
      var js2 = last.getDay();
      var offset2 = (js2 === 0) ? 0 : 7 - js2;
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
  
        var dayStart = new Date(d);
        dayStart.setHours(0,0,0,0);
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
            if (isNoShow(emp.id, k)) st = 'no_show';
            else if (isNoFact(emp.id, k)) st = 'no_fact';
            else if (f){
              st = f.type;
              if (showWorkTime && f.type === 'work' && f.minutes != null){
                minutes = f.minutes;
              }
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
          var initials =
            ((parts[0] && parts[0][0]) || '') +
            ((parts[1] && parts[1][0]) || '');
          initials = initials.toUpperCase();
  
          var planCls = muted ? ' dot-plan' : '';
  
          if (minutes != null){
            html.push(
              '<span class="dot ' + clsDot + planCls + ' wide" title="' + emp.name + '">' +
                initials +
                '<span class="time">' + fmtHM(minutes) + '</span>' +
              '</span>'
            );
          } else {
            html.push(
              '<span class="dot ' + clsDot + planCls + '" title="' + emp.name + '">' +
                initials +
              '</span>'
            );
          }
        }
  
        html.push('</div></div>');
      }
  
      html.push('</div></div>');
      contentEl.innerHTML = html.join('');
    }
  
    window.TimeCalendar = {
        render: renderCalendar
      };
  
  })();
  
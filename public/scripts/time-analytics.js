(function(){
    'use strict';
  
    function renderAnalytics(ctx){
      var {
        contentEl,
        // данные/состояние
        employees,
        state,
        mode,
        timeOrder,
        allSelected,
        selectedEmpIds,
  
        // функции-хелперы из app.js
        getPeriodDays,
        getFilteredEmployees,
        keyOf,
        hasFactFilled,
        isNoShow,
        fmtHM,
        fmtDev,
        ruDate
      } = ctx;
  
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
              // пропускаем (mix=0)
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
        var v =
          (mode==='plan') ? series[i].plan :
          (mode==='fact') ? series[i].fact :
          (mode==='mix') ? series[i].mix :
          Math.abs(series[i].dev);
        if (v > max) max = v;
      }
  
      var totalPlan=0, totalFact=0, totalMix=0;
      for (var j=0;j<series.length;j++){
        totalPlan += series[j].plan;
        totalFact += series[j].fact;
        totalMix += series[j].mix;
      }
  
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
        var val =
          (mode==='plan') ? s.plan :
          (mode==='fact') ? s.fact :
          (mode==='mix') ? s.mix :
          Math.abs(s.dev);
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
  
    window.TimeAnalytics = {
      render: renderAnalytics
    };
  })();
  
(function(){
    'use strict';
  
    function renderTable(ctx){
      var {
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
      } = ctx;

      var visEmployees =
      (allSelected || !selectedEmpIds || selectedEmpIds.size === 0)
        ? employees
        : employees.filter(function(e){ return selectedEmpIds.has(e.id); });
  
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
        html.push(
          '<th class="' + (out ? 'filtered-out' : '') + '">' +
            '<div class="head-name">' + e.name +
            '<span>' + e.role + '</span></div>' +
          '</th>'
        );
      }
      html.push('</tr></thead>');
  
      html.push('<tbody>');
      for (var di=0; di<days.length; di++){
        var d = days[di];
        var k = keyOf(d);
  
        html.push('<tr>');
        html.push(
          '<td class="sticky">' +
            '<div>' + ruDate(d) + '</div>' +
            '<div class="date">' + dowRu(d) + '</div>' +
          '</td>'
        );
  
        for (var ej=0; ej<employees.length; ej++){
          var emp = employees[ej];
          var hide = (!allSelected && selectedEmpIds.size>0 && !selectedEmpIds.has(emp.id));
          var outCls = hide ? 'filtered-out' : '';
  
          var cell;
          if (mode === 'fact') cell = getFactCell(emp.id, k);
          else if (mode === 'plan') cell = getPlanCell(emp.id, k);
          else cell = getMixCell(emp.id, k);
  
          html.push('<td class="t ' + outCls + '">' + cell.text + '</td>');
        }
  
        html.push('</tr>');
      }
  
      html.push('</tbody></table></div>');
  
      contentEl.innerHTML = html.join('');
    }
  
    window.TimeTable = {
      render: renderTable
    };
  
  })();
  
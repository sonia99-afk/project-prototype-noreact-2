/**
 * Production Calendar view
 * app.js calls window.ProdCalendar.render({ contentEl, TODAY })
 * Also exposes helpers for header navigation:
 * - window.ProdCalendar.getState()
 * - window.ProdCalendar.shiftMonth(delta)
 * - window.ProdCalendar.goToday(baseDate)
 */
(function(){
    'use strict';
  
    var prodCalendarState = null;
  
    function pad2(n){ return String(n).padStart(2,'0'); }
  
    function ensureState(baseDate){
      if (prodCalendarState) return prodCalendarState;
  
      var base = baseDate instanceof Date ? baseDate : new Date();
  
      prodCalendarState = {
        // current хранит месяц, который показываем (1-е число месяца)
        current: new Date(base.getFullYear(), base.getMonth(), 1),
        selected: null,
        overrides: {}, // {'YYYY-MM-DD': {status:null|'working'|'holiday', events:[eventTypeId...]}}
        eventTypes: [
          { id: 'corporate', name: 'Корпоратив', color: '#7f6bff' },
          { id: 'forum', name: 'Форум', color: '#ff8f6b' },
          { id: 'transfer', name: 'Трансфер', color: '#45b26b' }
        ]
      };
  
      return prodCalendarState;
    }
  
    function getState(){
      return prodCalendarState;
    }
  
    function formatDateKey(d){
      return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
    }
  
    function isWeekend(d){
      var day = d.getDay();
      return day === 0 || day === 6;
    }
  
    function getDayData(state, dateKey){
      if (!state.overrides[dateKey]) state.overrides[dateKey] = { status: null, events: [] };
      var data = state.overrides[dateKey];
      if (!Array.isArray(data.events)) data.events = [];
      return data;
    }
  
    function getStatusForDate(state, d){
      var k = formatDateKey(d);
      var o = state.overrides[k];
      if (o && o.status) return o.status;
      return isWeekend(d) ? 'holiday' : 'working';
    }
  
    function render(ctx){
      var contentEl = ctx && ctx.contentEl;
      if (!contentEl) throw new Error('ProdCalendar: не передан contentEl');
  
      var tpl = document.getElementById('tpl-prodcalendar-view');
      if (!tpl){
        contentEl.innerHTML =
          '<div class="card"><h3>Производственный календарь</h3>' +
          '<div style="font-size:12px;color:var(--mut);line-height:1.6;font-weight:900;">' +
          'Нет шаблона tpl-prodcalendar-view в index.html' +
          '</div></div>';
        return;
      }
  
      // base date: берём TODAY (если передали) или реальное сегодня
      var base = (ctx && ctx.TODAY instanceof Date) ? ctx.TODAY : new Date();
      var state = ensureState(base);
  
      contentEl.innerHTML = '';
      var root = tpl.content.firstElementChild.cloneNode(true);
      contentEl.appendChild(root);
  
      initProdCalendar(root, state);
    }
  
    function initProdCalendar(root, state){
      var monthLabel = root.querySelector('[data-pc-monthLabel]');
      var grid = root.querySelector('[data-pc-grid]');
      var calendarCard = root.querySelector('[data-pc-calendarCard]');
      var selectedDateEl = root.querySelector('[data-pc-selectedDate]');
      var eventListEl = root.querySelector('[data-pc-eventList]');
      var eventTypesEl = root.querySelector('[data-pc-eventTypes]');
      var eventForm = root.querySelector('[data-pc-eventForm]');
      var statusButtons = root.querySelectorAll('[data-pc-status]');
  
      var tplDay = root.querySelector('template[data-pc-tpl="day"]');
      var tplLabel = root.querySelector('template[data-pc-tpl="label"]');
      var tplEventItem = root.querySelector('template[data-pc-tpl="event-item"]');
      var tplEventType = root.querySelector('template[data-pc-tpl="event-type"]');
  
      function cloneTpl(tpl){
        var node = tpl && tpl.content && tpl.content.firstElementChild ? tpl.content.firstElementChild.cloneNode(true) : null;
        if (!node) throw new Error('Template is empty');
        return node;
      }
  
      function setSelected(d){
        state.selected = d;
        renderAll();
      }
  
      function clearSelected(){
        state.selected = null;
        renderAll();
      }
  
      function updateStatusButtons(status){
        for (var i=0;i<statusButtons.length;i++){
          var b = statusButtons[i];
          var s = b.getAttribute('data-pc-status');
          b.disabled = !state.selected;
          b.classList.toggle('active', state.selected && s === status);
        }
      }
  
      function renderCalendar(){
        grid.innerHTML = '';
  
        var year = state.current.getFullYear();
        var month = state.current.getMonth();
        var firstOfMonth = new Date(year, month, 1);
        var startDay = (firstOfMonth.getDay() + 6) % 7; // Пн=0 ... Вс=6
        var startDate = new Date(year, month, 1 - startDay);
  
        var monthName = state.current.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
        monthLabel.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  
        for (var i=0;i<42;i++){
          var date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
  
          var dateKey = formatDateKey(date);
          var dayData = state.overrides[dateKey];
          var status = getStatusForDate(state, date);
  
          var dayEl = cloneTpl(tplDay);
          dayEl.classList.toggle('is-working', status === 'working');
          dayEl.classList.toggle('is-holiday', status === 'holiday');
          if (date.getMonth() !== month) dayEl.classList.add('is-outside');
          if (state.selected && formatDateKey(state.selected) === dateKey) dayEl.classList.add('is-selected');
  
          dayEl.querySelector('.prodcal__dayNumber').textContent = String(date.getDate());
  
          var labelsEl = dayEl.querySelector('.prodcal__dayLabels');
          labelsEl.innerHTML = '';
  
          if (dayData && Array.isArray(dayData.events) && dayData.events.length){
            for (var ei=0; ei<dayData.events.length; ei++){
              var eventId = dayData.events[ei];
              var eventType = state.eventTypes.find(function(item){ return item.id === eventId; });
              if (!eventType) continue;
  
              var labelEl = cloneTpl(tplLabel);
              labelEl.textContent = eventType.name;
              labelEl.style.background = eventType.color;
              labelsEl.appendChild(labelEl);
            }
          }
  
          dayEl.addEventListener('click', (function(d){
            return function(e){ e.stopPropagation(); setSelected(d); };
          })(date));
  
          grid.appendChild(dayEl);
        }
      }
  
      function renderSidebar(){
        var hasSelection = Boolean(state.selected);
  
        if (!hasSelection){
          selectedDateEl.textContent = 'Выберите дату';
          updateStatusButtons(null);
        } else {
          var st = getStatusForDate(state, state.selected);
          updateStatusButtons(st);
          selectedDateEl.textContent = state.selected.toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }
  
        var dateKey = hasSelection ? formatDateKey(state.selected) : null;
        var dayData = hasSelection ? getDayData(state, dateKey) : { events: [] };
  
        eventListEl.innerHTML = '';
  
        // dropdown (details)
        var dropdown = document.createElement('details');
        dropdown.className = 'prodcal__dropdown';
        if (!hasSelection) dropdown.classList.add('is-disabled');
  
        var summary = document.createElement('summary');
        summary.className = 'prodcal__dropdownSummary';
  
        var list = document.createElement('div');
        list.className = 'prodcal__dropdownList';
  
        function updateSummary(){
          var count = hasSelection ? dayData.events.length : 0;
          summary.textContent = count ? ('Выбрано событий: ' + count) : 'Выбрать события';
        }
  
        summary.addEventListener('click', function(e){
          if (!hasSelection){
            e.preventDefault();
            dropdown.open = false;
          }
        });
  
        for (var i=0; i<state.eventTypes.length; i++){
          var eventType = state.eventTypes[i];
          var itemEl = cloneTpl(tplEventItem);
  
          var checkbox = itemEl.querySelector('input[type="checkbox"]');
          var chip = itemEl.querySelector('.prodcal__eventChip');
  
          checkbox.disabled = !hasSelection;
          checkbox.checked = hasSelection ? (dayData.events.indexOf(eventType.id) !== -1) : false;
  
          chip.textContent = eventType.name;
          chip.style.background = eventType.color;
  
          checkbox.addEventListener('change', (function(typeId){
            return function(){
              if (!hasSelection) return;
  
              if (this.checked){
                if (dayData.events.indexOf(typeId) === -1) dayData.events.push(typeId);
              } else {
                dayData.events = dayData.events.filter(function(id){ return id !== typeId; });
              }
  
              var dd = getDayData(state, dateKey);
              dd.events = dayData.events;
  
              renderCalendar();
              updateSummary();
            };
          })(eventType.id));
  
          list.appendChild(itemEl);
        }
  
        dropdown.appendChild(summary);
        dropdown.appendChild(list);
        eventListEl.appendChild(dropdown);
        updateSummary();
  
        // close on outside click (when open)
        var onDocPointerDown = function(e){
          if (!dropdown.open) return;
          var target = e.target;
          if (!(target instanceof Node)) return;
          if (!dropdown.contains(target)) dropdown.open = false;
        };
  
        dropdown.addEventListener('toggle', function(){
          if (dropdown.open){
            document.addEventListener('pointerdown', onDocPointerDown);
          } else {
            document.removeEventListener('pointerdown', onDocPointerDown);
          }
        });
      }
  
      function renderEventTypes(){
        eventTypesEl.innerHTML = '';
  
        for (var i=0;i<state.eventTypes.length;i++){
          var eventType = state.eventTypes[i];
          var row = cloneTpl(tplEventType);
  
          row.querySelector('.prodcal__dot').style.background = eventType.color;
          row.querySelector('strong').textContent = eventType.name;
  
          var colorInput = row.querySelector('input[type="color"]');
          colorInput.value = eventType.color;
          colorInput.setAttribute('aria-label', 'Цвет события ' + eventType.name);
  
          colorInput.addEventListener('input', (function(typeId){
            return function(){
              var t = state.eventTypes.find(function(x){ return x.id === typeId; });
              if (!t) return;
              t.color = this.value;
              renderCalendar();
              renderSidebar();
              renderEventTypes();
            };
          })(eventType.id));
  
          eventTypesEl.appendChild(row);
        }
      }
  
      function renderAll(){
        renderCalendar();
        renderSidebar();
        renderEventTypes();
      }
  
      for (var i=0;i<statusButtons.length;i++){
        statusButtons[i].addEventListener('click', function(){
          if (!state.selected) return;
          var dateKey = formatDateKey(state.selected);
          var dayData = getDayData(state, dateKey);
          dayData.status = this.getAttribute('data-pc-status');
          renderAll();
        });
      }
  
      eventForm.addEventListener('submit', function(e){
        e.preventDefault();
        var fd = new FormData(eventForm);
        var title = String(fd.get('title') || '').trim();
        if (!title) return;
        var color = String(fd.get('color') || '#6c7bff');
  
        var id = title
          .toLowerCase()
          .replace(/\s+/g,'-')
          .replace(/[^a-z0-9\-а-яё]/gi,'') + '-' + Date.now();
  
        state.eventTypes.push({ id: id, name: title, color: color });
  
        eventForm.reset();
        var c = eventForm.querySelector('input[type="color"]');
        if (c) c.value = color;
  
        renderAll();
      });
  
      // clear selection: click on empty area of calendar card
      if (calendarCard){
        calendarCard.addEventListener('click', function(e){
          var t = e.target;
          if (t && t.closest && t.closest('.prodcal__day')) return;
          clearSelected();
        });
      }
  
      renderAll();
    }
  
    function shiftMonth(delta){
      if (!prodCalendarState) ensureState(new Date());
      var next = new Date(prodCalendarState.current);
      next.setMonth(next.getMonth() + delta);
      prodCalendarState.current = new Date(next.getFullYear(), next.getMonth(), 1);
    }
  
    function goToday(baseDate){
      var now = baseDate instanceof Date ? baseDate : new Date();
      if (!prodCalendarState) ensureState(now);
      prodCalendarState.current = new Date(now.getFullYear(), now.getMonth(), 1);
      prodCalendarState.selected = new Date(now);
    }
  
    window.ProdCalendar = {
      render: render,
      ensureState: ensureState,
      getState: getState,
      shiftMonth: shiftMonth,
      goToday: goToday
    };
  })();
  
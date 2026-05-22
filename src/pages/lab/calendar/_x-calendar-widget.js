/**
 * @author Turtlemay <turtlemay.us>
 * @version 1.4
 * @see https://turtlemay.neocities.org/lab/calendar/
 */

document.head.prepend(function () {
  const template = document.createElement("template");
  template.setAttribute("name", "x-calendar-widget");
  template.innerHTML = /* html */`
    <div class="calendar-widget" role="presentation">
      <div class="calendar-header">
        <div class="calendar-month-name">
          <slot name="month"></slot>
          <slot name="year"></slot>
        </div>
      </div>
      <div class="calendar-weekdays">
        <div>Su</div>
        <div>M</div>
        <div>Tu</div>
        <div>W</div>
        <div>Th</div>
        <div>F</div>
        <div>Sa</div>
      </div>
      <div class="calendar-days" data-name="days-container">
        <template name="calendar-day">
          <div class="calendar-day">
            <slot name="day-number"></slot>
          </div>
        </template>
      </div>
    </div>
  `;
  return template;
}());

document.head.prepend(function () {
  const style = document.createElement("style");
  style.classList.add("x-calendar-widget");
  style.innerHTML = /* css */`
    x-calendar-widget {
      display: block;

      .calendar-widget {
        --borders: 1px solid black;
        --gaps: 3px;
        font: 12pt monospace;
        display: flex;
        flex-direction: column;
        justify-content: safe center;
        gap: var(--gaps);
        padding: var(--gaps);
        background: cornflowerblue;
        border: var(--borders);
      }

      .calendar-header {
        font-weight: bold;
        padding: var(--gaps);
        display: flex;
        justify-content: center;
        border: var(--borders);
        background: white;
        color: black;

        .calendar-month-name {
          flex: 1;
          text-align: center;
        }
      }

      .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        place-items: center;
      }

      .calendar-days {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--gaps);
      }

      .calendar-day {
        padding: var(--gaps);
        min-height: 1em;
        display: flex;
        align-items: center;
        justify-content: center;
        border: var(--borders);
        background: white;
        color: black;

        &:has(slot) {
          opacity: 0.25;

          &::after {
            content: "0";
            visibility: hidden;
            user-select: none;
          }
        }

        &.today {
          color: red;
        }
      }
    }
  `;
  return style;
}());

const today = new Date();

customElements.define("x-calendar-widget", class extends HTMLElement {
  #resetDate = today;
  #rendered = false;

  get date() {
    return new Date(this.getAttribute("date") || today);
  }
  set date(v) {
    this.setAttribute("date", v.toString());
  }

  get sixWeek() {
    return this.getAttribute("sixweek") === "true";
  }
  set sixWeek(v) {
    if (v) this.setAttribute("sixweek", "true");
    else this.removeAttribute("sixweek");
  }

  get short() {
    return this.getAttribute("short") === "true";
  }
  set short(v) {
    if (v) this.setAttribute("short", "true");
    else this.removeAttribute("short");
  }

  #render() {
    const date = this.date

    // Render from calendar template.
    const calendarTemplate = document.querySelector(`template[name="x-calendar-widget"]`);
    this.innerHTML = "";
    this.append(calendarTemplate.content.cloneNode(true));

    // Set calendar month name and calendar year.
    this.querySelector(`slot[name="month"]`)
      .replaceWith(date.toLocaleDateString("en-US", { month: this.short ? "short" : "long" }));
    this.querySelector(`slot[name="year"]`)
      .replaceWith(date.toLocaleDateString("en-US", { year: "numeric" }));

    // Get template and container to render days into.
    const calendarDayTemplate = this.querySelector(`template[name="calendar-day"]`);
    const daysContainer = this.querySelector(`[data-name="days-container"]`);

    // Render days from template.
    const month = new Date(date.getFullYear(), date.getMonth());
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const startOnWeekDayNum = month.getDay();
    const neededSlots = startOnWeekDayNum + daysInMonth;
    const numWeeks = this.sixWeek ? 6 : Math.ceil(neededSlots / 7);
    const allDays = new Array(7 * numWeeks).fill();
    daysContainer.innerHTML = "";
    daysContainer.append(...allDays.map((v, i) => {
      const t = document.createElement("template");
      t.append(document.importNode(calendarDayTemplate.content, true));
      return t.firstElementChild;
    }));

    // Update day numbers, offset from first week day.
    const days = Array.from(daysContainer.querySelectorAll(".calendar-day"));
    let currentDayElem;
    for (let i = 1, d = startOnWeekDayNum; i <= daysInMonth; i++, d++) {
      const isThisYear = date.getFullYear() === today.getFullYear();
      const isThisMonth = date.getMonth() === today.getMonth();
      const isThisDay = i === today.getDate();
      const isToday = isThisYear && isThisMonth && isThisDay;
      if (isToday) currentDayElem = days[d];
      days[d].querySelector(`slot[name="day-number"]`).replaceWith(`${i}`);
    }

    // Update current day style.
    currentDayElem?.classList.add("today");

    this.#rendered = true;
  }

  goNextMonth(d = this.date) {
    this.date = new Date(d.getFullYear(), d.getMonth() + 1);
  }

  goPrevMonth(d = this.date) {
    this.date = new Date(d.getFullYear(), d.getMonth() - 1);
  }

  resetMonth() {
    this.date = this.#resetDate;
  }

  static observedAttributes = ["date", "sixweek", "short"];

  attributeChangedCallback() {
    if (this.#rendered) this.#render();
  }

  connectedCallback() {
    this.#resetDate = this.date;
    this.#render();
  }
});
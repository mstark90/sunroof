import './App.css'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';

import 'bootstrap-icons/font/bootstrap-icons.css';

import { getSunroofEvents } from './api';
import type { SunroofCalendar, SunroofEvent } from './model';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { MainSidebar } from './components/main-sidebar';

function App() {

  const eventCalendar = useRef<FullCalendar | null>(null);

  const calendars = useRef<SunroofCalendar[]>([]);

  const [kioskMode, setKioskMode] = useState(false);

  const loadEvent = useCallback((calendar: SunroofCalendar, event: SunroofEvent) => {
    if (!eventCalendar.current) {
      return;
    }

    const api = eventCalendar.current.getApi();

    if (api.getEventById(event.id!)) {
      return;
    }

    const start = moment(event.start!);
    const end = moment(event.end!);
    api.addEvent({
      id: event.id!,
      start: start.toDate(),
      end: end.toDate(),
      title: event.title!,
      allDay: event.allDay,
      resourceIds: [],
      display: "auto",
      editable: false,
      startEditable: false,
      durationEditable: false,
      color: calendar.backgroundColor,
      textColor: calendar.textColor,
      classNames: [],
      styles: [],
      extendedProps: {

      }
    });
  }, [eventCalendar]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    setKioskMode(!!searchParams.get("kiosk"));
  }, []);

  const eventLoader = useCallback(() => {
    calendars.current.forEach(c => {
      getSunroofEvents(c)
        .then((response) => {
          response.data.forEach(e => {
            loadEvent(c, e);
          })
        });
    })
  }, [loadEvent]);

  const unselectCalendar = useCallback((calendar: SunroofCalendar) => {
    const index = calendars.current.findIndex(c => c.id === calendar.id);

    if(index < 0) {
      return;
    }

    calendars.current.splice(index, 1);
    
    if (!eventCalendar.current) {
      return;
    }

    const api = eventCalendar.current.getApi();

    api.removeAllEvents();

    eventLoader();
  }, [eventLoader]);

  const selectCalendar = useCallback((calendar: SunroofCalendar) => {
    calendars.current.push(calendar);
    
    if (!eventCalendar.current) {
      return;
    }

    const api = eventCalendar.current.getApi();

    api.removeAllEvents();

    eventLoader();
  }, [eventLoader]);

  React.useEffect(() => {

    const intervalId = setInterval(eventLoader, 60 * 1000);

    eventLoader();

    return () => {
      clearInterval(intervalId);
    };
  }, [calendars, eventLoader, loadEvent]);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top" hidden={kioskMode}>
        <div className='container-fluid'>
          <a className="navbar-brand" href="#">Sunroof</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item active">
                <a className="nav-link" href="/">Home</a>
              </li>
            </ul>
          </div>
        </div>

      </nav>
      <div className='main-container'>
        <div className='row'>
          <div className='col-lg-4 col-md-12'>
            <MainSidebar
              onEventAdded={loadEvent}
              onCalendarsLoaded={(c) => calendars.current = c}
              onCalendarSelected={selectCalendar}
              onCalendarUnselected={unselectCalendar}
            />
          </div>
          <div className='col-lg-8 col-md-12'>
            <FullCalendar
              ref={eventCalendar}
              plugins={[dayGridPlugin, bootstrap5Plugin, timeGridPlugin]}
              themeSystem='bootstrap5'
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: 'dayGridMonth,timeGridDay' // user can switch between the two
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default App

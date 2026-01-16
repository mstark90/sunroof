import './App.css'
import React, { useCallback, useEffect, useId, useState } from 'react';
import moment from 'moment';

import { type Calendar } from '@event-calendar/core';
// Import CSS if your build tool supports it
import '@event-calendar/core/index.css';
import { getSunroofCalendars, getSunroofEvents } from './api';
import type { SunroofCalendar, SunroofEvent } from './model';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'
import { MainSidebar } from './components/main-sidebar';

function App() {

  const eventCalendarId = useId();
  const [eventCalendar, setEventCalendar] = useState<Calendar | undefined>(undefined);

  const [calendars, setCalendars] = useState<SunroofCalendar[]>([]);
  const [calendar, setCalendar] = useState<SunroofCalendar | undefined>(undefined);

  const [kioskMode, setKioskMode] = useState(false);

  const loadEvent = useCallback((event: SunroofEvent) => {
    if (!eventCalendar) {
      return;
    }

    if (eventCalendar.getEventById(event.id!)) {
      return;
    }

    const start = moment(event.start!);
    const end = moment(event.end!);
    eventCalendar.addEvent({
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
      backgroundColor: "green",
      textColor: "#fff",
      color: "#779ECB",
      classNames: [],
      styles: [],
      extendedProps: {

      }
    });
  }, [eventCalendar]);

  const getButtonClassName = (c: SunroofCalendar) => {
    if (!calendar || c.id !== calendar.id) {
      return "btn btn-outline-primary";
    }

    return "btn btn-primary";
  };

  const changeCalendar = (calendar: SunroofCalendar) => {
    eventCalendar?.getEvents().forEach(e => {
      eventCalendar?.removeEventById(e.id);
    });

    setCalendar(calendar);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    setKioskMode(!!searchParams.get("kiosk"));
  }, []);

  React.useEffect(() => {

    const getCalendars = () => {
      getSunroofCalendars()
        .then((response) => {
          setCalendars(response.data);

          if (response.data.length === 0) {
            return;
          }

          const firstCalendar = response.data[0];

          setCalendar(oldCalendar => {
            if (!kioskMode || !firstCalendar || !oldCalendar || oldCalendar.id === firstCalendar.id) {
              return oldCalendar;
            }

            return firstCalendar;
          });
        });
    }

    const intervalId = setInterval(getCalendars, 60 * 1000);

    getCalendars();

    return () => {
      clearInterval(intervalId);
    };

  }, [eventCalendar, kioskMode]);

  React.useEffect(() => {
    if (!eventCalendar) {
      return () => {

      };
    }

    const eventLoader = () => {
      if (!eventCalendar || !calendar) {
        return;
      }

      getSunroofEvents(calendar)
        .then((response) => {
          response.data.forEach(e => {
            loadEvent(e);
          })
        })
    };

    const intervalId = setInterval(eventLoader, 60 * 1000);

    eventLoader();

    return () => {
      clearInterval(intervalId);
    };
  }, [calendar, eventCalendar, loadEvent]);

  return (
    <>
      <div className='row'>
        <div className='col-lg-4 col-md-12'>
          <MainSidebar onEventAdded={loadEvent} />
        </div>
        <div className='col-lg-4 col-md-12'>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
          />
        </div>
      </div>
      <div className='container-fluid main-container'>
        <div className='row'>
          <div className={calendar ? 'col-3 gapped' : 'col-2'} hidden={kioskMode}>
            
          </div>
          <div className={calendar ? 'col-9' : 'col-10'} hidden={calendars.length === 0}>
          </div>
        </div>
        <div id={eventCalendarId} className='event-calendar'>

        </div>
      </div>
    </>
  )
}

export default App

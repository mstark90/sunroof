import './App.css'
import React, { useCallback, useEffect, useId, useLayoutEffect, useState } from 'react';
import moment from 'moment';

import { type Calendar, createCalendar, DayGrid, destroyCalendar, List, TimeGrid } from '@event-calendar/core';
// Import CSS if your build tool supports it
import '@event-calendar/core/index.css';
import { AddCalendarDialog, type AddCalendarCallbackContext } from './add-calendar/add-calendar';
import { createSunroofCalendar, createSunroofEvent, getSunroofCalendars, getSunroofEvents } from './api';
import type { SunroofCalendar, SunroofEvent } from './model';
import type { AxiosResponse } from 'axios';
import { AddEventDialog, type AddEventCallbackContext } from './add-event/add-event';

function App() {

  const eventCalendarId = useId();
  const [eventCalendarRef, setEventCalendarRef] = useState<HTMLDivElement | null>();
  const [eventCalendar, setEventCalendar] = useState<Calendar | undefined>(undefined);

  const [addingCalendar, setAddingCalendar] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);

  const [calendars, setCalendars] = useState<SunroofCalendar[]>([]);
  const [calendar, setCalendar] = useState<SunroofCalendar | undefined>(undefined);

  const [kioskMode, setKioskMode] = useState(false);

  const loadEvent = useCallback((event: SunroofEvent) => {
    if(!eventCalendar) {
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

  const onCreateCalendar = useCallback((calendar: SunroofCalendar, context: AddCalendarCallbackContext) => {
    createSunroofCalendar(calendar)
      .then((newCalendar: AxiosResponse<SunroofCalendar, unknown>) => {
        setCalendars(calendars => [...calendars, newCalendar.data]);

        context.success("The calendar was successfully created.");
      })
      .catch(() => {
        context.error("Could not create the calendar at this time.");
      });
  }, []);

  const onCreateEvent = useCallback((event: SunroofEvent, context: AddEventCallbackContext) => {
    if(!calendar) {
      return;
    }

    createSunroofEvent(calendar, event)
      .then((newEvent: AxiosResponse<SunroofEvent, unknown>) => {
        loadEvent(newEvent.data);

        context.success("The event was successfully created.");
      })
      .catch(() => {
        context.error("Could not create the event at this time.");
      });
  }, [calendar, loadEvent]);

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

  useEffect(() => {
    setEventCalendarRef(document.getElementById(eventCalendarId) as HTMLDivElement);
  }, [eventCalendarId]);

  useLayoutEffect(() => {
    if (!eventCalendarRef) {
      return () => {

      };
    }

    const ec = createCalendar(
      // HTML element the calendar will be mounted to
      eventCalendarRef,
      // Array of plugins
      [TimeGrid, DayGrid, List],
      // Options object
      {
        scrollTime: '09:00:00',
        view: "timeGridDay",
        events: []
      }
    );

    setTimeout(() => {
      setEventCalendar(() => ec);
    }, 500);

    return () => {
      destroyCalendar(ec);
    }
  }, [eventCalendarRef]);

  React.useEffect(() => {
    getSunroofCalendars()
      .then((response) => {
        setCalendars(response.data);
      });

  }, [eventCalendar]);

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
      <div className='container-fluid main-container'>
        <div className='row'>
          <div className={calendar ? 'col-3 gapped' : 'col-2'} hidden={kioskMode}>
            <button className='btn btn-primary' onClick={() => setAddingCalendar(true)}>
              Add Calendar
            </button>
            <button className='btn btn-primary' onClick={() => setAddingEvent(true)} hidden={!calendar}>
              Add Event
            </button>
          </div>
          <div className={calendar ? 'col-9' : 'col-10'} hidden={calendars.length === 0}>
            <div className="btn-group" role="group" aria-label="Calendars">
              {
                calendars.map(c => (<button key={c.id} type="button" className={getButtonClassName(c)} onClick={() => changeCalendar(c)}>{c.name}</button>))
              }
            </div>
          </div>
        </div>
        <div id={eventCalendarId} className='event-calendar'>

        </div>
      </div>
      <AddCalendarDialog visible={addingCalendar} onCreate={onCreateCalendar} onClose={() => setAddingCalendar(false)} />
      <AddEventDialog visible={addingEvent} onCreate={onCreateEvent} onClose={() => setAddingEvent(false)} />
    </>
  )
}

export default App

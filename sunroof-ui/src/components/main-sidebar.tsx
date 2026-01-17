import { useCallback, useEffect, useId, useState } from "react";
import type { SunroofCalendar, SunroofEvent } from "../model";
import { AddCalendarDialog, type AddCalendarCallbackContext } from "../add-calendar/add-calendar";
import { AddEventDialog, type AddEventCallbackContext } from "../add-event/add-event";
import { createSunroofCalendar, createSunroofEvent, getSunroofCalendars } from "../api";
import type { AxiosResponse } from "axios";

interface MainSidebarProps {
  onEventAdded?: (calendar: SunroofCalendar, event: SunroofEvent) => void;
  onCalendarsLoaded?: (calendars: SunroofCalendar[]) => void;
  onCalendarSelected?: (calendar: SunroofCalendar) => void;
  onCalendarUnselected?: (calendar: SunroofCalendar) => void;
}

interface CalendarControlProps {
  calendar: SunroofCalendar;
  onSelected?: (selected: boolean) => void;
}

function CalendarControl({
  calendar,
  onSelected = () => {}
}: CalendarControlProps) {
  const id = useId();
  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        checked
        id={id}
        onChange={(e) => onSelected(e.target.checked)} 
      />
      <label className="form-check-label" htmlFor={id}>
        {calendar.name}
      </label>
    </div>
  )
}

export function MainSidebar({
  onEventAdded = () => {},
  onCalendarsLoaded = () => {},
  onCalendarSelected = () => {},
  onCalendarUnselected = () => {}
}: MainSidebarProps) {

  const [addingCalendar, setAddingCalendar] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);

  const [calendars, setCalendars] = useState<SunroofCalendar[]>([]);

  useEffect(() => {
  
      const getCalendars = () => {
        getSunroofCalendars()
          .then((response) => {
            setCalendars(response.data);
            onCalendarsLoaded(response.data);
          });
      }
  
      const intervalId = setInterval(getCalendars, 60 * 1000);
  
      getCalendars();
  
      return () => {
        clearInterval(intervalId);
      };
  
    }, []);

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

  /*const onCreateEvent = useCallback((event: SunroofEvent, context: AddEventCallbackContext) => {
    if (!calendar) {
      return;
    }

    createSunroofEvent(calendar, event)
      .then((newEvent: AxiosResponse<SunroofEvent, unknown>) => {
        if(onEventAdded) {
          onEventAdded(newEvent.data);
        }

        context.success("The event was successfully created.");
      })
      .catch(() => {
        context.error("Could not create the event at this time.");
      });
  }, [onEventAdded]); */

  /*<button className='btn btn-primary' onClick={() => setAddingEvent(true)} hidden={!calendar}>
        Add Event
      </button>*/

  return (<>
    <div className="container-fluid">
      <button className='btn btn-primary' onClick={() => setAddingCalendar(true)}>
        Add Calendar
      </button>
      <br />
      <br />
      {
        calendars.map(c => {
          const callback = (selected: boolean) => {
            if(selected) {
              onCalendarSelected(c);
            } else {
              onCalendarUnselected(c);
            }
          }
          return (<CalendarControl calendar={c} onSelected={callback} />)
        })
      }
    </div>
    <AddCalendarDialog visible={addingCalendar} onCreate={onCreateCalendar} onClose={() => setAddingCalendar(false)} />
    <AddEventDialog visible={addingEvent} onCreate={() => { }} onClose={() => setAddingEvent(false)} />
  </>);
}
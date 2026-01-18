import { useCallback, useEffect, useId, useState } from "react";
import type { SunroofCalendar, SunroofEvent } from "../model";
import { AddCalendarDialog, type AddCalendarCallbackContext } from "../add-calendar/add-calendar";
import { AddEventDialog } from "../add-event/add-event";
import { createSunroofCalendar, getSunroofCalendars } from "../api";
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
  onSelected = () => { }
}: CalendarControlProps) {
  const id = useId();
  const [ selected, setSelected ] = useState(true);

  const checkChanged = (value: boolean) => {
    setSelected(value);
    onSelected(value);
  }

  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        checked={selected}
        id={id}
        onChange={(e) => checkChanged(e.target.checked)}
      />
      <label className="form-check-label" htmlFor={id}>
        {calendar.name}
      </label>
    </div>
  )
}

export function MainSidebar({
  onEventAdded = () => { },
  onCalendarsLoaded = () => { },
  onCalendarSelected = () => { },
  onCalendarUnselected = () => { }
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

  }, [onCalendarsLoaded]);

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

  return (<>
    <div className="container-fluid">
      <div className="row">
        <div className="col">
          <button className='btn btn-primary' onClick={() => setAddingCalendar(true)}>
            Add Calendar
          </button>
        </div>
        <div className="col">
          <button className='btn btn-primary' onClick={() => setAddingEvent(true)}>
            Add Event
          </button>
        </div>
      </div>
      <br />
      <h2>
        Calendars
      </h2>
      <br />
      {
        calendars.map(c => {
          const callback = (selected: boolean) => {
            if (selected) {
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
    <AddEventDialog calendars={calendars} visible={addingEvent} onCreate={onEventAdded} onClose={() => setAddingEvent(false)} />
  </>);
}
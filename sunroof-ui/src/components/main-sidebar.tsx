import { useCallback, useEffect, useId, useState } from "react";
import type { SunroofCalendar, SunroofEvent } from "../model";
import { AddCalendarDialog, type AddCalendarCallbackContext } from "../add-calendar/add-calendar";
import { AddEventDialog, type AddEventCallbackContext } from "../add-event/add-event";
import { createSunroofCalendar, createSunroofEvent } from "../api";
import type { AxiosResponse } from "axios";
import type { Calendar } from "@event-calendar/core";

interface MainSidebarProps {
  onEventAdded?: (event: SunroofEvent) => void;
  onCalendarSelected?: (calendar: SunroofCalendar) => void;
  onCalendarUnselected?: (calendar: SunroofCalendar) => void;
}

function CalendarControl({

}) {
  
}

export function MainSidebar({
  onEventAdded,
  onCalendarSelected,
  onCalendarUnselected
 }: MainSidebarProps) {

  const [addingCalendar, setAddingCalendar] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);

  const [calendars, setCalendars] = useState<SunroofCalendar[]>([]);

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

  return (<div className="calendar-container">
    <div className="container-fluid">
      <button className='btn btn-primary' onClick={() => setAddingCalendar(true)}>
        Add Calendar
      </button>
      {
        calendars.map
      }
    </div>
    <AddCalendarDialog visible={addingCalendar} onCreate={onCreateCalendar} onClose={() => setAddingCalendar(false)} />
    <AddEventDialog visible={addingEvent} onCreate={() => {}} onClose={() => setAddingEvent(false)} />
  </div>);
}
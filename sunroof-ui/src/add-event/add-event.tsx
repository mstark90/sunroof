import { Modal } from "bootstrap";
import { useCallback, useEffect, useId, useState } from "react";
import type { SunroofCalendar, SunroofEvent } from "../model";
import { DateTimePicker } from "@mui/x-date-pickers";
import type { Moment } from "moment";
import moment from "moment";
import { createSunroofEvent } from "../api";

export interface AddEventCallbackContext {
  success: (message: string) => void;
  error: (message: string) => void;
}

interface AddEventDialogProps {
  calendars: SunroofCalendar[];
  visible?: boolean;
  onClose: () => void;
  onCreate: (calendar: SunroofCalendar, event: SunroofEvent) => void;
}

export function AddEventDialog({
  calendars,
  visible = false,
  onCreate = () => { },
  onClose = () => { },
}: AddEventDialogProps) {
  const id = useId();
  const titleId = useId();
  const allDayId = useId();

  const [modalRef, setModalRef] = useState<HTMLDivElement | null>();
  const [modal, setModal] = useState<Modal | undefined>(undefined);

  const [calendarId, setCalendarId] = useState<string | undefined>(undefined);

  const [title, setTitle] = useState<string | undefined>(undefined);
  const [start, setStart] = useState<Moment | null>(moment());
  const [end, setEnd] = useState<Moment | null>(moment());
  const [allDay, setAllDay] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    setModalRef(document.getElementById(id) as HTMLDivElement);
  }, [id]);

  useEffect(() => {
    if (!modalRef) {
      return () => {

      };
    }

    const newModal = new Modal(modalRef);

    setModal(newModal);

    return () => {
      newModal.dispose();
    }
  }, [modalRef]);

  useEffect(() => {
    if (visible) {
      modal?.show();
    } else {
      modal?.hide();
    }
  }, [visible, modal]);

  const beginAdd = useCallback(() => {
    const request: SunroofEvent = {
      title,
      start: start?.utc().toISOString(),
      end: end?.utc().toISOString(),
      allDay
    };

    setSuccessMessage(undefined);
    setErrorMessage(undefined);

    const calendar = calendars.find(c => c.id === calendarId);

    if(!calendar) {
      setErrorMessage('There was no calendar selected to add an event to.');
    }

    createSunroofEvent(calendar!, request)
      .then((response) => {
        setSuccessMessage('The event was successfully created.');

        onCreate(calendar!, response.data);
      })
      .catch(error => {
        setErrorMessage(error.response.message)
      });
  }, [allDay, calendarId, calendars, end, onCreate, start, title]);

  const handleClose = useCallback(() => {
    modal?.hide();
    onClose();
  }, [modal, onClose]);

  return (
    <div id={id} className="modal">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Calendar</h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-success" role="alert" hidden={!successMessage}>
              {successMessage}
            </div>
            <div className="alert alert-warning" role="alert" hidden={!errorMessage}>
              {errorMessage}
            </div>
            <div className="mb-3">
              <label htmlFor="calendar" className="form-label">
                Calendar
              </label>
              <select
                id="calendar"
                className="form-select"
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}>
                {
                  calendars.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))
                }
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor={titleId} className="form-label">Title</label>
              <input type="text" className="form-control" id={titleId} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="row">
              <div className="col-6">
                <DateTimePicker
                  label="Start"
                  value={start}
                  onChange={(newValue) => setStart(newValue)}
                />
              </div>
              <div className="col-6">
                <DateTimePicker
                  label="End"
                  value={end}
                  onChange={(newValue) => setEnd(newValue)}
                />
              </div>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id={allDayId} checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
              <label className="form-check-label" htmlFor={allDayId}>
                All Day
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
            <button type="button" className="btn btn-primary" onClick={() => beginAdd()}>Add</button>
          </div>
        </div>
      </div>
    </div>
  )
}
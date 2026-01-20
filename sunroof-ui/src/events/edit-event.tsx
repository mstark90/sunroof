import { Modal } from "bootstrap";
import { useCallback, useEffect, useId, useState } from "react";
import type { SunroofCalendar, SunroofEvent } from "../model";
import { DateTimePicker } from "@mui/x-date-pickers";
import type { Moment } from "moment";
import moment from "moment";
import { updateSunroofEvent } from "../api";

export interface AddEventCallbackContext {
  success: (message: string) => void;
  error: (message: string) => void;
}

interface EditEventDialogProps {
  ref?: React.RefObject<EditEventDialogRef|undefined>;
  onUpdate: (calendar: SunroofCalendar, event: SunroofEvent) => void;
}

export interface EditEventDialogRef {
  toggle(): void;
  loadEvent(calendar: SunroofCalendar, event: SunroofEvent): void;
}

export function EditEventDialog({
  ref,
  onUpdate = () => { },
}: EditEventDialogProps) {
  const id = useId();
  const titleId = useId();
  const allDayId = useId();

  const [modalRef, setModalRef] = useState<HTMLDivElement | null>();
  const [modal, setModal] = useState<Modal | undefined>(undefined);
  const [visible, setVisible] = useState(false);

  const [calendar, setCalendar] = useState<SunroofCalendar | undefined>(undefined);
  const [eventId, setEventId] = useState<string | undefined>(undefined);
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
  }, [modal, visible]);

  useEffect(() => {
    if(!ref) {
      return;
    }

    ref.current = {
      toggle() {
        setVisible(v => !v);
      },
      loadEvent(calendar, event) {
        setCalendar(calendar);
        setEventId(event.id);
        setTitle(event.title);
        setStart(moment(event.start));
        setEnd(moment(event.end));
        setAllDay(event.allDay ?? false);
      },
    }
    
  }, [ref])

  const beginEdit = useCallback(() => {
    const request: SunroofEvent = {
      id: eventId,
      title,
      start: start?.utc().toISOString(),
      end: end?.utc().toISOString(),
      allDay
    };

    setSuccessMessage(undefined);
    setErrorMessage(undefined);

    updateSunroofEvent(calendar!, request)
      .then((response) => {
        setSuccessMessage('The event was successfully updated.');

        onUpdate(calendar!, response.data);
      })
      .catch(error => {
        setErrorMessage(error.response.message)
      });
  }, [allDay, calendar, end, eventId, onUpdate, start, title]);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <div id={id} className="modal">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Event</h5>
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
              <input
                id="calendar"
                type="text"
                className="form-control"
                disabled
                value={calendar?.name} />
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
                  onChange={(newValue) => setStart(moment(newValue))}
                />
              </div>
              <div className="col-6">
                <DateTimePicker
                  label="End"
                  value={end}
                  onChange={(newValue) => setEnd(moment(newValue))}
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
            <button type="button" className="btn btn-primary" onClick={() => beginEdit()}>Update</button>
          </div>
        </div>
      </div>
    </div>
  )
}
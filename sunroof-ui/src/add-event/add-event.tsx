import { Modal } from "bootstrap";
import { useCallback, useEffect, useId, useState } from "react";
import type { SunroofEvent } from "../model";
import { DateTimePicker } from "@mui/x-date-pickers";
import type { Moment } from "moment";
import moment from "moment";

export interface AddEventCallbackContext {
  success: (message: string) => void;
  error: (message: string) => void;
}

interface AddEventDialogProps {
  visible?: boolean;
  onClose: () => void;
  onCreate: (event: SunroofEvent, context: AddEventCallbackContext) => void;
}

export function AddEventDialog({
  visible = false,
  onCreate = () => { },
  onClose = () => { },
}: AddEventDialogProps) {
  const id = useId();
  const titleId = useId();
  const allDayId = useId();

  const [modalRef, setModalRef] = useState<HTMLDivElement | null>();
  const [modal, setModal] = useState<Modal | undefined>(undefined);

  const [title, setTitle] = useState<string | undefined>(undefined);
  const [start, setStart] = useState<Moment>(moment());
  const [end, setEnd] = useState<Moment>(moment());
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
      start: start.utc().toISOString(),
      end: end.utc().toISOString(),
      allDay
    };

    setSuccessMessage(undefined);
    setErrorMessage(undefined);

    const context: AddEventCallbackContext = {
      success(message) {
        setSuccessMessage(message);
      },
      error(message) {
        setErrorMessage(message);
      }
    }

    onCreate(request, context);
  }, [allDay, end, onCreate, start, title]);

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
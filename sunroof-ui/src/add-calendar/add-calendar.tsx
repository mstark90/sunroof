import { Modal } from "bootstrap";
import { useCallback, useEffect, useId, useState } from "react";
import type { SunroofCalendar } from "../model";

export interface AddCalendarCallbackContext {
  success: (message: string) => void;
  error: (message: string) => void;
}

interface AddCalendarDialogProps {
  visible?: boolean;
  onClose: () => void;
  onCreate: (calendar: SunroofCalendar, context: AddCalendarCallbackContext) => void;
}

export function AddCalendarDialog({
  visible = false,
  onCreate = () => { },
  onClose = () => {},
}: AddCalendarDialogProps) {
  const id = useId();
  const nameId = useId();

  const [modalRef, setModalRef] = useState<HTMLDivElement | null>();
  const [modal, setModal] = useState<Modal | undefined>(undefined);

  const [name, setName] = useState<string | undefined>(undefined);

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
    const request: SunroofCalendar = {
      name
    };

    setSuccessMessage(undefined);
    setErrorMessage(undefined);

    const context: AddCalendarCallbackContext = {
      success(message) {
        setSuccessMessage(message);
      },
      error(message) {
        setErrorMessage(message);
      }
    }

    onCreate(request, context);
  }, [name, onCreate]);

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
              <label htmlFor={nameId} className="form-label">Name</label>
              <input type="text" className="form-control" id={nameId} value={name} onChange={(e) => setName(e.target.value)} />
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
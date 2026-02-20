import React, { useEffect } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function ModalAlert({ type = "success", message, onClose, autoCloseMs = 5000, closeOnBackdropClick = false }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [message, onClose, autoCloseMs]);

  if (!message) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        background: "rgba(0,0,0,0.2)",
        position: "fixed",
        top: 0, left: 0, width: "100vw", height: "100vh",
        zIndex: 1055
      }}
      onClick={closeOnBackdropClick ? () => onClose && onClose() : undefined}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 shadow">
          <div className="modal-body d-flex align-items-center">
            {type === "success" ? (
              <span className="me-3 text-success fs-2">
                <i className="bi bi-check-circle-fill"></i>
              </span>
            ) : (
              <span className="me-3 text-danger fs-2">
                <i className="bi bi-x-circle-fill"></i>
              </span>
            )}
            <div className="flex-grow-1">{message}</div>
            {onClose && (
              <button type="button" className="btn-close ms-2" onClick={onClose}></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

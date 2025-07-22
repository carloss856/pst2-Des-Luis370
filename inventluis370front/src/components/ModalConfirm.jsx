import React from "react";

export default function ModalConfirm({ show, title, children, onClose }) {
  return (
    <div className={`modal fade ${show ? "show d-block" : ""}`} tabIndex="-1" style={{ background: show ? "rgba(0,0,0,0.5)" : "none" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
};

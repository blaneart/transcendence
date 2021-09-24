import React from 'react';

import './modal.styles.scss';

interface IModalProps {
    handleClose: React.MouseEventHandler<HTMLButtonElement>,
    show: boolean,
    children: any
}
const Modal: React.FC<IModalProps> = ({ handleClose, show, children }) => {
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        {children}
        <button type="button" className="mb-3 px-6 py-2" onClick={handleClose}>
          Close
        </button>
      </section>
    </div>
  );
};

export default Modal;
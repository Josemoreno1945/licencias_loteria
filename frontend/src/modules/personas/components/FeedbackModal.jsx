import React from 'react';
import {
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CSpinner,
  CButton,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

const FeedbackModal = ({
  visible,
  type, // 'loading', 'success', 'error'
  message,
  onClose,
  redirectOnSuccess,
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (type === 'success' && redirectOnSuccess) {
      navigate(redirectOnSuccess);
    }
    onClose();
  };

  if (!visible) return null;

  // Render for Loading Modal
  if (type === 'loading') {
    return (
      <CModal visible={visible} backdrop="static" keyboard={false} alignment="center">
        <CModalHeader closeButton={false}>Cargando...</CModalHeader>
        <CModalBody className="d-flex align-items-center gap-3">
          <CSpinner color="primary" />
          <span>{message || 'Procesando...'}</span>
        </CModalBody>
      </CModal>
    );
  }

  // Render for Success or Error Modal
  const isError = type === 'error';

  return (
    <CModal visible={visible} backdrop="static" keyboard={false} onClose={handleClose}>
      <CModalHeader closeButton={false} className={isError ? 'bg-danger text-white' : 'bg-success text-white'}>
        {isError ? 'Error' : 'Éxito'}
      </CModalHeader>
      <CModalBody>
        {Array.isArray(message) ? (
          <ul className="mb-0">
            {message.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        ) : (
          <div>{String(message)}</div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color={isError ? 'secondary' : 'primary'} onClick={handleClose}>
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default FeedbackModal;

import React from 'react';
import './ModalAlert.css'; // Optionnel, pour le style

function ModalAlert({ show, message, onClose }) {
  // Si "show" est false, on ne rend rien (aucun HTML).
  if (!show) return null;

  return (
    <div className="modal-alert-overlay">
      <div className="modal-alert-content">
        <p>{message}</p>
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}

export default ModalAlert;

import React from "react";
import { Modal, Button } from "@mui/material";

const DeleteConfirmationModal = ({ open, onClose, onConfirm }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ backgroundColor: "white", borderRadius: 8, padding: 20 }}>
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this task?</p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          <Button variant="contained" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;

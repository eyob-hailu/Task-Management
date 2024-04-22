import React from "react";
import { Modal, Button } from "@mui/material";

const TaskDeletedModal = ({ open, onClose }) => {
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
        <h2>Task Deleted Successfully</h2>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default TaskDeletedModal;

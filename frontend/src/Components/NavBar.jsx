import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Modal } from "@mui/material"; // Import Button and Modal from Material UI
import { useLogout } from "../Hook/useLogout";
import { useAuthContext } from "../Hook/useAuthContext";

const NavBar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const [showModal, setShowModal] = useState(false); // State to control the modal

  // Function to handle opening the modal
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Function to handle logout
  const handleLogout = () => {
    logout();
    handleCloseModal(); // Close the modal after logout
  };

  return (
    <header>
      <div className="container">
        <Link to="/">
          <h1>Task Management</h1>
        </Link>
        <nav>
          {user && (
            <div>
              <span>{user.email}</span>
              {/* Button to open the modal */}
              <Button onClick={handleOpenModal} variant="contained">
                Log out
              </Button>
            </div>
          )}
          {!user && (
            <div>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </div>
          )}
        </nav>
      </div>
      {/* Confirmation dialog modal */}
      <Modal
        open={showModal}
        onClose={handleCloseModal}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: 20,
            backgroundColor: "white",
            borderRadius: 8,
            maxWidth: 300,
          }}
        >
          <h2>Confirm Logout</h2>
          <p>Are you sure you want to log out?</p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {/* Button to cancel logout */}
            <Button onClick={handleCloseModal} variant="outlined">
              Cancel
            </Button>
            {/* Button to confirm logout */}
            <Button onClick={handleLogout} variant="contained" color="error">
              Logout
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default NavBar;

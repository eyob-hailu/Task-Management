import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import { useAuthContext } from "./Hook/useAuthContext";
// pages & components
import Home from "./Components/Home";
import NavBar from "./Components/NavBar"
import EditTask from "./Components/EditTask";
import Login from "./User/Login";
import Signup from "./User/Signup";

function App(){
 const { user } = useAuthContext();
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
        <div className="pages">
          <Routes>
          <Route 
              path="/"
              element={user ? <Home /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/signup" 
              element={!user ? <Signup /> : <Navigate to="/" />} 
            />
            <Route path="/edit/:taskId" element={!user ?<Login /> :<EditTask/>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;

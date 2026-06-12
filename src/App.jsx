import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GuestPage from "./pages/GuestPage";
import DashboardPage from "./pages/Dashboard";

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/request" element={<GuestPage/>}/>
        <Route path="/dashboard" element={<DashboardPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
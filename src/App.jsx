import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LearnMore from "./pages/LearnMore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ShipmentDetail from "./pages/ShipmentDetail";
import PostShipment from "./pages/PostShipment";

import "./styles/global.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/about"
                    element={<About />}
                />

                <Route
                    path="/contact"
                    element={<Contact />}
                />

                <Route
                    path="/learn-more"
                    element={<LearnMore />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
<Route
    path="/shipments/new"
    element={<PostShipment />}
/>

                {/* Shipment Details */}
                <Route
                    path="/shipments/:id"
                    element={<ShipmentDetail />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
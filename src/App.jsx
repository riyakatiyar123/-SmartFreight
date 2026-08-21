import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ShipmentDetail from './pages/ShipmentDetail'
import PostShipment from './pages/PostShipment'

function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
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

                <Route
                    path="/shipments/:id"
                    element={<ShipmentDetail />}
                />

            </Routes>

        </BrowserRouter>
    )
}

export default App
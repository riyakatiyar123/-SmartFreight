const express = require('express')
const router = express.Router()

const {
    getAllShipments,
    getShipment,
    createShipment,
    updateShipment,
    deleteShipment,
    markPickedUp,
    completeDelivery
} = require('../controllers/shipments')

const verifyToken = require('../middleware/auth')


// =====================================================
// GET ALL SHIPMENTS
// =====================================================
// Shipper:
//     → sees their own shipments
//
// Transporter:
//     → sees posted shipments
//     → sees shipments assigned to them
// =====================================================

router.get(
    '/',
    verifyToken,
    getAllShipments
)


// =====================================================
// GET ONE SHIPMENT
// =====================================================
// Used by ShipmentDetail.jsx
//
// Example:
// GET /shipments/b7351856-f97f-45aa-ba56-84d94882f6cc
// =====================================================

router.get(
    '/:id',
    verifyToken,
    getShipment
)


// =====================================================
// CREATE SHIPMENT
// =====================================================
// SHIPPER ONLY
//
// POST /shipments
//
// Creates:
// posted
// =====================================================

router.post(
    '/',
    verifyToken,
    createShipment
)


// =====================================================
// UPDATE SHIPMENT
// =====================================================
//
// PUT /shipments/:id
//
// Used for general shipment updates.
// =====================================================

router.put(
    '/:id',
    verifyToken,
    updateShipment
)


// =====================================================
// DELETE / CANCEL SHIPMENT
// =====================================================
//
// DELETE /shipments/:id
//
// Only the shipper who owns the shipment
// can delete/cancel it.
// =====================================================

router.delete(
    '/:id',
    verifyToken,
    deleteShipment
)


// =====================================================
// TRANSPORTER MARKS SHIPMENT AS PICKED UP
// =====================================================
//
// assigned
//     ↓
// in_transit
//
// PUT /shipments/:id/pickup
//
// Only the assigned transporter can do this.
// =====================================================

router.put(
    '/:id/pickup',
    verifyToken,
    markPickedUp
)


// =====================================================
// SHIPPER CONFIRMS DELIVERY
// =====================================================
//
// in_transit
//     ↓
// delivered
//
// POST /shipments/:id/complete
//
// Body example:
//
// {
//     "delivery_condition": "good",
//     "delivery_notes": "Goods received safely",
//     "rating": 5,
//     "comment": "Very good transporter"
// }
//
// OR:
//
// {
//     "delivery_condition": "damaged",
//     "delivery_notes": "Two boxes were damaged",
//     "rating": 3,
//     "comment": "Delivery was damaged"
// }
// =====================================================

router.post(
    '/:id/complete',
    verifyToken,
    completeDelivery
)


module.exports = router
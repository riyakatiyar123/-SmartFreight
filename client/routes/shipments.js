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

router.get(
    '/',
    verifyToken,
    getAllShipments
)


// =====================================================
// GET ONE SHIPMENT
// =====================================================

router.get(
    '/:id',
    verifyToken,
    getShipment
)


// =====================================================
// CREATE SHIPMENT
// =====================================================

router.post(
    '/',
    verifyToken,
    createShipment
)


// =====================================================
// UPDATE SHIPMENT
// =====================================================

router.put(
    '/:id',
    verifyToken,
    updateShipment
)


// =====================================================
// DELETE / CANCEL SHIPMENT
// =====================================================

router.delete(
    '/:id',
    verifyToken,
    deleteShipment
)


// =====================================================
// TRANSPORTER MARKS SHIPMENT AS PICKED UP
// =====================================================

router.put(
    '/:id/pickup',
    verifyToken,
    markPickedUp
)


// =====================================================
// SHIPPER CONFIRMS DELIVERY
// =====================================================

router.post(
    '/:id/complete',
    verifyToken,
    completeDelivery
)


module.exports = router
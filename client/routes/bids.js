const express = require('express')

const router = express.Router()

const verifyToken =
    require('../middleware/auth')

const {
    getBids,
    getDashboardBidCount,
    placeBid,
    acceptBid,
    withdrawBid
} = require('../controllers/bids')


// ========================================
// DASHBOARD BID COUNT
// ========================================

router.get(
    '/dashboard/count',
    verifyToken,
    getDashboardBidCount
)


// ========================================
// GET BIDS FOR SHIPMENT
// ========================================

router.get(
    '/:shipmentId',
    verifyToken,
    getBids
)


// ========================================
// PLACE BID
// ========================================

router.post(
    '/',
    verifyToken,
    placeBid
)


// ========================================
// ACCEPT BID
// ========================================

router.put(
    '/:id/accept',
    verifyToken,
    acceptBid
)


// ========================================
// WITHDRAW BID
// ========================================
//
// Transporter can withdraw their own
// pending bid.
//
// PUT /bids/:id/withdraw
//
// Allowed:
// pending → withdrawn
//
// Not allowed:
// accepted → withdrawn
// rejected → withdrawn
// already withdrawn → withdrawn
// ========================================

router.put(
    '/:id/withdraw',
    verifyToken,
    withdrawBid
)


module.exports = router
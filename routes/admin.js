const express = require('express');
const router = express.Router();

const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { getAllOrders ,getAllPendingOrdersFromDesigners , getAllCompletedOrders} = require('../services/orderService');

// can access http://localhost:3000/creative-select - Done  
// can access http://localhost:3000/delivery/available-orders - Done

// admin should see all the orders placed - done -  /admin/all-orders
// admin should see all the  pending / completed orders - /admin/all-pending-orders , /admin/allcompleted-orders
// admin should be able to view the user order ui http://localhost:3000/order-view/677d9525bfcf1c5589d92f00
// admin should be able to view the designer order ui http://localhost:3000/delivery/orders/675d95f3c68ec1b848c85402
// can add events / designs and see the list of events / designs only by admin -- added


// add pagination to the orders
router.get('/all-orders',verifyToken,verifyAdmin, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const orders = await getAllOrders(page);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        next(error);
    }
    });

// get all pending orders from designers 

router.get('/all-pending-orders',verifyToken,verifyAdmin, async (req, res, next) => {
    try {
        const orders = await getAllPendingOrdersFromDesigners();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        next(error);
    }
    });


router.get('/all-completed-orders',verifyToken,verifyAdmin, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const orders = await getAllCompletedOrders(page);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        next(error);
    }
    }
    );
    
module.exports = router;   

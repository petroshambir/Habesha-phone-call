
// const express = require('express');
// const router = express.Router();

// const authMiddleware = require('../middleware/AuthMiddleware.js');
// const paymentController = require('../controllers/paymentController.js');

// router.get('/packages', paymentController.getPackages);

// router.post(
//     '/checkout',
//     authMiddleware,
//     paymentController.createCheckout
// );

// router.get(
//     '/verify/:paymentId',
//     authMiddleware,
//     paymentController.verifyPayment
// );

// module.exports = router;


// const express = require('express');
// const router = express.Router();

// const authMiddleware = require('../middleware/AuthMiddleware.js');
// const paymentController = require('../controllers/paymentController.js');

// router.get(
//     '/packages',
//     paymentController.getPackages
// );

// router.post(
//     '/checkout',
//     authMiddleware,
//     paymentController.createCheckout
// );

// router.get(
//     '/verify/:paymentId',
//     authMiddleware,
//     paymentController.verifyPayment
// );

// module.exports = router;


// const express = require('express');
// const router = express.Router();

// const authMiddleware = require('../middleware/AuthMiddleware.js');
// const paymentController = require('../controllers/paymentController.js');

// // Public: show available calling-minute packages.
// router.get(
//     '/packages',
//     paymentController.getPackages
// );

// // Protected: create a checkout for the logged-in user.
// router.post(
//     '/checkout',
//     authMiddleware,
//     paymentController.createCheckout
// );

// // Protected: verify payment and credit minutes only once.
// router.get(
//     '/verify/:paymentId',
//     authMiddleware,
//     paymentController.verifyPayment
// );

// module.exports = router;

// const express = require('express');
// const router = express.Router();

// const authMiddleware = require('../middleware/AuthMiddleware.js');
// const paymentController = require('../controllers/paymentController.js');

// // Public: list packages and configured payment providers.
// router.get(
//     '/packages',
//     paymentController.getPackages
// );

// // Protected: create a checkout for the authenticated user.
// router.post(
//     '/checkout',
//     authMiddleware,
//     paymentController.createCheckout
// );

// // Protected: verify payment using the backend/provider API.
// router.get(
//     '/verify/:paymentId',
//     authMiddleware,
//     paymentController.verifyPayment
// );

// module.exports = router;

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/AuthMiddleware.js');
const paymentController = require('../controllers/paymentController.js');

// Public payment information
router.get('/packages', paymentController.getPackages);
router.get('/methods', paymentController.getPaymentMethods);

// Authenticated payment operations
router.post(
    '/checkout',
    authMiddleware,
    paymentController.createCheckout
);

router.get(
    '/verify/:paymentId',
    authMiddleware,
    paymentController.verifyPayment
);

module.exports = router;
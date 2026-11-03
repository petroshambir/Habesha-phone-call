
// const axios = require('axios');
// const crypto = require('crypto');
// const mongoose = require('mongoose');

// const Payment = require('../Models/Payment.js');
// const User = require('../Models/User.js');

// const PACKAGES = {
//     '15-minutes': { minutes: 15, amount: 300 },
//     '25-minutes': { minutes: 25, amount: 600 },
//     '60-minutes': { minutes: 60, amount: 1200 }
// };

// const CHAPA_API = 'https://api.chapa.global/v2';

// const getPrivateKey = () => {
//     if (!process.env.CHAPA_PRIVATE_KEY) {
//         throw new Error('CHAPA_PRIVATE_KEY is not configured.');
//     }

//     return process.env.CHAPA_PRIVATE_KEY;
// };

// const parseMinutes = (value) => {
//     const match = /^(\d+):([0-5]\d)$/.exec(
//         String(value || '0:00')
//     );

//     if (!match) {
//         throw new Error('Stored user minutes have an invalid format.');
//     }

//     return (Number(match[1]) * 60) + Number(match[2]);
// };

// const formatMinutes = (totalSeconds) => {
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;

//     return `${minutes}:${String(seconds).padStart(2, '0')}`;
// };

// exports.getPackages = async (req, res) => {
//     return res.json({
//         success: true,
//         currency: 'USD',
//         packages: Object.entries(PACKAGES).map(([id, item]) => ({
//             id,
//             minutes: item.minutes,
//             price: item.amount / 100,
//             currency: 'USD'
//         }))
//     });
// };

// exports.createCheckout = async (req, res) => {
//     const { packageId } = req.body;

//     const selectedPackage = PACKAGES[packageId];

//     if (!selectedPackage) {
//         return res.status(400).json({
//             success: false,
//             msg: 'Invalid package selected.'
//         });
//     }

//     let payment;

//     try {
//         const privateKey = getPrivateKey();

//         const merchantReference =
//             `HT${crypto.randomBytes(8).toString('hex')}`;

//         payment = await Payment.create({
//             user: req.user._id,
//             packageId,
//             minutes: selectedPackage.minutes,
//             amount: selectedPackage.amount,
//             currency: 'USD',
//             merchantReference,
//             status: 'pending'
//         });

//         const response = await axios.post(
//             `${CHAPA_API}/payments/hosted`,
//             {
//                 amount: selectedPackage.amount,
//                 currency: 'USD',
//                 merchant_reference: merchantReference,
//                 customer: {
//                     email: req.user.email,
//                     phone_number: req.user.phoneNumber
//                 },
//                 return_url: process.env.CHAPA_RETURN_URL,
//                 meta: {
//                     paymentId: payment._id.toString(),
//                     packageId
//                 },
//                 customization: {
//                     title: 'HabeshaTele',
//                     description: `${selectedPackage.minutes} calling minutes`
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${privateKey}`,
//                     'Content-Type': 'application/json',
//                     'Idempotency-Key': merchantReference
//                 },
//                 timeout: 20000
//             }
//         );

//         const checkoutUrl = response.data?.data?.checkout_url;

//         if (
//             response.data?.status !== 'success' ||
//             typeof checkoutUrl !== 'string' ||
//             !checkoutUrl.startsWith('https://')
//         ) {
//             throw new Error('Payment provider did not return a valid checkout URL.');
//         }

//         payment.checkoutUrl = checkoutUrl;

//         const urlParts = new URL(checkoutUrl);
//         payment.providerReference =
//             urlParts.pathname.split('/').filter(Boolean).pop() ||
//             merchantReference;

//         await payment.save();

//         return res.status(201).json({
//             success: true,
//             paymentId: payment._id,
//             checkoutUrl: payment.checkoutUrl,
//             status: payment.status
//         });
//     } catch (err) {
//         console.error(
//             'Create Checkout Error:',
//             err.response?.data || err.message
//         );

//         if (payment) {
//             payment.status = 'failed';
//             await payment.save().catch(saveErr => {
//                 console.error('Payment save error:', saveErr.message);
//             });
//         }

//         return res.status(502).json({
//             success: false,
//             msg: 'Could not initialize payment. Please try again.'
//         });
//     }
// };

// exports.verifyPayment = async (req, res) => {
//     const { paymentId } = req.params;

//     if (!mongoose.isValidObjectId(paymentId)) {
//         return res.status(400).json({
//             success: false,
//             msg: 'Invalid payment ID.'
//         });
//     }

//     let session;

//     try {
//         const payment = await Payment.findOne({
//             _id: paymentId,
//             user: req.user._id
//         });

//         if (!payment) {
//             return res.status(404).json({
//                 success: false,
//                 msg: 'Payment not found.'
//             });
//         }

//         if (payment.status === 'paid') {
//             return res.json({
//                 success: true,
//                 paid: true,
//                 minutes: payment.minutes,
//                 msg: 'Payment already verified.'
//             });
//         }

//         if (payment.status !== 'pending') {
//             return res.status(409).json({
//                 success: false,
//                 paid: false,
//                 status: payment.status,
//                 msg: 'This payment cannot be verified in its current state.'
//             });
//         }

//         const reference =
//             payment.providerReference || payment.merchantReference;

//         const response = await axios.get(
//             `${CHAPA_API}/payments/${encodeURIComponent(reference)}/verify`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${getPrivateKey()}`
//                 },
//                 timeout: 20000
//             }
//         );

//         const result = response.data?.data;

//         if (
//             response.data?.status !== 'success' ||
//             result?.status !== 'SUCCESS'
//         ) {
//             return res.status(202).json({
//                 success: true,
//                 paid: false,
//                 status: result?.status || 'PENDING',
//                 msg: 'Payment has not been confirmed yet.'
//             });
//         }

//         const paidAmount = Number(result.amount);
//         const paidCurrency = String(result.currency || '').toUpperCase();

//         if (
//             !Number.isFinite(paidAmount) ||
//             paidAmount !== payment.amount ||
//             paidCurrency !== payment.currency
//         ) {
//             console.error('Payment amount/currency mismatch:', {
//                 paymentId: payment._id.toString(),
//                 expectedAmount: payment.amount,
//                 receivedAmount: result.amount,
//                 expectedCurrency: payment.currency,
//                 receivedCurrency: result.currency
//             });

//             return res.status(400).json({
//                 success: false,
//                 paid: false,
//                 msg: 'Payment details do not match the expected order.'
//             });
//         }

//         if (
//             result.merchant_reference &&
//             result.merchant_reference !== payment.merchantReference
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 paid: false,
//                 msg: 'Payment reference mismatch.'
//             });
//         }

//         session = await mongoose.startSession();

//         await session.withTransaction(async () => {
//             const currentPayment = await Payment.findOne({
//                 _id: payment._id,
//                 user: req.user._id
//             }).session(session);

//             if (!currentPayment) {
//                 throw new Error('Payment record not found.');
//             }

//             if (currentPayment.status === 'paid') {
//                 return;
//             }

//             if (currentPayment.status !== 'pending') {
//                 throw new Error('Payment is already being processed.');
//             }

//             const user = await User.findById(req.user._id).session(session);

//             if (!user) {
//                 throw new Error('User account not found.');
//             }

//             const currentSeconds = parseMinutes(user.minutes);
//             const addedSeconds = currentPayment.minutes * 60;

//             user.minutes = formatMinutes(currentSeconds + addedSeconds);
//             currentPayment.status = 'paid';
//             currentPayment.verifiedAt = new Date();

//             await user.save({ session });
//             await currentPayment.save({ session });
//         });

//         const finalPayment = await Payment.findById(payment._id);

//         return res.json({
//             success: true,
//             paid: finalPayment.status === 'paid',
//             status: finalPayment.status,
//             minutes: finalPayment.minutes,
//             msg: 'Payment verified.'
//         });
//     } catch (err) {
//         console.error('Verify Payment Error:', err.response?.data || err.message);

//         return res.status(500).json({
//             success: false,
//             paid: false,
//             msg: 'Could not verify payment. Please try again.'
//         });
//     } finally {
//         if (session) {
//             await session.endSession();
//         }
//     }
// };



// const axios = require('axios');
// const crypto = require('crypto');
// const mongoose = require('mongoose');

// const Payment = require('../Models/Payment.js');
// const User = require('../Models/User.js');

// const PACKAGES = Object.freeze({
//     '15-minutes': { minutes: 15, amount: 300 },
//     '25-minutes': { minutes: 25, amount: 600 },
//     '60-minutes': { minutes: 60, amount: 1200 }
// });

// // Database amounts are stored as USD cents.
// // $3.00 = 300, $6.00 = 600, $12.00 = 1200.
// const CURRENCY = 'USD';
// const TIMEOUT = 20000;

// const PROVIDERS = ['chapa', 'flutterwave', 'stripe', 'paypal'];

// const CHAPA_API = 'https://api.chapa.global/v2';
// const FLUTTERWAVE_API = 'https://api.flutterwave.com/v3';
// const STRIPE_API = 'https://api.stripe.com/v1';

// const getProvider = (value) => {
//     const provider = String(value || 'chapa').toLowerCase();

//     return PROVIDERS.includes(provider) ? provider : null;
// };

// const getRequiredEnv = (name) => {
//     const value = process.env[name];

//     if (!value || !value.trim()) {
//         throw new Error(`${name} is not configured.`);
//     }

//     return value.trim();
// };

// const isHttpsUrl = (value) => {
//     try {
//         return new URL(value).protocol === 'https:';
//     } catch {
//         return false;
//     }
// };

// const addQuery = (baseUrl, values) => {
//     if (!isHttpsUrl(baseUrl)) {
//         throw new Error('A valid HTTPS return URL is required.');
//     }

//     const url = new URL(baseUrl);

//     for (const [key, value] of Object.entries(values)) {
//         url.searchParams.set(key, String(value));
//     }

//     return url.toString();
// };

// const parseMinutes = (value) => {
//     const match = /^(\d+):([0-5]\d)$/.exec(
//         String(value || '00:00')
//     );

//     if (!match) {
//         throw new Error('Stored user minutes have an invalid format.');
//     }

//     return Number(match[1]) * 60 + Number(match[2]);
// };

// const formatMinutes = (totalSeconds) => {
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;

//     return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
// };

// const getPaymentConfig = (provider) => {
//     if (provider === 'chapa') {
//         return Boolean(
//             process.env.CHAPA_PRIVATE_KEY &&
//             process.env.CHAPA_RETURN_URL
//         );
//     }

//     if (provider === 'flutterwave') {
//         return Boolean(
//             process.env.FLUTTERWAVE_SECRET_KEY &&
//             process.env.FLUTTERWAVE_REDIRECT_URL
//         );
//     }

//     if (provider === 'stripe') {
//         return Boolean(
//             process.env.STRIPE_SECRET_KEY &&
//             process.env.STRIPE_SUCCESS_URL &&
//             process.env.STRIPE_CANCEL_URL
//         );
//     }

//     if (provider === 'paypal') {
//         return Boolean(
//             process.env.PAYPAL_CLIENT_ID &&
//             process.env.PAYPAL_CLIENT_SECRET &&
//             process.env.PAYPAL_RETURN_URL &&
//             process.env.PAYPAL_CANCEL_URL
//         );
//     }

//     return false;
// };

// const getPayPalBaseUrl = () => {
//     const environment = String(
//         process.env.PAYPAL_ENV || 'sandbox'
//     ).toLowerCase();

//     if (environment === 'sandbox') {
//         return 'https://api-m.sandbox.paypal.com';
//     }

//     if (environment === 'live') {
//         return 'https://api-m.paypal.com';
//     }

//     throw new Error('PAYPAL_ENV must be sandbox or live.');
// };

// const getPayPalAccessToken = async () => {
//     const clientId = getRequiredEnv('PAYPAL_CLIENT_ID');
//     const clientSecret = getRequiredEnv('PAYPAL_CLIENT_SECRET');

//     const response = await axios.post(
//         `${getPayPalBaseUrl()}/v1/oauth2/token`,
//         'grant_type=client_credentials',
//         {
//             auth: {
//                 username: clientId,
//                 password: clientSecret
//             },
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             timeout: TIMEOUT
//         }
//     );

//     if (!response.data?.access_token) {
//         throw new Error('PayPal did not return an access token.');
//     }

//     return response.data.access_token;
// };

// const createProviderCheckout = async (payment, user) => {
//     const amountInDollars = (payment.amount / 100).toFixed(2);
//     const merchantReference = payment.merchantReference;
//     const paymentId = payment._id.toString();

//     // CHAPA
//     if (payment.provider === 'chapa') {
//         const response = await axios.post(
//             `${CHAPA_API}/payments/hosted`,
//             {
//                 amount: payment.amount,
//                 currency: payment.currency,
//                 merchant_reference: merchantReference,
//                 customer: {
//                     email: user.email,
//                     phone_number: user.phoneNumber
//                 },
//                 return_url: addQuery(
//                     getRequiredEnv('CHAPA_RETURN_URL'),
//                     { paymentId }
//                 ),
//                 meta: {
//                     paymentId,
//                     packageId: payment.packageId
//                 },
//                 customization: {
//                     title: 'HabeshaTele',
//                     description: `${payment.minutes} calling minutes`
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${getRequiredEnv('CHAPA_PRIVATE_KEY')}`,
//                     'Content-Type': 'application/json',
//                     'Idempotency-Key': payment.idempotencyKey
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const data = response.data?.data;
//         const checkoutUrl = data?.checkout_url;

//         if (
//             response.data?.status !== 'success' ||
//             !isHttpsUrl(checkoutUrl)
//         ) {
//             throw new Error('Chapa did not return a valid checkout URL.');
//         }

//         payment.checkoutUrl = checkoutUrl;
//         payment.providerReference =
//             data.chapa_reference ||
//             data.reference ||
//             new URL(checkoutUrl).pathname.split('/').filter(Boolean).pop() ||
//             merchantReference;

//         return;
//     }

//     // FLUTTERWAVE
//     if (payment.provider === 'flutterwave') {
//         const response = await axios.post(
//             `${FLUTTERWAVE_API}/payments`,
//             {
//                 tx_ref: merchantReference,
//                 amount: amountInDollars,
//                 currency: payment.currency,
//                 redirect_url: addQuery(
//                     getRequiredEnv('FLUTTERWAVE_REDIRECT_URL'),
//                     { paymentId }
//                 ),
//                 customer: {
//                     email: user.email,
//                     phonenumber: user.phoneNumber,
//                     name: user.email
//                 },
//                 customizations: {
//                     title: 'HabeshaTele',
//                     description: `${payment.minutes} calling minutes`
//                 },
//                 meta: {
//                     paymentId,
//                     packageId: payment.packageId
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${getRequiredEnv('FLUTTERWAVE_SECRET_KEY')}`,
//                     'Content-Type': 'application/json'
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const data = response.data?.data;

//         if (
//             response.data?.status !== 'success' ||
//             !isHttpsUrl(data?.link)
//         ) {
//             throw new Error('Flutterwave did not return a valid checkout URL.');
//         }

//         payment.checkoutUrl = data.link;
//         payment.providerReference = merchantReference;
//         payment.providerMetadata = {
//             checkoutCreated: true
//         };

//         return;
//     }

//     // STRIPE
//     if (payment.provider === 'stripe') {
//         const successBase = getRequiredEnv('STRIPE_SUCCESS_URL');
//         const cancelBase = getRequiredEnv('STRIPE_CANCEL_URL');

//         if (!isHttpsUrl(successBase) || !isHttpsUrl(cancelBase)) {
//             throw new Error('Stripe return URLs must use HTTPS.');
//         }

//         // Stripe expects the literal {CHECKOUT_SESSION_ID} placeholder.
//         const separator = successBase.includes('?') ? '&' : '?';

//         const successUrl =
//             `${successBase}${separator}paymentId=${encodeURIComponent(paymentId)}` +
//             '&session_id={CHECKOUT_SESSION_ID}';

//         const stripeBody = new URLSearchParams({
//             mode: 'payment',
//             success_url: successUrl,
//             cancel_url: addQuery(cancelBase, { paymentId }),
//             customer_email: user.email,
//             client_reference_id: paymentId,
//             'metadata[paymentId]': paymentId,
//             'metadata[merchantReference]': merchantReference,
//             'line_items[0][quantity]': '1',
//             'line_items[0][price_data][currency]': payment.currency.toLowerCase(),
//             'line_items[0][price_data][unit_amount]': String(payment.amount),
//             'line_items[0][price_data][product_data][name]':
//                 `HabeshaTele ${payment.minutes} calling minutes`,
//             'payment_intent_data[metadata][paymentId]': paymentId,
//             'payment_intent_data[metadata][merchantReference]':
//                 merchantReference
//         });

//         const response = await axios.post(
//             `${STRIPE_API}/checkout/sessions`,
//             stripeBody.toString(),
//             {
//                 auth: {
//                     username: getRequiredEnv('STRIPE_SECRET_KEY'),
//                     password: ''
//                 },
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                     'Idempotency-Key': payment.idempotencyKey
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         if (
//             !response.data?.id ||
//             !isHttpsUrl(response.data?.url)
//         ) {
//             throw new Error('Stripe did not return a valid Checkout Session.');
//         }

//         payment.checkoutUrl = response.data.url;
//         payment.providerReference = response.data.id;

//         return;
//     }

//     // PAYPAL
//     if (payment.provider === 'paypal') {
//         const accessToken = await getPayPalAccessToken();

//         const response = await axios.post(
//             `${getPayPalBaseUrl()}/v2/checkout/orders`,
//             {
//                 intent: 'CAPTURE',
//                 purchase_units: [
//                     {
//                         reference_id: merchantReference,
//                         custom_id: paymentId,
//                         invoice_id: merchantReference,
//                         description: `HabeshaTele ${payment.minutes} calling minutes`,
//                         amount: {
//                             currency_code: payment.currency,
//                             value: amountInDollars
//                         }
//                     }
//                 ],
//                 application_context: {
//                     brand_name: 'HabeshaTele',
//                     user_action: 'PAY_NOW',
//                     return_url: addQuery(
//                         getRequiredEnv('PAYPAL_RETURN_URL'),
//                         { paymentId }
//                     ),
//                     cancel_url: addQuery(
//                         getRequiredEnv('PAYPAL_CANCEL_URL'),
//                         { paymentId }
//                     )
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json',
//                     'PayPal-Request-Id': payment.idempotencyKey
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const approvalLink = response.data?.links?.find(
//             (link) => link.rel === 'approve'
//         )?.href;

//         if (
//             !response.data?.id ||
//             !isHttpsUrl(approvalLink)
//         ) {
//             throw new Error('PayPal did not return a valid approval URL.');
//         }

//         payment.checkoutUrl = approvalLink;
//         payment.providerReference = response.data.id;

//         return;
//     }

//     throw new Error('Unsupported payment provider.');
// };

// const getVerifiedProviderPayment = async (payment, req) => {
//     // CHAPA: verify on Chapa's server.
//     if (payment.provider === 'chapa') {
//         const reference =
//             payment.providerReference || payment.merchantReference;

//         const response = await axios.get(
//             `${CHAPA_API}/payments/${encodeURIComponent(reference)}/verify`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${getRequiredEnv('CHAPA_PRIVATE_KEY')}`
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const data = response.data?.data;

//         if (response.data?.status !== 'success' || !data) {
//             throw new Error('Chapa verification did not return valid data.');
//         }

//         if (data.status !== 'SUCCESS') {
//             return { paid: false, providerStatus: data.status || 'PENDING' };
//         }

//         if (
//             String(data.merchant_reference || '') !== payment.merchantReference ||
//             Number(data.amount) !== payment.amount ||
//             String(data.currency || '').toUpperCase() !== payment.currency
//         ) {
//             throw new Error('Chapa payment details do not match the order.');
//         }

//         return {
//             paid: true,
//             transactionId: data.processor_reference || data.chapa_reference
//         };
//     }

//     // FLUTTERWAVE: the redirect provides transaction_id.
//     // This ID is untrusted until verified against Flutterwave.
//     if (payment.provider === 'flutterwave') {
//         const transactionId = String(req.query?.transaction_id || '');

//         if (!/^\d+$/.test(transactionId)) {
//             throw new Error(
//                 'Flutterwave transaction_id is required for verification.'
//             );
//         }

//         const response = await axios.get(
//             `${FLUTTERWAVE_API}/transactions/${transactionId}/verify`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${getRequiredEnv('FLUTTERWAVE_SECRET_KEY')}`
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const data = response.data?.data;

//         if (response.data?.status !== 'success' || !data) {
//             throw new Error('Flutterwave verification did not return valid data.');
//         }

//         if (data.status !== 'successful') {
//             return {
//                 paid: false,
//                 providerStatus: data.status || 'PENDING'
//             };
//         }

//         if (
//             String(data.tx_ref || '') !== payment.merchantReference ||
//             Number(data.amount) !== payment.amount / 100 ||
//             String(data.currency || '').toUpperCase() !== payment.currency
//         ) {
//             throw new Error('Flutterwave payment details do not match the order.');
//         }

//         return {
//             paid: true,
//             transactionId: String(data.id)
//         };
//     }

//     // STRIPE: retrieve the Checkout Session directly from Stripe.
//     if (payment.provider === 'stripe') {
//         const sessionId = payment.providerReference;

//         if (!sessionId || !sessionId.startsWith('cs_')) {
//             throw new Error('Stripe Checkout Session reference is invalid.');
//         }

//         const response = await axios.get(
//             `${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`,
//             {
//                 auth: {
//                     username: getRequiredEnv('STRIPE_SECRET_KEY'),
//                     password: ''
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const data = response.data;

//         if (
//             data.client_reference_id !== payment._id.toString() ||
//             data.metadata?.merchantReference !== payment.merchantReference ||
//             data.metadata?.paymentId !== payment._id.toString()
//         ) {
//             throw new Error('Stripe session does not match this payment.');
//         }

//         if (data.payment_status !== 'paid') {
//             return {
//                 paid: false,
//                 providerStatus: data.payment_status || data.status || 'PENDING'
//             };
//         }

//         if (
//             Number(data.amount_total) !== payment.amount ||
//             String(data.currency || '').toUpperCase() !== payment.currency
//         ) {
//             throw new Error('Stripe payment details do not match the order.');
//         }

//         return {
//             paid: true,
//             transactionId: String(data.payment_intent || data.id)
//         };
//     }

//     // PAYPAL: capture the order only after the buyer has approved it.
//     if (payment.provider === 'paypal') {
//         const orderId = payment.providerReference;

//         if (!orderId) {
//             throw new Error('PayPal order reference is missing.');
//         }

//         const accessToken = await getPayPalAccessToken();
//         const baseUrl = getPayPalBaseUrl();

//         const orderResponse = await axios.get(
//             `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         let order = orderResponse.data;

//         if (order.status === 'APPROVED') {
//             const captureResponse = await axios.post(
//                 `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
//                 {},
//                 {
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                         'Content-Type': 'application/json',
//                         'PayPal-Request-Id':
//                             `capture-${payment.idempotencyKey}`
//                     },
//                     timeout: TIMEOUT
//                 }
//             );

//             order = captureResponse.data;
//         }

//         const purchaseUnit = order.purchase_units?.find(
//             (unit) =>
//                 unit.custom_id === payment._id.toString() &&
//                 unit.reference_id === payment.merchantReference
//         );

//         if (!purchaseUnit) {
//             throw new Error('PayPal order does not match this payment.');
//         }

//         const capture = purchaseUnit.payments?.captures?.find(
//             (item) => item.status === 'COMPLETED'
//         );

//         if (order.status !== 'COMPLETED' || !capture) {
//             return {
//                 paid: false,
//                 providerStatus: order.status || 'PENDING'
//             };
//         }

//         if (
//             Number(capture.amount?.value) !== payment.amount / 100 ||
//             String(capture.amount?.currency_code || '').toUpperCase() !==
//                 payment.currency
//         ) {
//             throw new Error('PayPal payment details do not match the order.');
//         }

//         return {
//             paid: true,
//             transactionId: String(capture.id || order.id)
//         };
//     }

//     throw new Error('Unsupported payment provider.');
// };

// // Add minutes exactly once. Requires MongoDB transaction support.
// const creditPaymentOnce = async (paymentId, userId, transactionId) => {
//     const session = await mongoose.startSession();

//     try {
//         await session.withTransaction(async () => {
//             const payment = await Payment.findOne({
//                 _id: paymentId,
//                 user: userId
//             }).session(session);

//             if (!payment) {
//                 throw new Error('Payment record not found.');
//             }

//             if (payment.status === 'paid' || payment.creditedAt) {
//                 return;
//             }

//             if (!['pending', 'processing'].includes(payment.status)) {
//                 throw new Error('Payment is not eligible for crediting.');
//             }

//             const user = await User.findById(payment.user).session(session);

//             if (!user) {
//                 throw new Error('User account not found.');
//             }

//             const totalSeconds =
//                 parseMinutes(user.minutes) + payment.minutes * 60;

//             user.minutes = formatMinutes(totalSeconds);

//             payment.status = 'paid';
//             payment.verifiedAt = new Date();
//             payment.creditedAt = new Date();

//             if (transactionId) {
//                 payment.providerTransactionId = String(transactionId);
//             }

//             await user.save({ session });
//             await payment.save({ session });
//         });
//     } finally {
//         await session.endSession();
//     }

//     return Payment.findById(paymentId);
// };

// // GET /api/payments/packages
// exports.getPackages = async (req, res) => {
//     return res.json({
//         success: true,
//         currency: CURRENCY,
//         packages: Object.entries(PACKAGES).map(([id, item]) => ({
//             id,
//             minutes: item.minutes,
//             price: item.amount / 100,
//             currency: CURRENCY
//         })),
//         providers: PROVIDERS.map((provider) => ({
//             id: provider,
//             available: getPaymentConfig(provider)
//         }))
//     });
// };

// // POST /api/payments/checkout
// // Body: { "packageId": "15-minutes", "provider": "stripe" }
// exports.createCheckout = async (req, res) => {
//     const { packageId } = req.body || {};
//     const provider = getProvider(req.body?.provider);
//     const selectedPackage = PACKAGES[packageId];

//     if (!selectedPackage) {
//         return res.status(400).json({
//             success: false,
//             msg: 'Invalid package selected.'
//         });
//     }

//     if (!provider) {
//         return res.status(400).json({
//             success: false,
//             msg: 'Unsupported payment provider.'
//         });
//     }

//     if (!getPaymentConfig(provider)) {
//         return res.status(503).json({
//             success: false,
//             provider,
//             msg: 'Payment provider environment configuration is incomplete.'
//         });
//     }

//     if (!req.user?._id || !mongoose.isValidObjectId(req.user._id)) {
//         return res.status(401).json({
//             success: false,
//             msg: 'Authentication is required.'
//         });
//     }

//     if (!req.user.email || !req.user.phoneNumber) {
//         return res.status(400).json({
//             success: false,
//             msg: 'Your account needs an email address and phone number.'
//         });
//     }

//     let payment;

//     try {
//         payment = await Payment.create({
//             user: req.user._id,
//             packageId,
//             minutes: selectedPackage.minutes,
//             amount: selectedPackage.amount,
//             currency: CURRENCY,
//             provider,
//             merchantReference: `HT${crypto.randomBytes(8).toString('hex')}`,
//             idempotencyKey: crypto.randomUUID(),
//             status: 'pending'
//         });

//         await createProviderCheckout(payment, req.user);
//         await payment.save();

//         return res.status(201).json({
//             success: true,
//             paymentId: payment._id,
//             provider,
//             checkoutUrl: payment.checkoutUrl,
//             status: payment.status
//         });
//     } catch (err) {
//         console.error(
//             'Create Checkout Error:',
//             err.response?.data || err.message
//         );

//         // Keep a pending record when the provider outcome is uncertain.
//         // Do not assume that a timeout means no checkout was created.
//         if (payment) {
//             payment.failureReason = String(err.message || 'Checkout error')
//                 .slice(0, 500);

//             await payment.save().catch((saveError) => {
//                 console.error('Payment record save error:', saveError.message);
//             });
//         }

//         return res.status(502).json({
//             success: false,
//             paymentId: payment?._id || null,
//             status: payment?.status || null,
//             msg: 'Checkout could not be confirmed. Do not retry automatically; check this payment first.'
//         });
//     }
// };

// // GET /api/payments/verify/:paymentId
// // Flutterwave redirect verification also needs ?transaction_id=...
// exports.verifyPayment = async (req, res) => {
//     const { paymentId } = req.params;

//     if (!mongoose.isValidObjectId(paymentId)) {
//         return res.status(400).json({
//             success: false,
//             msg: 'Invalid payment ID.'
//         });
//     }

//     if (!req.user?._id) {
//         return res.status(401).json({
//             success: false,
//             msg: 'Authentication is required.'
//         });
//     }

//     try {
//         const payment = await Payment.findOne({
//             _id: paymentId,
//             user: req.user._id
//         });

//         if (!payment) {
//             return res.status(404).json({
//                 success: false,
//                 msg: 'Payment not found.'
//             });
//         }

//         if (payment.status === 'paid' || payment.creditedAt) {
//             return res.json({
//                 success: true,
//                 paid: true,
//                 status: 'paid',
//                 minutes: payment.minutes,
//                 msg: 'Payment was already verified.'
//             });
//         }

//         if (!['pending', 'processing'].includes(payment.status)) {
//             return res.status(409).json({
//                 success: false,
//                 paid: false,
//                 status: payment.status,
//                 msg: 'This payment cannot be verified in its current state.'
//             });
//         }

//         const verification = await getVerifiedProviderPayment(payment, req);

//         if (!verification.paid) {
//             return res.status(202).json({
//                 success: true,
//                 paid: false,
//                 status: verification.providerStatus || 'PENDING',
//                 msg: 'Payment has not been confirmed yet.'
//             });
//         }

//         const finalPayment = await creditPaymentOnce(
//             payment._id,
//             req.user._id,
//             verification.transactionId
//         );

//         return res.json({
//             success: true,
//             paid: finalPayment?.status === 'paid',
//             status: finalPayment?.status || 'pending',
//             minutes: finalPayment?.minutes || 0,
//             msg: finalPayment?.status === 'paid'
//                 ? 'Payment verified and minutes credited.'
//                 : 'Payment is still being processed.'
//         });
//     } catch (err) {
//         console.error(
//             'Verify Payment Error:',
//             err.response?.data || err.message
//         );

//         return res.status(502).json({
//             success: false,
//             paid: false,
//             msg: 'Payment could not be verified. Please try again later.'
//         });
//     }
// };


// const axios = require('axios');
// const crypto = require('crypto');
// const mongoose = require('mongoose');

// const Payment = require('../Models/Payment.js');
// const User = require('../Models/User.js');

// const PACKAGES = Object.freeze({
//     '15-minutes': { minutes: 15, amount: 300 },
//     '25-minutes': { minutes: 25, amount: 600 },
//     '60-minutes': { minutes: 60, amount: 1200 }
// });

// const CURRENCY = 'USD';
// const TIMEOUT = 20000;

// const PROVIDERS = [
//     'chapa',
//     'flutterwave',
//     'stripe',
//     'paypal'
// ];

// const CHAPA_API = 'https://api.chapa.global/v2';
// const FLUTTERWAVE_API = 'https://api.flutterwave.com/v3';
// const STRIPE_API = 'https://api.stripe.com/v1';

// const getProvider = (value) => {
//     const provider = String(value || 'chapa').toLowerCase();

//     return PROVIDERS.includes(provider) ? provider : null;
// };

// const getRequiredEnv = (name) => {
//     const value = process.env[name];

//     if (typeof value !== 'string' || !value.trim()) {
//         throw new Error(`${name} is not configured.`);
//     }

//     return value.trim();
// };

// const hasEnv = (...names) =>
//     names.every((name) =>
//         typeof process.env[name] === 'string' &&
//         process.env[name].trim().length > 0
//     );

// const isHttpsUrl = (value) => {
//     try {
//         const url = new URL(value);

//         return url.protocol === 'https:';
//     } catch {
//         return false;
//     }
// };

// const addQuery = (baseUrl, values) => {
//     if (!isHttpsUrl(baseUrl)) {
//         throw new Error('A valid HTTPS return URL is required.');
//     }

//     const url = new URL(baseUrl);

//     for (const [key, value] of Object.entries(values)) {
//         url.searchParams.set(key, String(value));
//     }

//     return url.toString();
// };

// const parseMinutes = (value) => {
//     const match = /^(\d+):([0-5]\d)$/.exec(
//         String(value || '00:00')
//     );

//     if (!match) {
//         throw new Error('Stored user minutes have an invalid format.');
//     }

//     return Number(match[1]) * 60 + Number(match[2]);
// };

// const formatMinutes = (totalSeconds) => {
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;

//     return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
// };

// const getPaymentConfig = (provider) => {
//     if (provider === 'chapa') {
//         return hasEnv(
//             'CHAPA_PRIVATE_KEY',
//             'CHAPA_RETURN_URL'
//         );
//     }

//     if (provider === 'flutterwave') {
//         return hasEnv(
//             'FLUTTERWAVE_SECRET_KEY',
//             'FLUTTERWAVE_REDIRECT_URL'
//         );
//     }

//     if (provider === 'stripe') {
//         return hasEnv(
//             'STRIPE_SECRET_KEY',
//             'STRIPE_SUCCESS_URL',
//             'STRIPE_CANCEL_URL'
//         );
//     }

//     if (provider === 'paypal') {
//         return hasEnv(
//             'PAYPAL_CLIENT_ID',
//             'PAYPAL_CLIENT_SECRET',
//             'PAYPAL_RETURN_URL',
//             'PAYPAL_CANCEL_URL'
//         );
//     }

//     return false;
// };

// const getPayPalBaseUrl = () => {
//     const environment = String(
//         process.env.PAYPAL_ENV || 'sandbox'
//     ).toLowerCase();

//     if (environment === 'sandbox') {
//         return 'https://api-m.sandbox.paypal.com';
//     }

//     if (environment === 'live') {
//         return 'https://api-m.paypal.com';
//     }

//     throw new Error('PAYPAL_ENV must be sandbox or live.');
// };

// const getPayPalAccessToken = async () => {
//     const response = await axios.post(
//         `${getPayPalBaseUrl()}/v1/oauth2/token`,
//         'grant_type=client_credentials',
//         {
//             auth: {
//                 username: getRequiredEnv('PAYPAL_CLIENT_ID'),
//                 password: getRequiredEnv('PAYPAL_CLIENT_SECRET')
//             },
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             timeout: TIMEOUT
//         }
//     );

//     if (!response.data?.access_token) {
//         throw new Error('PayPal did not return an access token.');
//     }

//     return response.data.access_token;
// };

// const getProviderErrorMessage = (err) => {
//     const providerMessage =
//         err.response?.data?.message ||
//         err.response?.data?.error?.message;

//     if (typeof providerMessage === 'string' && providerMessage.trim()) {
//         return providerMessage.slice(0, 400);
//     }

//     return String(err.message || 'Payment provider error').slice(0, 400);
// };

// // --------------------------------------------------
// // CREATE PROVIDER CHECKOUT
// // --------------------------------------------------

// const createProviderCheckout = async (payment, user) => {
//     const amountInDollars = (payment.amount / 100).toFixed(2);
//     const merchantReference = payment.merchantReference;
//     const paymentId = payment._id.toString();

//     // CHAPA
//     if (payment.provider === 'chapa') {
//         const response = await axios.post(
//             `${CHAPA_API}/payments/hosted`,
//             {
//                 amount: payment.amount,
//                 currency: payment.currency,
//                 merchant_reference: merchantReference,

//                 customer: {
//                     email: user.email,
//                     phone_number: user.phoneNumber
//                 },

//                 return_url: addQuery(
//                     getRequiredEnv('CHAPA_RETURN_URL'),
//                     { paymentId }
//                 ),

//                 meta: {
//                     paymentId,
//                     packageId: payment.packageId
//                 },

//                 customization: {
//                     title: 'HabeshaTele',
//                     description: `${payment.minutes} calling minutes`
//                 }
//             },
//             {
//                 headers: {
//                     Authorization:
//                         `Bearer ${getRequiredEnv('CHAPA_PRIVATE_KEY')}`,
//                     'Content-Type': 'application/json',
//                     'Idempotency-Key': payment.idempotencyKey
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const data = response.data?.data;
//         const checkoutUrl = data?.checkout_url;

//         if (
//             response.data?.status !== 'success' ||
//             !isHttpsUrl(checkoutUrl)
//         ) {
//             throw new Error(
//                 'Chapa did not return a valid checkout URL.'
//             );
//         }

//         payment.checkoutUrl = checkoutUrl;

//         // Chapa documents the final checkout URL path as its reference.
//         payment.providerReference =
//             data.chapa_reference ||
//             data.reference ||
//             new URL(checkoutUrl).pathname.split('/').filter(Boolean).pop() ||
//             merchantReference;

//         return;
//     }

//     // FLUTTERWAVE
//     if (payment.provider === 'flutterwave') {
//         const response = await axios.post(
//             `${FLUTTERWAVE_API}/payments`,
//             {
//                 tx_ref: merchantReference,
//                 amount: amountInDollars,
//                 currency: payment.currency,

//                 redirect_url: addQuery(
//                     getRequiredEnv('FLUTTERWAVE_REDIRECT_URL'),
//                     { paymentId }
//                 ),

//                 customer: {
//                     email: user.email,
//                     phonenumber: user.phoneNumber,
//                     name: user.email
//                 },

//                 customizations: {
//                     title: 'HabeshaTele',
//                     description: `${payment.minutes} calling minutes`
//                 },

//                 meta: {
//                     paymentId,
//                     packageId: payment.packageId
//                 }
//             },
//             {
//                 headers: {
//                     Authorization:
//                         `Bearer ${getRequiredEnv('FLUTTERWAVE_SECRET_KEY')}`,
//                     'Content-Type': 'application/json'
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const data = response.data?.data;

//         if (
//             response.data?.status !== 'success' ||
//             !isHttpsUrl(data?.link)
//         ) {
//             throw new Error(
//                 'Flutterwave did not return a valid checkout URL.'
//             );
//         }

//         payment.checkoutUrl = data.link;

//         // tx_ref is our merchant reference, not a verified transaction ID.
//         payment.providerReference = merchantReference;

//         return;
//     }

//     // STRIPE
//     if (payment.provider === 'stripe') {
//         const successBase = getRequiredEnv('STRIPE_SUCCESS_URL');
//         const cancelBase = getRequiredEnv('STRIPE_CANCEL_URL');

//         if (
//             !isHttpsUrl(successBase) ||
//             !isHttpsUrl(cancelBase)
//         ) {
//             throw new Error('Stripe return URLs must use HTTPS.');
//         }

//         const successUrl = addQuery(
//             successBase,
//             { paymentId }
//         ) + '&session_id={CHECKOUT_SESSION_ID}';

//         const stripeBody = new URLSearchParams({
//             mode: 'payment',
//             success_url: successUrl,
//             cancel_url: addQuery(cancelBase, { paymentId }),
//             customer_email: user.email,
//             client_reference_id: paymentId,

//             'metadata[paymentId]': paymentId,
//             'metadata[merchantReference]': merchantReference,

//             'line_items[0][quantity]': '1',
//             'line_items[0][price_data][currency]':
//                 payment.currency.toLowerCase(),
//             'line_items[0][price_data][unit_amount]':
//                 String(payment.amount),

//             'line_items[0][price_data][product_data][name]':
//                 `HabeshaTele ${payment.minutes} calling minutes`,

//             'payment_intent_data[metadata][paymentId]': paymentId,
//             'payment_intent_data[metadata][merchantReference]':
//                 merchantReference
//         });

//         const response = await axios.post(
//             `${STRIPE_API}/checkout/sessions`,
//             stripeBody.toString(),
//             {
//                 auth: {
//                     username: getRequiredEnv('STRIPE_SECRET_KEY'),
//                     password: ''
//                 },
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                     'Idempotency-Key': payment.idempotencyKey
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         if (
//             !response.data?.id ||
//             !isHttpsUrl(response.data?.url)
//         ) {
//             throw new Error(
//                 'Stripe did not return a valid Checkout Session.'
//             );
//         }

//         payment.checkoutUrl = response.data.url;
//         payment.providerReference = response.data.id;

//         return;
//     }

//     // PAYPAL
//     if (payment.provider === 'paypal') {
//         const accessToken = await getPayPalAccessToken();
//         const baseUrl = getPayPalBaseUrl();

//         const response = await axios.post(
//             `${baseUrl}/v2/checkout/orders`,
//             {
//                 intent: 'CAPTURE',

//                 purchase_units: [
//                     {
//                         reference_id: merchantReference,
//                         custom_id: paymentId,
//                         invoice_id: merchantReference,

//                         description:
//                             `HabeshaTele ${payment.minutes} calling minutes`,

//                         amount: {
//                             currency_code: payment.currency,
//                             value: amountInDollars
//                         }
//                     }
//                 ],

//                 application_context: {
//                     brand_name: 'HabeshaTele',
//                     user_action: 'PAY_NOW',

//                     return_url: addQuery(
//                         getRequiredEnv('PAYPAL_RETURN_URL'),
//                         { paymentId }
//                     ),

//                     cancel_url: addQuery(
//                         getRequiredEnv('PAYPAL_CANCEL_URL'),
//                         { paymentId }
//                     )
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json',
//                     'PayPal-Request-Id': payment.idempotencyKey
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const approvalLink = response.data?.links?.find(
//             (link) => link.rel === 'approve'
//         )?.href;

//         if (
//             !response.data?.id ||
//             !isHttpsUrl(approvalLink)
//         ) {
//             throw new Error(
//                 'PayPal did not return a valid approval URL.'
//             );
//         }

//         payment.checkoutUrl = approvalLink;
//         payment.providerReference = response.data.id;

//         return;
//     }

//     throw new Error('Unsupported payment provider.');
// };

// // --------------------------------------------------
// // VERIFY PROVIDER PAYMENT
// // --------------------------------------------------

// const getVerifiedProviderPayment = async (payment, req) => {
//     // CHAPA
//     if (payment.provider === 'chapa') {
//         const reference =
//             payment.providerReference || payment.merchantReference;

//         const response = await axios.get(
//             `${CHAPA_API}/payments/${encodeURIComponent(reference)}/verify`,
//             {
//                 headers: {
//                     Authorization:
//                         `Bearer ${getRequiredEnv('CHAPA_PRIVATE_KEY')}`
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const data = response.data?.data;

//         if (response.data?.status !== 'success' || !data) {
//             throw new Error(
//                 'Chapa verification did not return valid data.'
//             );
//         }

//         if (data.status !== 'SUCCESS') {
//             return {
//                 paid: false,
//                 providerStatus: data.status || 'PENDING'
//             };
//         }

//         if (
//             String(data.merchant_reference || '') !==
//                 payment.merchantReference ||
//             Number(data.amount) !== payment.amount ||
//             String(data.currency || '').toUpperCase() !== payment.currency
//         ) {
//             throw new Error(
//                 'Chapa payment details do not match the order.'
//             );
//         }

//         return {
//             paid: true,
//             transactionId:
//                 data.processor_reference ||
//                 data.chapa_reference ||
//                 reference
//         };
//     }

//     // FLUTTERWAVE
//     if (payment.provider === 'flutterwave') {
//         const transactionId = String(
//             req.query?.transaction_id || ''
//         );

//         if (!/^\d+$/.test(transactionId)) {
//             throw new Error(
//                 'Flutterwave transaction_id is required for verification.'
//             );
//         }

//         const response = await axios.get(
//             `${FLUTTERWAVE_API}/transactions/${transactionId}/verify`,
//             {
//                 headers: {
//                     Authorization:
//                         `Bearer ${getRequiredEnv('FLUTTERWAVE_SECRET_KEY')}`
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const data = response.data?.data;

//         if (response.data?.status !== 'success' || !data) {
//             throw new Error(
//                 'Flutterwave verification did not return valid data.'
//             );
//         }

//         if (data.status !== 'successful') {
//             return {
//                 paid: false,
//                 providerStatus: data.status || 'PENDING'
//             };
//         }

//         if (
//             String(data.tx_ref || '') !== payment.merchantReference ||
//             Number(data.amount) !== payment.amount / 100 ||
//             String(data.currency || '').toUpperCase() !== payment.currency
//         ) {
//             throw new Error(
//                 'Flutterwave payment details do not match the order.'
//             );
//         }

//         return {
//             paid: true,
//             transactionId: String(data.id)
//         };
//     }

//     // STRIPE
//     if (payment.provider === 'stripe') {
//         const sessionId = payment.providerReference;

//         if (!sessionId || !sessionId.startsWith('cs_')) {
//             throw new Error(
//                 'Stripe Checkout Session reference is invalid.'
//             );
//         }

//         const response = await axios.get(
//             `${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`,
//             {
//                 auth: {
//                     username: getRequiredEnv('STRIPE_SECRET_KEY'),
//                     password: ''
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         const data = response.data;

//         if (
//             data.client_reference_id !== payment._id.toString() ||
//             data.metadata?.merchantReference !== payment.merchantReference ||
//             data.metadata?.paymentId !== payment._id.toString()
//         ) {
//             throw new Error(
//                 'Stripe session does not match this payment.'
//             );
//         }

//         if (data.payment_status !== 'paid') {
//             return {
//                 paid: false,
//                 providerStatus:
//                     data.payment_status || data.status || 'PENDING'
//             };
//         }

//         if (
//             Number(data.amount_total) !== payment.amount ||
//             String(data.currency || '').toUpperCase() !== payment.currency
//         ) {
//             throw new Error(
//                 'Stripe payment details do not match the order.'
//             );
//         }

//         return {
//             paid: true,
//             transactionId: String(data.payment_intent || data.id)
//         };
//     }

//     // PAYPAL
//     if (payment.provider === 'paypal') {
//         const orderId = payment.providerReference;

//         if (!orderId) {
//             throw new Error('PayPal order reference is missing.');
//         }

//         const accessToken = await getPayPalAccessToken();
//         const baseUrl = getPayPalBaseUrl();

//         const orderResponse = await axios.get(
//             `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`
//                 },
//                 timeout: TIMEOUT
//             }
//         );

//         let order = orderResponse.data;

//         if (order.status === 'APPROVED') {
//             const captureResponse = await axios.post(
//                 `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
//                 {},
//                 {
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                         'Content-Type': 'application/json',
//                         'PayPal-Request-Id':
//                             `capture-${payment.idempotencyKey}`
//                     },
//                     timeout: TIMEOUT
//                 }
//             );

//             order = captureResponse.data;
//         }

//         const purchaseUnit = order.purchase_units?.find(
//             (unit) =>
//                 unit.custom_id === payment._id.toString() &&
//                 unit.reference_id === payment.merchantReference
//         );

//         if (!purchaseUnit) {
//             throw new Error(
//                 'PayPal order does not match this payment.'
//             );
//         }

//         const capture = purchaseUnit.payments?.captures?.find(
//             (item) => item.status === 'COMPLETED'
//         );

//         if (order.status !== 'COMPLETED' || !capture) {
//             return {
//                 paid: false,
//                 providerStatus: order.status || 'PENDING'
//             };
//         }

//         if (
//             Number(capture.amount?.value) !== payment.amount / 100 ||
//             String(capture.amount?.currency_code || '').toUpperCase() !==
//                 payment.currency
//         ) {
//             throw new Error(
//                 'PayPal payment details do not match the order.'
//             );
//         }

//         return {
//             paid: true,
//             transactionId: String(capture.id || order.id)
//         };
//     }

//     throw new Error('Unsupported payment provider.');
// };

// // --------------------------------------------------
// // CREDIT MINUTES EXACTLY ONCE
// // Requires MongoDB transaction support.
// // --------------------------------------------------

// const creditPaymentOnce = async (
//     paymentId,
//     userId,
//     transactionId
// ) => {
//     const session = await mongoose.startSession();

//     try {
//         await session.withTransaction(async () => {
//             const payment = await Payment.findOne({
//                 _id: paymentId,
//                 user: userId
//             }).session(session);

//             if (!payment) {
//                 throw new Error('Payment record not found.');
//             }

//             if (payment.status === 'paid' || payment.creditedAt) {
//                 return;
//             }

//             if (!['pending', 'processing'].includes(payment.status)) {
//                 throw new Error(
//                     'Payment is not eligible for crediting.'
//                 );
//             }

//             const user = await User.findById(
//                 payment.user
//             ).session(session);

//             if (!user) {
//                 throw new Error('User account not found.');
//             }

//             const totalSeconds =
//                 parseMinutes(user.minutes) + payment.minutes * 60;

//             user.minutes = formatMinutes(totalSeconds);

//             payment.status = 'paid';
//             payment.verifiedAt = new Date();
//             payment.creditedAt = new Date();

//             if (transactionId) {
//                 payment.providerTransactionId = String(transactionId);
//             }

//             payment.failureReason = null;

//             await user.save({ session });
//             await payment.save({ session });
//         });
//     } finally {
//         await session.endSession();
//     }

//     return Payment.findById(paymentId);
// };

// // --------------------------------------------------
// // GET /api/payments/packages
// // --------------------------------------------------

// exports.getPackages = async (req, res) => {
//     return res.json({
//         success: true,
//         currency: CURRENCY,

//         packages: Object.entries(PACKAGES).map(([id, item]) => ({
//             id,
//             minutes: item.minutes,
//             price: item.amount / 100,
//             currency: CURRENCY
//         })),

//         providers: PROVIDERS.map((provider) => ({
//             id: provider,
//             available: getPaymentConfig(provider)
//         }))
//     });
// };

// // --------------------------------------------------
// // POST /api/payments/checkout
// // Body: { "packageId": "15-minutes", "provider": "stripe" }
// // Optional header: Idempotency-Key
// // --------------------------------------------------

// exports.createCheckout = async (req, res) => {
//     const { packageId } = req.body || {};
//     const provider = getProvider(req.body?.provider);
//     const selectedPackage = PACKAGES[packageId];

//     if (!selectedPackage) {
//         return res.status(400).json({
//             success: false,
//             msg: 'Invalid package selected.'
//         });
//     }

//     if (!provider) {
//         return res.status(400).json({
//             success: false,
//             msg: 'Unsupported payment provider.'
//         });
//     }

//     if (!getPaymentConfig(provider)) {
//         return res.status(503).json({
//             success: false,
//             provider,
//             msg: 'Payment provider environment configuration is incomplete.'
//         });
//     }

//     if (
//         !req.user?._id ||
//         !mongoose.isValidObjectId(req.user._id)
//     ) {
//         return res.status(401).json({
//             success: false,
//             msg: 'Authentication is required.'
//         });
//     }

//     if (
//         typeof req.user.email !== 'string' ||
//         !req.user.email.trim() ||
//         typeof req.user.phoneNumber !== 'string' ||
//         !req.user.phoneNumber.trim()
//     ) {
//         return res.status(400).json({
//             success: false,
//             msg: 'Your account needs an email address and phone number.'
//         });
//     }

//     // If the frontend sends an idempotency key, reuse it for retries.
//     // A unique compound database index is also needed to prevent races.
//     const suppliedKey = req.get('Idempotency-Key');

//     if (
//         suppliedKey !== undefined &&
//         (
//             typeof suppliedKey !== 'string' ||
//             suppliedKey.length < 8 ||
//             suppliedKey.length > 128 ||
//             !/^[A-Za-z0-9._:-]+$/.test(suppliedKey)
//         )
//     ) {
//         return res.status(400).json({
//             success: false,
//             msg: 'Idempotency-Key must be 8–128 valid characters.'
//         });
//     }

//     const idempotencyKey = suppliedKey || crypto.randomUUID();

//     let payment;

//     try {
//         if (suppliedKey) {
//             const existingPayment = await Payment.findOne({
//                 user: req.user._id,
//                 provider,
//                 idempotencyKey
//             });

//             if (existingPayment) {
//                 if (
//                     existingPayment.packageId !== packageId
//                 ) {
//                     return res.status(409).json({
//                         success: false,
//                         msg: 'This Idempotency-Key was already used for another package.'
//                     });
//                 }

//                 if (existingPayment.checkoutUrl) {
//                     return res.status(200).json({
//                         success: true,
//                         paymentId: existingPayment._id,
//                         provider,
//                         checkoutUrl: existingPayment.checkoutUrl,
//                         status: existingPayment.status,
//                         reused: true
//                     });
//                 }

//                 return res.status(409).json({
//                     success: false,
//                     paymentId: existingPayment._id,
//                     status: existingPayment.status,
//                     msg: 'A payment with this key already exists but its checkout URL is unavailable. Check its status before creating another payment.'
//                 });
//             }
//         }

//         payment = await Payment.create({
//             user: req.user._id,
//             packageId,
//             minutes: selectedPackage.minutes,
//             amount: selectedPackage.amount,
//             currency: CURRENCY,
//             provider,
//             merchantReference:
//                 `HT${crypto.randomBytes(8).toString('hex')}`,
//             idempotencyKey,
//             status: 'pending'
//         });

//         await createProviderCheckout(payment, req.user);

//         payment.failureReason = null;

//         await payment.save();

//         return res.status(201).json({
//             success: true,
//             paymentId: payment._id,
//             provider,
//             checkoutUrl: payment.checkoutUrl,
//             status: payment.status
//         });
//     } catch (err) {
//         console.error(
//             'Create Checkout Error:',
//             getProviderErrorMessage(err)
//         );

//         if (payment) {
//             payment.failureReason = getProviderErrorMessage(err);

//             try {
//                 await payment.save();
//             } catch (saveError) {
//                 console.error(
//                     'Payment record save error:',
//                     saveError.message
//                 );
//             }
//         }

//         return res.status(502).json({
//             success: false,
//             paymentId: payment?._id || null,
//             status: payment?.status || null,
//             msg: 'Checkout could not be confirmed. Check this payment before trying again.'
//         });
//     }
// };

// // --------------------------------------------------
// // GET /api/payments/verify/:paymentId
// // Flutterwave also needs ?transaction_id=...
// // --------------------------------------------------

// exports.verifyPayment = async (req, res) => {
//     const { paymentId } = req.params;

//     if (!mongoose.isValidObjectId(paymentId)) {
//         return res.status(400).json({
//             success: false,
//             msg: 'Invalid payment ID.'
//         });
//     }

//     if (
//         !req.user?._id ||
//         !mongoose.isValidObjectId(req.user._id)
//     ) {
//         return res.status(401).json({
//             success: false,
//             msg: 'Authentication is required.'
//         });
//     }

//     try {
//         const payment = await Payment.findOne({
//             _id: paymentId,
//             user: req.user._id
//         });

//         if (!payment) {
//             return res.status(404).json({
//                 success: false,
//                 msg: 'Payment not found.'
//             });
//         }

//         if (payment.status === 'paid' || payment.creditedAt) {
//             return res.json({
//                 success: true,
//                 paid: true,
//                 status: 'paid',
//                 minutes: payment.minutes,
//                 msg: 'Payment was already verified.'
//             });
//         }

//         if (!['pending', 'processing'].includes(payment.status)) {
//             return res.status(409).json({
//                 success: false,
//                 paid: false,
//                 status: payment.status,
//                 msg: 'This payment cannot be verified in its current state.'
//             });
//         }

//         const verification = await getVerifiedProviderPayment(
//             payment,
//             req
//         );

//         if (!verification.paid) {
//             return res.status(202).json({
//                 success: true,
//                 paid: false,
//                 status: verification.providerStatus || 'PENDING',
//                 msg: 'Payment has not been confirmed yet.'
//             });
//         }

//         const finalPayment = await creditPaymentOnce(
//             payment._id,
//             req.user._id,
//             verification.transactionId
//         );

//         return res.json({
//             success: true,
//             paid: finalPayment?.status === 'paid',
//             status: finalPayment?.status || 'pending',
//             minutes: finalPayment?.minutes || 0,
//             msg: finalPayment?.status === 'paid'
//                 ? 'Payment verified and minutes credited.'
//                 : 'Payment is still being processed.'
//         });
//     } catch (err) {
//         console.error(
//             'Verify Payment Error:',
//             getProviderErrorMessage(err)
//         );

//         return res.status(502).json({
//             success: false,
//             paid: false,
//             msg: 'Payment could not be verified. Please try again later.'
//         });
//     }
// };

const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');

const Payment = require('../Models/Payment.js');
const User = require('../Models/User.js');
const Settings = require('../Models/Settings.js');

const PACKAGES = Object.freeze({
    '15-minutes': { minutes: 15, amount: 300 },
    '25-minutes': { minutes: 25, amount: 600 },
    '60-minutes': { minutes: 60, amount: 1200 }
});

// amount above is always USD cents.
const TIMEOUT = 20000;

const CHAPA_API = 'https://api.chapa.global/v2';
const FLUTTERWAVE_API = 'https://api.flutterwave.com/v3';
const STRIPE_API = 'https://api.stripe.com/v1';

const PROVIDERS = ['chapa', 'flutterwave', 'stripe', 'paypal'];

const COUNTRY_CURRENCIES = Object.freeze({
    ET: 'ETB',
    UG: 'UGX',
    KE: 'KES'
});

const getRequiredEnv = (name) => {
    const value = process.env[name];

    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${name} is not configured.`);
    }

    return value.trim();
};

const hasEnv = (...names) =>
    names.every((name) =>
        typeof process.env[name] === 'string' &&
        process.env[name].trim().length > 0
    );

const isHttpsUrl = (value) => {
    try {
        return new URL(value).protocol === 'https:';
    } catch {
        return false;
    }
};

const addQuery = (baseUrl, values) => {
    if (!isHttpsUrl(baseUrl)) {
        throw new Error('A valid HTTPS return URL is required.');
    }

    const url = new URL(baseUrl);

    Object.entries(values).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
    });

    return url.toString();
};

const getProvider = (value) => {
    const provider = String(value || '').toLowerCase();

    return PROVIDERS.includes(provider) ? provider : null;
};

const getCountryFromPhone = (phone) => {
    const number = String(phone || '').replace(/\s+/g, '');

    if (number.startsWith('+251')) return 'ET';
    if (number.startsWith('+256')) return 'UG';
    if (number.startsWith('+254')) return 'KE';

    return 'INTL';
};

const getUserCountry = (user) => {
    // Phone prefix is used as the reliable country identifier.
    const phoneCountry = getCountryFromPhone(user.phoneNumber);

    if (phoneCountry !== 'INTL') {
        return phoneCountry;
    }

    const storedCountry = String(user.country || '').trim().toUpperCase();

    const countryAliases = {
        ETHIOPIA: 'ET',
        UGANDA: 'UG',
        KENYA: 'KE',
        ET: 'ET',
        UG: 'UG',
        KE: 'KE'
    };

    return countryAliases[storedCountry] || 'INTL';
};

const getPaymentConfig = (provider) => {
    if (provider === 'chapa') {
        return hasEnv('CHAPA_PRIVATE_KEY', 'CHAPA_RETURN_URL');
    }

    if (provider === 'flutterwave') {
        return hasEnv(
            'FLUTTERWAVE_SECRET_KEY',
            'FLUTTERWAVE_REDIRECT_URL'
        );
    }

    if (provider === 'stripe') {
        return hasEnv(
            'STRIPE_SECRET_KEY',
            'STRIPE_SUCCESS_URL',
            'STRIPE_CANCEL_URL'
        );
    }

    if (provider === 'paypal') {
        return hasEnv(
            'PAYPAL_CLIENT_ID',
            'PAYPAL_CLIENT_SECRET',
            'PAYPAL_RETURN_URL',
            'PAYPAL_CANCEL_URL'
        );
    }

    return false;
};

// --------------------------------------------------
// CURRENCY RATE
// --------------------------------------------------

const getExchangeRate = async (currency) => {
    if (currency === 'USD') {
        return 1;
    }

    // Admin manual rate has priority.
    const settings = await Settings.findOne({ currency });

    if (
        settings?.useManualRate === true &&
        Number.isFinite(Number(settings.manualRate)) &&
        Number(settings.manualRate) > 0
    ) {
        return Number(settings.manualRate);
    }

    // Otherwise use live USD exchange rate.
    const response = await axios.get(
        'https://open.er-api.com/v6/latest/USD',
        { timeout: TIMEOUT }
    );

    const rate = Number(response.data?.rates?.[currency]);

    if (
        response.data?.result !== 'success' ||
        !Number.isFinite(rate) ||
        rate <= 0
    ) {
        throw new Error(`A valid exchange rate for ${currency} is unavailable.`);
    }

    return rate;
};

const calculateCharge = async (usdCents, currency) => {
    if (currency === 'USD') {
        return {
            currency: 'USD',
            amount: usdCents,
            rate: 1
        };
    }

    const rate = await getExchangeRate(currency);
    const usdAmount = usdCents / 100;
    const localAmount = usdAmount * rate;

    if (!Number.isFinite(localAmount) || localAmount <= 0) {
        throw new Error('Could not calculate the local payment amount.');
    }

    if (currency === 'ETB') {
        // Chapa amount is sent in cents.
        return {
            currency,
            amount: Math.round(localAmount * 100),
            rate
        };
    }

    // UGX and KES are charged as whole currency units.
    return {
        currency,
        amount: Math.ceil(localAmount),
        rate
    };
};

// --------------------------------------------------
// MINUTES FORMAT
// --------------------------------------------------

const parseMinutes = (value) => {
    const match = /^(\d+):([0-5]\d)$/.exec(
        String(value || '00:00')
    );

    if (!match) {
        throw new Error('Stored user minutes have an invalid format.');
    }

    return Number(match[1]) * 60 + Number(match[2]);
};

const formatMinutes = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// --------------------------------------------------
// PAYPAL
// --------------------------------------------------

const getPayPalBaseUrl = () => {
    const environment = String(
        process.env.PAYPAL_ENV || 'sandbox'
    ).toLowerCase();

    if (environment === 'sandbox') {
        return 'https://api-m.sandbox.paypal.com';
    }

    if (environment === 'live') {
        return 'https://api-m.paypal.com';
    }

    throw new Error('PAYPAL_ENV must be sandbox or live.');
};

const getPayPalAccessToken = async () => {
    const response = await axios.post(
        `${getPayPalBaseUrl()}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
            auth: {
                username: getRequiredEnv('PAYPAL_CLIENT_ID'),
                password: getRequiredEnv('PAYPAL_CLIENT_SECRET')
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: TIMEOUT
        }
    );

    if (!response.data?.access_token) {
        throw new Error('PayPal did not return an access token.');
    }

    return response.data.access_token;
};

// --------------------------------------------------
// PROVIDER ERROR
// --------------------------------------------------

const getProviderErrorMessage = (err) => {
    const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message;

    return String(message || 'Payment provider error').slice(0, 400);
};

// --------------------------------------------------
// CREATE PROVIDER CHECKOUT
// --------------------------------------------------

const createProviderCheckout = async (payment, user) => {
    const paymentId = payment._id.toString();
    const merchantReference = payment.merchantReference;
    const chargeAmount = Number(payment.providerMetadata?.chargeAmount);
    const chargeCurrency = payment.currency;

    if (!Number.isFinite(chargeAmount) || chargeAmount <= 0) {
        throw new Error('Invalid payment amount.');
    }

    // CHAPA - ETHIOPIA
    if (payment.provider === 'chapa') {
        const response = await axios.post(
            `${CHAPA_API}/payments/hosted`,
            {
                amount: chargeAmount,
                currency: chargeCurrency,
                merchant_reference: merchantReference,

                customer: {
                    email: user.email,
                    phone_number: user.phoneNumber
                },

                preferred_payment_methods: ['telebirr'],

                return_url: addQuery(
                    getRequiredEnv('CHAPA_RETURN_URL'),
                    { paymentId }
                ),

                meta: {
                    paymentId,
                    packageId: payment.packageId
                },

                customization: {
                    title: 'HabeshaTele',
                    description: `${payment.minutes} calling minutes`
                }
            },
            {
                headers: {
                    Authorization:
                        `Bearer ${getRequiredEnv('CHAPA_PRIVATE_KEY')}`,
                    'Content-Type': 'application/json',
                    'Idempotency-Key': payment.idempotencyKey
                },
                timeout: TIMEOUT
            }
        );

        const data = response.data?.data;
        const checkoutUrl = data?.checkout_url;

        if (
            response.data?.status !== 'success' ||
            !isHttpsUrl(checkoutUrl)
        ) {
            throw new Error('Chapa did not return a valid checkout URL.');
        }

        payment.checkoutUrl = checkoutUrl;

        payment.providerReference =
            data.chapa_reference ||
            data.reference ||
            merchantReference;

        return;
    }

    // FLUTTERWAVE - UGANDA / KENYA / INTERNATIONAL CARD
    if (payment.provider === 'flutterwave') {
        const method = payment.providerMetadata?.method;

        let paymentOptions = 'card';

        if (method === 'mobilemoneyuganda') {
            paymentOptions = 'mobilemoneyuganda';
        } else if (method === 'mpesa') {
            paymentOptions = 'mpesa';
        }

        const response = await axios.post(
            `${FLUTTERWAVE_API}/payments`,
            {
                tx_ref: merchantReference,
                amount: chargeAmount,
                currency: chargeCurrency,
                payment_options: paymentOptions,

                redirect_url: addQuery(
                    getRequiredEnv('FLUTTERWAVE_REDIRECT_URL'),
                    { paymentId }
                ),

                customer: {
                    email: user.email,
                    phonenumber: user.phoneNumber,
                    name: user.email
                },

                customizations: {
                    title: 'HabeshaTele',
                    description: `${payment.minutes} calling minutes`
                },

                meta: {
                    paymentId,
                    packageId: payment.packageId
                }
            },
            {
                headers: {
                    Authorization:
                        `Bearer ${getRequiredEnv('FLUTTERWAVE_SECRET_KEY')}`,
                    'Content-Type': 'application/json'
                },
                timeout: TIMEOUT
            }
        );

        const data = response.data?.data;

        if (
            response.data?.status !== 'success' ||
            !isHttpsUrl(data?.link)
        ) {
            throw new Error('Flutterwave did not return a valid checkout URL.');
        }

        payment.checkoutUrl = data.link;
        payment.providerReference = merchantReference;

        return;
    }

    // STRIPE - USD INTERNATIONAL CARD
    if (payment.provider === 'stripe') {
        const successUrl = addQuery(
            getRequiredEnv('STRIPE_SUCCESS_URL'),
            { paymentId }
        ) + '&session_id={CHECKOUT_SESSION_ID}';

        const cancelUrl = addQuery(
            getRequiredEnv('STRIPE_CANCEL_URL'),
            { paymentId }
        );

        const stripeBody = new URLSearchParams({
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: user.email,
            client_reference_id: paymentId,

            'metadata[paymentId]': paymentId,
            'metadata[merchantReference]': merchantReference,

            'line_items[0][quantity]': '1',
            'line_items[0][price_data][currency]': 'usd',
            'line_items[0][price_data][unit_amount]':
                String(payment.amount),

            'line_items[0][price_data][product_data][name]':
                `HabeshaTele ${payment.minutes} calling minutes`,

            'payment_intent_data[metadata][paymentId]': paymentId,
            'payment_intent_data[metadata][merchantReference]':
                merchantReference
        });

        const response = await axios.post(
            `${STRIPE_API}/checkout/sessions`,
            stripeBody.toString(),
            {
                auth: {
                    username: getRequiredEnv('STRIPE_SECRET_KEY'),
                    password: ''
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Idempotency-Key': payment.idempotencyKey
                },
                timeout: TIMEOUT
            }
        );

        if (
            !response.data?.id ||
            !isHttpsUrl(response.data?.url)
        ) {
            throw new Error('Stripe did not return a valid Checkout Session.');
        }

        payment.checkoutUrl = response.data.url;
        payment.providerReference = response.data.id;

        return;
    }

    // PAYPAL - USD INTERNATIONAL
    if (payment.provider === 'paypal') {
        const accessToken = await getPayPalAccessToken();
        const baseUrl = getPayPalBaseUrl();

        const response = await axios.post(
            `${baseUrl}/v2/checkout/orders`,
            {
                intent: 'CAPTURE',

                purchase_units: [
                    {
                        reference_id: merchantReference,
                        custom_id: paymentId,
                        invoice_id: merchantReference,

                        description:
                            `HabeshaTele ${payment.minutes} calling minutes`,

                        amount: {
                            currency_code: 'USD',
                            value: (payment.amount / 100).toFixed(2)
                        }
                    }
                ],

                application_context: {
                    brand_name: 'HabeshaTele',
                    user_action: 'PAY_NOW',

                    return_url: addQuery(
                        getRequiredEnv('PAYPAL_RETURN_URL'),
                        { paymentId }
                    ),

                    cancel_url: addQuery(
                        getRequiredEnv('PAYPAL_CANCEL_URL'),
                        { paymentId }
                    )
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': payment.idempotencyKey
                },
                timeout: TIMEOUT
            }
        );

        const approvalLink = response.data?.links?.find(
            (link) => link.rel === 'approve'
        )?.href;

        if (
            !response.data?.id ||
            !isHttpsUrl(approvalLink)
        ) {
            throw new Error('PayPal did not return a valid approval URL.');
        }

        payment.checkoutUrl = approvalLink;
        payment.providerReference = response.data.id;

        return;
    }

    throw new Error('Unsupported payment provider.');
};

// --------------------------------------------------
// VERIFY PROVIDER PAYMENT
// --------------------------------------------------

const getVerifiedProviderPayment = async (payment, req) => {
    const expectedAmount = Number(
        payment.providerMetadata?.chargeAmount
    );

    const expectedCurrency = String(payment.currency || '').toUpperCase();

    // CHAPA
    if (payment.provider === 'chapa') {
        const reference =
            payment.providerReference || payment.merchantReference;

        const response = await axios.get(
            `${CHAPA_API}/payments/${encodeURIComponent(reference)}/verify`,
            {
                headers: {
                    Authorization:
                        `Bearer ${getRequiredEnv('CHAPA_PRIVATE_KEY')}`
                },
                timeout: TIMEOUT
            }
        );

        const data = response.data?.data;

        if (response.data?.status !== 'success' || !data) {
            throw new Error('Chapa verification did not return valid data.');
        }

        if (String(data.status).toUpperCase() !== 'SUCCESS') {
            return {
                paid: false,
                providerStatus: data.status || 'PENDING'
            };
        }

        if (
            String(data.merchant_reference || '') !==
                payment.merchantReference ||
            Number(data.amount) !== expectedAmount ||
            String(data.currency || '').toUpperCase() !== expectedCurrency
        ) {
            throw new Error('Chapa payment details do not match the order.');
        }

        return {
            paid: true,
            transactionId:
                data.processor_reference ||
                data.chapa_reference ||
                reference
        };
    }

    // FLUTTERWAVE
    if (payment.provider === 'flutterwave') {
        const transactionId = String(
            req.query?.transaction_id || ''
        );

        if (!/^\d+$/.test(transactionId)) {
            throw new Error(
                'Flutterwave transaction_id is required for verification.'
            );
        }

        const response = await axios.get(
            `${FLUTTERWAVE_API}/transactions/${transactionId}/verify`,
            {
                headers: {
                    Authorization:
                        `Bearer ${getRequiredEnv('FLUTTERWAVE_SECRET_KEY')}`
                },
                timeout: TIMEOUT
            }
        );

        const data = response.data?.data;

        if (response.data?.status !== 'success' || !data) {
            throw new Error('Flutterwave verification did not return valid data.');
        }

        if (String(data.status).toLowerCase() !== 'successful') {
            return {
                paid: false,
                providerStatus: data.status || 'PENDING'
            };
        }

        if (
            String(data.tx_ref || '') !== payment.merchantReference ||
            Number(data.amount) !== expectedAmount ||
            String(data.currency || '').toUpperCase() !== expectedCurrency
        ) {
            throw new Error(
                'Flutterwave payment details do not match the order.'
            );
        }

        return {
            paid: true,
            transactionId: String(data.id)
        };
    }

    // STRIPE
    if (payment.provider === 'stripe') {
        const sessionId = payment.providerReference;

        if (!sessionId || !sessionId.startsWith('cs_')) {
            throw new Error('Stripe Checkout Session reference is invalid.');
        }

        const response = await axios.get(
            `${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`,
            {
                auth: {
                    username: getRequiredEnv('STRIPE_SECRET_KEY'),
                    password: ''
                },
                timeout: TIMEOUT
            }
        );

        const data = response.data;

        if (
            data.client_reference_id !== payment._id.toString() ||
            data.metadata?.merchantReference !== payment.merchantReference ||
            data.metadata?.paymentId !== payment._id.toString()
        ) {
            throw new Error('Stripe session does not match this payment.');
        }

        if (data.payment_status !== 'paid') {
            return {
                paid: false,
                providerStatus:
                    data.payment_status || data.status || 'PENDING'
            };
        }

        if (
            Number(data.amount_total) !== payment.amount ||
            String(data.currency || '').toUpperCase() !== 'USD'
        ) {
            throw new Error('Stripe payment details do not match the order.');
        }

        return {
            paid: true,
            transactionId: String(data.payment_intent || data.id)
        };
    }

    // PAYPAL
    if (payment.provider === 'paypal') {
        const orderId = payment.providerReference;

        if (!orderId) {
            throw new Error('PayPal order reference is missing.');
        }

        const accessToken = await getPayPalAccessToken();
        const baseUrl = getPayPalBaseUrl();

        const orderResponse = await axios.get(
            `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                timeout: TIMEOUT
            }
        );

        let order = orderResponse.data;

        if (order.status === 'APPROVED') {
            const captureResponse = await axios.post(
                `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'PayPal-Request-Id':
                            `capture-${payment.idempotencyKey}`
                    },
                    timeout: TIMEOUT
                }
            );

            order = captureResponse.data;
        }

        const purchaseUnit = order.purchase_units?.find(
            (unit) =>
                unit.custom_id === payment._id.toString() &&
                unit.reference_id === payment.merchantReference
        );

        if (!purchaseUnit) {
            throw new Error('PayPal order does not match this payment.');
        }

        const capture = purchaseUnit.payments?.captures?.find(
            (item) => item.status === 'COMPLETED'
        );

        if (order.status !== 'COMPLETED' || !capture) {
            return {
                paid: false,
                providerStatus: order.status || 'PENDING'
            };
        }

        if (
            Number(capture.amount?.value) !== payment.amount / 100 ||
            String(capture.amount?.currency_code || '').toUpperCase() !== 'USD'
        ) {
            throw new Error('PayPal payment details do not match the order.');
        }

        return {
            paid: true,
            transactionId: String(capture.id || order.id)
        };
    }

    throw new Error('Unsupported payment provider.');
};

// --------------------------------------------------
// CREDIT MINUTES EXACTLY ONCE
// Requires MongoDB transaction support.
// --------------------------------------------------

const creditPaymentOnce = async (paymentId, userId, transactionId) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const payment = await Payment.findOne({
                _id: paymentId,
                user: userId
            }).session(session);

            if (!payment) {
                throw new Error('Payment record not found.');
            }

            if (payment.status === 'paid' || payment.creditedAt) {
                return;
            }

            if (!['pending', 'processing'].includes(payment.status)) {
                throw new Error('Payment is not eligible for crediting.');
            }

            const user = await User.findById(payment.user).session(session);

            if (!user) {
                throw new Error('User account not found.');
            }

            const totalSeconds =
                parseMinutes(user.minutes) + payment.minutes * 60;

            user.minutes = formatMinutes(totalSeconds);

            payment.status = 'paid';
            payment.verifiedAt = new Date();
            payment.creditedAt = new Date();

            if (transactionId) {
                payment.providerTransactionId = String(transactionId);
            }

            payment.failureReason = null;

            await user.save({ session });
            await payment.save({ session });
        });
    } finally {
        await session.endSession();
    }

    return Payment.findById(paymentId);
};

// --------------------------------------------------
// GET /api/payments/packages
// --------------------------------------------------

exports.getPackages = async (req, res) => {
    try {
        const requestedCountry = String(
            req.query?.country || ''
        ).toUpperCase();

        const currency = COUNTRY_CURRENCIES[requestedCountry] || 'USD';

        return res.json({
            success: true,
            currency,

            packages: Object.entries(PACKAGES).map(([id, item]) => ({
                id,
                minutes: item.minutes,
                price: item.amount / 100,
                currency: 'USD'
            })),

            providers: PROVIDERS.map((provider) => ({
                id: provider,
                available: getPaymentConfig(provider)
            }))
        });
    } catch (err) {
        console.error('Get Packages Error:', getProviderErrorMessage(err));

        return res.status(500).json({
            success: false,
            msg: 'Could not load payment packages.'
        });
    }
};

// --------------------------------------------------
// POST /api/payments/checkout
// Body: { packageId, provider }
// Header: Idempotency-Key (optional)
// --------------------------------------------------

exports.createCheckout = async (req, res) => {
    const { packageId } = req.body || {};
    const selectedPackage = PACKAGES[packageId];

    if (!selectedPackage) {
        return res.status(400).json({
            success: false,
            msg: 'Invalid package selected.'
        });
    }

    if (
        !req.user?._id ||
        !mongoose.isValidObjectId(req.user._id)
    ) {
        return res.status(401).json({
            success: false,
            msg: 'Authentication is required.'
        });
    }

    if (
        typeof req.user.email !== 'string' ||
        !req.user.email.trim() ||
        typeof req.user.phoneNumber !== 'string' ||
        !req.user.phoneNumber.trim()
    ) {
        return res.status(400).json({
            success: false,
            msg: 'Your account needs an email address and phone number.'
        });
    }

    const country = getUserCountry(req.user);

    let provider;
    let method;

    if (country === 'ET') {
        provider = 'chapa';
        method = 'telebirr';
    } else if (country === 'UG') {
        provider = 'flutterwave';
        method = 'mobilemoneyuganda';
    } else if (country === 'KE') {
        provider = 'flutterwave';
        method = 'mpesa';
    } else {
        provider = getProvider(req.body?.provider);

        if (!['stripe', 'paypal', 'flutterwave'].includes(provider)) {
            return res.status(400).json({
                success: false,
                msg: 'Choose a supported international payment method.'
            });
        }

        method = 'card';
    }

    if (!getPaymentConfig(provider)) {
        return res.status(503).json({
            success: false,
            provider,
            msg: 'The selected payment provider is not configured on the server.'
        });
    }

    const suppliedKey = req.get('Idempotency-Key');

    if (
        suppliedKey !== undefined &&
        (
            typeof suppliedKey !== 'string' ||
            suppliedKey.length < 8 ||
            suppliedKey.length > 128 ||
            !/^[A-Za-z0-9._:-]+$/.test(suppliedKey)
        )
    ) {
        return res.status(400).json({
            success: false,
            msg: 'Idempotency-Key must be 8–128 valid characters.'
        });
    }

    const idempotencyKey = suppliedKey || crypto.randomUUID();

    let payment;

    try {
        if (suppliedKey) {
            const existingPayment = await Payment.findOne({
                user: req.user._id,
                provider,
                idempotencyKey
            });

            if (existingPayment) {
                if (existingPayment.packageId !== packageId) {
                    return res.status(409).json({
                        success: false,
                        msg: 'This Idempotency-Key was already used for another package.'
                    });
                }

                if (existingPayment.checkoutUrl) {
                    return res.status(200).json({
                        success: true,
                        paymentId: existingPayment._id,
                        provider,
                        checkoutUrl: existingPayment.checkoutUrl,
                        status: existingPayment.status,
                        reused: true
                    });
                }

                return res.status(409).json({
                    success: false,
                    paymentId: existingPayment._id,
                    status: existingPayment.status,
                    msg: 'A payment with this key already exists but its checkout URL is unavailable. Check its status before creating another payment.'
                });
            }
        }

        const baseAmount = selectedPackage.amount;
        const currency = COUNTRY_CURRENCIES[country] || 'USD';

        let charge;

        if (provider === 'stripe' || provider === 'paypal') {
            charge = {
                currency: 'USD',
                amount: baseAmount,
                rate: 1
            };
        } else {
            charge = await calculateCharge(baseAmount, currency);
        }

        payment = await Payment.create({
            user: req.user._id,
            packageId,
            minutes: selectedPackage.minutes,

            // Keep the original USD cents in amount.
            amount: baseAmount,

            // This is the actual currency charged by the provider.
            currency: charge.currency,

            provider,

            merchantReference:
                `HT${crypto.randomBytes(8).toString('hex')}`,

            idempotencyKey,
            status: 'pending',

            providerMetadata: {
                country,
                method,
                chargeAmount: charge.amount,
                chargeCurrency: charge.currency,
                exchangeRate: charge.rate,
                baseCurrency: 'USD',
                baseAmount
            }
        });

        await createProviderCheckout(payment, req.user);

        payment.failureReason = null;
        await payment.save();

        return res.status(201).json({
            success: true,
            paymentId: payment._id,
            provider,
            currency: payment.currency,
            amount: charge.amount,
            checkoutUrl: payment.checkoutUrl,
            status: payment.status
        });
    } catch (err) {
        console.error(
            'Create Checkout Error:',
            getProviderErrorMessage(err)
        );

        if (payment) {
            payment.failureReason = getProviderErrorMessage(err);

            try {
                await payment.save();
            } catch (saveError) {
                console.error('Payment save error:', saveError.message);
            }
        }

        return res.status(502).json({
            success: false,
            paymentId: payment?._id || null,
            status: payment?.status || null,
            msg: 'Checkout could not be created. Please check the payment status before trying again.'
        });
    }
};

// --------------------------------------------------
// GET /api/payments/verify/:paymentId
// Flutterwave: ?transaction_id=...
// --------------------------------------------------

exports.verifyPayment = async (req, res) => {
    const { paymentId } = req.params;

    if (!mongoose.isValidObjectId(paymentId)) {
        return res.status(400).json({
            success: false,
            msg: 'Invalid payment ID.'
        });
    }

    if (
        !req.user?._id ||
        !mongoose.isValidObjectId(req.user._id)
    ) {
        return res.status(401).json({
            success: false,
            msg: 'Authentication is required.'
        });
    }

    try {
        const payment = await Payment.findOne({
            _id: paymentId,
            user: req.user._id
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                msg: 'Payment not found.'
            });
        }

        if (payment.status === 'paid' || payment.creditedAt) {
            return res.json({
                success: true,
                paid: true,
                status: 'paid',
                minutes: payment.minutes,
                msg: 'Payment was already verified.'
            });
        }

        if (!['pending', 'processing'].includes(payment.status)) {
            return res.status(409).json({
                success: false,
                paid: false,
                status: payment.status,
                msg: 'This payment cannot be verified in its current state.'
            });
        }

        const verification = await getVerifiedProviderPayment(payment, req);

        if (!verification.paid) {
            return res.status(202).json({
                success: true,
                paid: false,
                status: verification.providerStatus || 'PENDING',
                msg: 'Payment has not been confirmed yet.'
            });
        }

        const finalPayment = await creditPaymentOnce(
            payment._id,
            req.user._id,
            verification.transactionId
        );

        return res.json({
            success: true,
            paid: finalPayment?.status === 'paid',
            status: finalPayment?.status || 'pending',
            minutes: finalPayment?.minutes || 0,
            msg: finalPayment?.status === 'paid'
                ? 'Payment verified and minutes credited.'
                : 'Payment is still being processed.'
        });
    } catch (err) {
        console.error(
            'Verify Payment Error:',
            getProviderErrorMessage(err)
        );

        return res.status(502).json({
            success: false,
            paid: false,
            msg: 'Payment could not be verified. Please try again later.'
        });
    }
};

const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    packageId: {
        type: String,
        required: true,
        enum: ['15-minutes', '25-minutes', '60-minutes']
    },

    minutes: {
        type: Number,
        required: true,
        min: 1
    },

    // USD cents: 300 = $3.00, 600 = $6.00, 1200 = $12.00.
    amount: {
        type: Number,
        required: true,
        min: 1
    },

    currency: {
        type: String,
        required: true,
        uppercase: true,
        default: 'USD',
        trim: true
    },

    provider: {
        type: String,
        required: true,
        enum: ['chapa', 'flutterwave', 'stripe', 'paypal'],
        default: 'chapa',
        index: true
    },

    merchantReference: {
        type: String,
        required: true,
        unique: true,
        immutable: true
    },

    idempotencyKey: {
        type: String,
        required: true,
        immutable: true,
        trim: true,
        minlength: 8,
        maxlength: 128
    },

    checkoutUrl: {
        type: String,
        default: null
    },

    providerReference: {
        type: String,
        default: null
    },

    providerTransactionId: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: [
            'pending',
            'processing',
            'paid',
            'failed',
            'cancelled'
        ],
        default: 'pending',
        index: true
    },

    creditedAt: {
        type: Date,
        default: null
    },

    verifiedAt: {
        type: Date,
        default: null
    },

    failureReason: {
        type: String,
        default: null,
        maxlength: 500
    },

    verificationAttempts: {
        type: Number,
        default: 0,
        min: 0
    },

    // Never store card numbers, CVV, passwords, or provider secrets here.
    providerMetadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Prevent reuse of one idempotency key by the same user/provider.
PaymentSchema.index(
    {
        user: 1,
        provider: 1,
        idempotencyKey: 1
    },
    {
        unique: true,
        name: 'unique_user_provider_idempotency'
    }
);

PaymentSchema.index({
    user: 1,
    createdAt: -1
});

PaymentSchema.index({
    provider: 1,
    providerReference: 1
});

PaymentSchema.index({
    status: 1,
    createdAt: 1
});

module.exports = mongoose.model('Payment', PaymentSchema);
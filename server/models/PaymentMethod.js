// const mongoose = require('mongoose');

// const PaymentMethodSchema = new mongoose.Schema({
//     country: String, // ET, UG, US...
//     name: String,    // Telebirr, MTN...
//     icon: String,    // 📱
//     color: String,   // bg-blue-600
//     account: String, // 0993...
//     isActive: { type: Boolean, default: true }
// });

// module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);


// const mongoose = require('mongoose');

// const PaymentSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//         index: true
//     },
//     packageId: {
//         type: String,
//         required: true
//     },
//     minutes: {
//         type: Number,
//         required: true,
//         min: 1
//     },
//     amount: {
//         type: Number,
//         required: true,
//         min: 1
//     },
//     currency: {
//         type: String,
//         required: true,
//         uppercase: true,
//         default: 'USD'
//     },
//     provider: {
//         type: String,
//         enum: ['chapa'],
//         default: 'chapa'
//     },
//     merchantReference: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     checkoutUrl: {
//         type: String,
//         default: null
//     },
//     providerReference: {
//         type: String,
//         default: null
//     },
//     status: {
//         type: String,
//         enum: ['pending', 'processing', 'paid', 'failed'],
//         default: 'pending',
//         index: true
//     },
//     verifiedAt: {
//         type: Date,
//         default: null
//     }
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Payment', PaymentSchema);



// const mongoose = require('mongoose');

// const PaymentSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//         index: true
//     },

//     packageId: {
//         type: String,
//         required: true,
//         enum: ['15-minutes', '25-minutes', '60-minutes']
//     },

//     minutes: {
//         type: Number,
//         required: true,
//         min: 1
//     },

//     // Amount in the smallest currency unit used by the provider.
//     // Example: USD 300 = $3.00 when the provider expects cents.
//     amount: {
//         type: Number,
//         required: true,
//         min: 1
//     },

//     currency: {
//         type: String,
//         required: true,
//         uppercase: true,
//         default: 'USD',
//         trim: true
//     },

//     provider: {
//         type: String,
//         required: true,
//         enum: [
//             'chapa',
//             'flutterwave',
//             'stripe',
//             'paypal'
//         ],
//         default: 'chapa',
//         index: true
//     },

//     merchantReference: {
//         type: String,
//         required: true,
//         unique: true,
//         immutable: true
//     },

//     // Your own unique key to prevent duplicate checkout creation.
//     idempotencyKey: {
//         type: String,
//         default: null
//     },

//     checkoutUrl: {
//         type: String,
//         default: null
//     },

//     // Provider-specific payment or checkout reference.
//     providerReference: {
//         type: String,
//         default: null
//     },

//     // Provider's confirmed transaction identifier, when available.
//     providerTransactionId: {
//         type: String,
//         default: null
//     },

//     status: {
//         type: String,
//         enum: [
//             'pending',
//             'processing',
//             'paid',
//             'failed',
//             'cancelled'
//         ],
//         default: 'pending',
//         index: true
//     },

//     // Set only after the verified payment has credited the user's minutes.
//     creditedAt: {
//         type: Date,
//         default: null
//     },

//     verifiedAt: {
//         type: Date,
//         default: null
//     },

//     failureReason: {
//         type: String,
//         default: null,
//         maxlength: 500
//     },

//     verificationAttempts: {
//         type: Number,
//         default: 0,
//         min: 0
//     },

//     // Non-secret provider details only. Never store card numbers or CVV here.
//     providerMetadata: {
//         type: mongoose.Schema.Types.Mixed,
//         default: {}
//     }
// }, {
//     timestamps: true
// });

// PaymentSchema.index({
//     user: 1,
//     createdAt: -1
// });

// PaymentSchema.index({
//     provider: 1,
//     providerReference: 1
// });

// PaymentSchema.index({
//     status: 1,
//     createdAt: 1
// });

// module.exports = mongoose.model('Payment', PaymentSchema);



// const mongoose = require('mongoose');

// const PaymentSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//         index: true
//     },

//     packageId: {
//         type: String,
//         required: true,
//         enum: ['15-minutes', '25-minutes', '60-minutes']
//     },

//     minutes: {
//         type: Number,
//         required: true,
//         min: 1
//     },

//     // Amount is stored in USD cents for this application.
//     // 300 = $3.00, 600 = $6.00, 1200 = $12.00.
//     amount: {
//         type: Number,
//         required: true,
//         min: 1
//     },

//     currency: {
//         type: String,
//         required: true,
//         uppercase: true,
//         default: 'USD',
//         trim: true
//     },

//     provider: {
//         type: String,
//         required: true,
//         enum: ['chapa', 'flutterwave', 'stripe', 'paypal'],
//         default: 'chapa',
//         index: true
//     },

//     merchantReference: {
//         type: String,
//         required: true,
//         unique: true,
//         immutable: true
//     },

//     // Internal key for safely retrying the same provider request.
//     idempotencyKey: {
//         type: String,
//         required: true,
//         immutable: true
//     },

//     checkoutUrl: {
//         type: String,
//         default: null
//     },

//     // Provider checkout/order reference.
//     providerReference: {
//         type: String,
//         default: null
//     },

//     // Set after server-side verification confirms payment.
//     providerTransactionId: {
//         type: String,
//         default: null
//     },

//     status: {
//         type: String,
//         enum: [
//             'pending',
//             'processing',
//             'paid',
//             'failed',
//             'cancelled'
//         ],
//         default: 'pending',
//         index: true
//     },

//     creditedAt: {
//         type: Date,
//         default: null
//     },

//     verifiedAt: {
//         type: Date,
//         default: null
//     },

//     failureReason: {
//         type: String,
//         default: null,
//         maxlength: 500
//     },

//     verificationAttempts: {
//         type: Number,
//         default: 0,
//         min: 0
//     },

//     // Do not store card numbers, CVV, passwords, or provider secrets here.
//     providerMetadata: {
//         type: mongoose.Schema.Types.Mixed,
//         default: {}
//     }
// }, {
//     timestamps: true
// });

// PaymentSchema.index({
//     user: 1,
//     createdAt: -1
// });

// PaymentSchema.index({
//     provider: 1,
//     providerReference: 1
// });

// PaymentSchema.index({
//     status: 1,
//     createdAt: 1
// });

// module.exports = mongoose.model('Payment', PaymentSchema);


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
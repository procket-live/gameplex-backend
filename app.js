const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true);
const AdminBro = require('admin-bro')
const AdminBroExpressjs = require('admin-bro-expressjs')

const userRoutes = require('./api/routes/user.route');
const lookupTypeRoutes = require('./api/routes/lookup-type.route');
const gameRoutes = require('./api/routes/game.route');
const tournamentRoutes = require('./api/routes/tournament.route');
const paymentRoutes = require('./api/routes/payment.route');
const organizerRoutes = require('./api/routes/organizer.route');
const getAppRoutes = require('./api/routes/getApp.route');

const userModel = require('./api/models/user.model');
const gameModel = require('./api/models/game.model');
const lookupModel = require('./api/models/lookup-type.model');
const tournamentModel = require('./api/models/tournament.model');
const roleModel = require('./api/models/role.model');
const otpModel = require('./api/models/otp.model');
const kycModel = require('./api/models/kyc.model');
const platformModel = require('./api/models/platform.model');
const bankAccountModel = require('./api/models/bank-account.model');
const wallet = require('./api/models/wallet.model');

const app = express();
AdminBro.registerAdapter(require('admin-bro-mongoose'))
const yo = mongoose.connect(
    'mongodb+srv://gameplex-user:pg60EeT5o8NtQEDa@cluster0-jnmvx.mongodb.net/gameplex?retryWrites=true&w=majority',
    {
        useNewUrlParser: true
    }
).then((db) => {
})

const adminBro = new AdminBro({
    resources: [
        userModel,
        gameModel,
        lookupModel,
        tournamentModel,
        roleModel,
        otpModel,
        kycModel,
        platformModel,
        bankAccountModel,
        wallet
    ],
    rootPath: '/admin',
    branding: {
        companyName: 'Gameplex',
    }
})

const adminBroRouter = AdminBroExpressjs.buildAuthenticatedRouter(adminBro, {
    authenticate: async (email, password) => {
        const user = await userModel.findOne({ email }).populate('role')
        if (user) {
            let isAdmin = false;
            const roles = user.role || [];
            roles.forEach((role) => {
                if (role.name == 'Admin') {
                    isAdmin = true;
                }
            })

            if (!isAdmin) {
                return false;
            }

            const matched = password == user.password;
            if (matched) {
                return user
            }
        }
        return false
    },
    cookiePassword: 'some-secret-password-used-to-secure-cookie',
})

mongoose.Promise = global.Promise;

app.use(morgan('dev'))
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use(adminBro.options.rootPath, adminBroRouter)

app.use('/user', userRoutes);
app.use('/lookup', lookupTypeRoutes);
app.use('/game', gameRoutes);
app.use('/tournament', tournamentRoutes);
app.use('/payment', paymentRoutes);
app.use('/organizer', organizerRoutes);
app.use('/getApp', getAppRoutes);

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        success: false,
        response: error.message
    });
});

module.exports = app;
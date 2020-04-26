const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true);
const AdminBro = require('admin-bro')
const AdminBroExpressjs = require('admin-bro-expressjs');
const Agenda = require('agenda');
var Agendash = require('agendash');

//Jobs
const Jobs = require('./api/job/remove-unused-match');
const TournamentJobs = require('./api/job/tournament-job');

const userRoutes = require('./api/routes/user.route');
const lookupTypeRoutes = require('./api/routes/lookup-type.route');
const gameRoutes = require('./api/routes/game.route');
const tournamentRoutes = require('./api/routes/tournament.route');
const paymentRoutes = require('./api/routes/payment.route');
const organizerRoutes = require('./api/routes/organizer.route');
const getAppRoutes = require('./api/routes/getApp.route');
const notificationRoutes = require('./api/routes/notification.route');
const offerRoutes = require('./api/routes/offer.route');
const battleRoutes = require('./api/routes/battle.route');

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
const participentModel = require('./api/models/participent.model');
const orderModel = require('./api/models/order.model');
const offerModel = require('./api/models/offer.model');
const organizerModel = require('./api/models/organizer.model');
const notificationModel = require('./api/models/notification.model');
const instructionModel = require('./api/models/instruction-step.model');
const battleModel = require('./api/models/battle.model');
const matchModel = require('./api/models/match.model');
const battleQueueModel = require('./api/models/battle-queue.model');
const chatModel = require('./api/models/chat-room.model');
const appReleaseModel = require('./api/models/release.model');
const withdrawRequestModel = require('./api/models/withdrawal-request.model');

const MONGO_URL = 'mongodb+srv://gameplex-user:pg60EeT5o8NtQEDa@cluster0-jnmvx.mongodb.net/gameplex?retryWrites=true&w=majority';

const app = express();
AdminBro.registerAdapter(require('admin-bro-mongoose'))
const agenda = new Agenda({ db: { address: MONGO_URL, collection: 'jobCollectionName' } });

const yo = mongoose.connect(
    process.env.MONGO || MONGO_URL,
    {
        useNewUrlParser: true
    }
).then((db) => {
})

agenda.define('remove_unused_match', Jobs.remove_unused_match);
agenda.define('get_daily_signup_report', Jobs.get_daily_report);
agenda.define('create_daily_match', TournamentJobs.create_all_flappy_bird_tournament);
agenda.define('complete_daily_match', TournamentJobs.complete_tournament);

(async function () { // IIFE to give access to async/await
    await agenda.start();
    await agenda.every('0 */2 * * *', 'remove_unused_match');
    await agenda.every('0 0 * * *', 'get_daily_signup_report');
    await agenda.every('22 11 * * *', 'create_daily_match');
    await agenda.every('25 11 * * *', 'complete_daily_match');
})();

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
        wallet,
        participentModel,
        orderModel,
        offerModel,
        organizerModel,
        notificationModel,
        instructionModel,
        battleModel,
        matchModel,
        battleQueueModel,
        chatModel,
        appReleaseModel,
        withdrawRequestModel
    ],
    rootPath: '/admin',
    branding: {
        companyName: 'Gameplex',
    }
})

const adminBroRouter = AdminBroExpressjs.buildAuthenticatedRouter(adminBro, {
    authenticate: async (email, password) => {
        let user = await userModel.findOne({ email }).populate('role')

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

        return true
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

app.use('/dash', Agendash(agenda));
app.use('/user', userRoutes);
app.use('/lookup', lookupTypeRoutes);
app.use('/game', gameRoutes);
app.use('/tournament', tournamentRoutes);
app.use('/payment', paymentRoutes);
app.use('/organizer', organizerRoutes);
app.use('/getApp', getAppRoutes);
app.use('/notification', notificationRoutes);
app.use('/offer', offerRoutes);
app.use('/battle', battleRoutes);

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
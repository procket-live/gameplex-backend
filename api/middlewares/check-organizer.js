const User = require('../models/user.model');
const Role = require('../../utils/role.utils');

module.exports = async (req, res, next) => {
    try {
        const userId = req.userData.userId;
        const user = await User.findById(userId).select('-_id role').populate('role').exec();
        if (Role.hasRole(user, 'Organizer')) {
            next();
        } else {
            return res.status(200).json({
                success: false,
                response: "Organizer Auth failed",
                error_code: 2
            });
        }
    } catch (error) {
        return res.status(200).json({
            success: false,
            response: "Organizer Auth failed",
            error_code: 2
        });
    }
};
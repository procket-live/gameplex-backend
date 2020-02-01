const { paytm_config } = require('../../paytm/paytm_config');
const { genchecksum, verifychecksum } = require('../../paytm/checksum');

exports.generate_checksum = (req, res) => {
    const user = req.user;

    const orderId = req.order_id;
    const amount = req.amount;

    const params = {
        MID: paytm_config.MID,
        ORDER_ID: String(orderId),
        CUST_ID: String(user._id),
        INDUSTRY_TYPE_ID: String(paytm_config.INDUSTRY_TYPE_ID),
        CHANNEL_ID: String(paytm_config.CHANNEL_ID),
        TXN_AMOUNT: String(amount),
        WEBSITE: String(paytm_config.WEBSITE),
        CALLBACK_URL: `${paytm_config.CALLBACK_URL}?ORDER_ID=${orderId}`,
        MOBILE_NO: String(user.mobile),
        EMAIL: String(user.email)
    };

    try {
        genchecksum(params, paytm_config.MERCHANT_KEY, function (err, checksum) {
            if (err) {
                return res.status(200).json({
                    success: false,
                    response: err
                })
            }

            return res.status(200).json({
                success: true,
                response: {
                    order_id: orderId,
                    checksum: checksum
                },
            })
        })
    } catch (err) {
    }
}

exports.validate_checksum = (req, res, next) => {
    var paytmChecksum = "";
    const paytmParams = {};
    const received_data = req.body;
    try {
        if (received_data["status"] != "Success") {
            req.status = "failed";
            next();
            return;
        }

        for (var key in received_data) {
            if (key == "CHECKSUMHASH") {
                paytmChecksum = received_data[key];
            } else {
                paytmParams[key] = received_data[key];
            }
        }

        var isValidChecksum = verifychecksum(paytmParams, paytm_config.MERCHANT_KEY, paytmChecksum);
        isValidChecksum = true;

        if (isValidChecksum) {
            req.status = "success";
            req.order_id = received_data['ORDERID'] || received_data['ORDER_ID'];
            req.amount = received_data['TXNAMOUNT'];
            req.string_response = JSON.stringify(paytmParams);
        } else {
            req.status = "failed";
        }
        next();
    } catch (err) {
        return res.status(201).json({
            success: false,
            response: err
        });
    }
}
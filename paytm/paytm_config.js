module.exports = {
    paytm_config: {
        MID: process.env.MERCHANT_ID,
        WEBSITE: 'WEBSTAGING',
        CHANNEL_ID: 'WAP',
        INDUSTRY_TYPE_ID: 'Retail',
        MERCHANT_KEY: process.env.MERCHANT_KEY,
        CALLBACK_URL: 'https://pguat.paytm.com/paytmchecksum/paytmCallback.jsp'
    }
}
const { sendTcpCommand } = require('./tcpClient');
const idResolver = require('./idResolver');

/**
 * Talks to the C++ recommendation server (Exercise 2) over TCP, translating our
 * UUIDs to the integer ids that server requires (see idResolver).
 *
 * Every call here is best-effort: the recommendation data is a side effect of
 * browsing, so a slow or unreachable C++ server must never break the HTTP
 * response. Failures are logged and swallowed.
 */

/**
 * Records that `userUuid` viewed `productUuid`.
 *
 * C++ protocol: PATCH appends a product to an existing user's history (204), but
 * returns 404 if the user has no history yet. So we PATCH first and, on 404,
 * POST to create the user's history with this product.
 */
async function registerView(userUuid, productUuid) {
    const userInt = idResolver.getUserInt(userUuid);
    const productInt = idResolver.getProductInt(productUuid);

    try {
        const response = await sendTcpCommand(`PATCH ${userInt} ${productInt}`);
        if (response.startsWith('404')) {
            await sendTcpCommand(`POST ${userInt} ${productInt}`);
        }
    } catch (err) {
        console.error(
            `[recommendation] could not register view (user ${userInt}, product ${productInt}): ${err.message}`
        );
    }
}

module.exports = {
    registerView
};

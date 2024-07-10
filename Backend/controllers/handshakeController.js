const { insertNotification } = require("../helper/insertNotification");
const { queryRunner } = require("../helper/queryRunner");

exports.requestHandShake = async (req, res) => {
    try {
        const { users, locationId } = req.body;
        console.log(users, locationId);
        const { userId } = req.user;
        const joinedUsers=users.join(',')
        const checkHandShakeExist = await queryRunner(
            'SELECT * FROM handshake WHERE requestedBy = ? AND locationId = ? AND requestedTo = ?', [
                userId, locationId, joinedUsers
            ]
        );

        if (checkHandShakeExist[0].length >= 1) {
            const updateUpdatedAt = await queryRunner(
                'UPDATE handshake SET updated_at = ? WHERE requestedBy = ? AND locationId = ? AND requestedTo = ?', [
                    new Date(), userId, locationId, joinedUsers
                ]
            );

            if (updateUpdatedAt[0].affectedRows > 0) {
                return res.status(200).json({ message: 'Request Updated' });
            } else {
                return res.status(400).json({ message: 'Request Not Updated' });
            }
        } else {
            const insertInHandshake = await queryRunner(
                'INSERT INTO handshake (locationId, requestedBy, requestedTo) VALUES (?, ?, ?)', [
                     locationId,userId, joinedUsers
                ]
            );

            if (insertInHandshake[0].affectedRows > 0) {
                
                for (const user of users) {
                    await insertNotification(user, `Handshake Request, You have a new Handshake Request from ${req.user.name}`, locationId);
                }

                return res.status(200).json({ message: 'Request Sent' });
            } else {
                console.log('Request Not Sent');
                return res.status(400).json({ message: 'Request Not Sent' });
            }
        }
    } catch (error) {
        console.error('Error requesting handshake:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

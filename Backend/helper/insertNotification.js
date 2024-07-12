const { queryRunner } = require("../helper/queryRunner.js");

exports.insertNotification = async (user_id, notification_message, relevantId, isHandShake) => {
  try {
    let query = `INSERT INTO notifications (userId, message, is_read`;
    let values = [user_id, notification_message, false];

    if (relevantId !== undefined && relevantId !== null) {
      query += `, relevantId`;
      values.push(relevantId);
    }

    if (isHandShake !== undefined && isHandShake !== null) {
      query += `, isHandShake`;
      values.push(isHandShake);
    }

    query += `) VALUES (`;
    query += values.map(() => '?').join(', ');
    query += `)`;

    const insertResult = await queryRunner(query, values);

    if (insertResult[0].affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error("Error inserting notification:", err);
    throw err;
  }
};

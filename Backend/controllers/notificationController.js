const {
    selectQuery,
    deleteQuery,
    insertScoutQuery,
    insertMeetingMembersQuery
  } = require("../constants/queries.js");
  const { queryRunner } = require("../helper/queryRunner.js");

  exports.getAllNotifications = async (req, res) => {
    try {
      const { userId } = req.user;
      let { page, limit, search } = req.query;
      if (!page) page = 1;
      if (!limit) limit = 15;
  
      const offset = (page - 1) * limit;
      let query = `SELECT * FROM notifications WHERE userId = ?`;
      let queryParams = [userId];
      if (search) {
        query += ` AND message LIKE ?`;
        queryParams.push(`%${search}%`);
      }
      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      queryParams.push(parseInt(limit), offset);
      const selectResult = await queryRunner(query, queryParams);
  
      const allReadQuery = `SELECT COUNT(*) as unreadCount FROM notifications WHERE userId = ? AND is_read = 0`;
      const allReadResult = await queryRunner(allReadQuery, [userId]);
      const isAllRead = allReadResult[0][0].unreadCount === 0;
  
      for (let notification of selectResult[0]) {
        if (notification?.isHandShake) {
          const data = await queryRunner(
            `SELECT user.department,user.name, user.role, user.address, user.position, user.id,
            user.latitude, user.longitude, hs.acceptedBy, hs.rejectedBy
             FROM scout_member as user
             JOIN handshake as hs ON user.id = hs.requestedBy
             WHERE hs.id = ?`, [notification.relevantId]
          );
          if (data[0].length > 0) {
            notification['requestedBy'] = data[0][0];
          }
        }
      }
      // console.log(isAllRead);
      if (selectResult[0].length > 0) {
        res.status(200).json({
          statusCode: 200,
          message: "Success",
          data: selectResult[0],
          isAllRead: isAllRead
        });
      } else {
        res.status(200).json({
          statusCode: 200,
          message: "No Notifications found",
          data: [],
          isAllRead: isAllRead
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to get Notifications",
        error: error.message
      });
    }
  };
  


  
exports.markNotificationAsRead = async (req, res) => {
    try {
      const { userId } = req.user;
      const { id } = req.params;

      const updateResult = await queryRunner(`UPDATE notifications SET is_read = ? WHERE id = ? AND userId = ?`,[true,id,userId]);
      if (updateResult[0].affectedRows > 0) {
        res.status(200).json({
          statusCode: 200,
          message: "Notification marked as read"
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          message: "No Notifications found"
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: "Failed to mark notification as read",
        error: error.message
      });
    }
}
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
      const { userId } = req.user;
      const updateResult = await queryRunner(`UPDATE notifications SET is_read = ? WHERE userId = ?`,[true,userId]);
      if (updateResult[0].affectedRows > 0) {
        res.status(200).json({
          statusCode: 200,
          message: "All Notifications marked as read"
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          message: "No Notifications found"
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: "Failed to mark all notifications as read",
        error: error.message
      });
    }
}
exports.checkAllRead = async (req, res) => {
    try {
      const { userId } = req.user;
      const allReadQuery = `SELECT COUNT(*) as unreadCount FROM notifications WHERE userId = ? AND is_read = 0`;
      const allReadResult = await queryRunner(allReadQuery, [userId]);
      const isAllRead = allReadResult[0][0].unreadCount === 0;
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        isAllRead: isAllRead
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: "Failed to check if all notifications are read",
        error: error.message
      });
    }
};
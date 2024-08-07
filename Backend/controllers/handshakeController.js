const { insertNotification } = require("../helper/insertNotification");
const { queryRunner } = require("../helper/queryRunner");

exports.requestHandShake = async (req, res) => {
    try {
        const { users, locationId } = req.body;
        const { userId } = req.user;

        // Fetch existing handshakes for the user and location
        const existingHandshakes = await queryRunner(
            'SELECT requestedTo FROM handshake WHERE requestedBy = ? AND locationId = ?', [
                userId, locationId
            ]
        );

        // Gather existing requested users
        let existingUsers = [];
        if (existingHandshakes[0].length > 0) {
            existingHandshakes[0].forEach(handshake => {
                existingUsers = existingUsers.concat(handshake.requestedTo.split(',').map(Number));
            });
        }

        // Filter out users who have already received a request
        const newUsers = users.filter(user => !existingUsers.includes(user));

        if (newUsers.length === 0) {
            return res.status(200).json({ message: 'All users have already been requested' });
        }

        const joinedNewUsers = newUsers.join(',');

        // Insert new handshake request
        const insertInHandshake = await queryRunner(
            'INSERT INTO handshake (locationId, requestedBy, requestedTo, created_at, updated_at, status) VALUES (?, ?, ?, ?, ?, ?)', [
                locationId, userId, joinedNewUsers, new Date(), new Date(), 'Pending'
            ]
        );

        if (insertInHandshake[0].affectedRows > 0) {
            // Send notifications to each new user
            const insertInCaptureLog = await queryRunner(
              "INSERT INTO ChangeLog(record_id, locationId,table_name,message,changed_data) VALUES (?, ?, ?,?,?)",
              [insertInHandshake[0].insertId
              , locationId,'handshake','requested',joinedNewUsers]
            );
            
            for (const user of newUsers) {
                await insertNotification(user, `Handshake Request - ${req.user.name}`, insertInHandshake[0].insertId, true);
            }

            return res.status(200).json({ message: 'Request Sent' });
        } else {
            console.log('Request Not Sent');
            return res.status(400).json({ message: 'Request Not Sent' });
        }
    } catch (error) {
        console.error('Error requesting handshake:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.acceptHandshake = async (req, res) => {
    console.log('Accept Handshake',req.body);
    const { handshakeId, action } = req.body;

    console.log("action: ", action)

    const { userId } = req.user;
    try {
      // Retrieve the handshake record
      const selectHandshake = await queryRunner('SELECT * FROM handshake WHERE id = ?', [handshakeId]);
        const rows = selectHandshake[0];
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Handshake not found' });
            }

  
      const handshake = rows[0];
      const { acceptedBy, rejectedBy } = handshake;
      console.log('Accepted By:', acceptedBy, 'Rejected By:', rejectedBy);
      // Parse accepted and rejected lists
      const acceptedByList = acceptedBy ? acceptedBy?.split(',').map(Number) : [];
      const rejectedByList = rejectedBy ? rejectedBy?.split(',').map(Number) : [];
            
      if (action === 'accept' && acceptedByList.includes(userId)) {
        console.log(action === 'accept' ,acceptedByList.includes(userId))
        return res.status(200).json({ message: 'User already accepted' });
      }
  
      if (action === 'reject' && rejectedByList.includes(userId)) {
        console.log9action === 'reject' , rejectedByList.includes(userId)
        return res.status(200).json({ message: 'User already rejected' });
      }
      if (action === 'accept' && rejectedByList.includes(userId)) {
        // Remove user from rejected list
        const index = rejectedByList.indexOf(userId);
        rejectedByList.splice(index, 1);

      }
  
      if (action === 'reject' && acceptedByList.includes(userId)) {
        // Remove user from accepted list
        const index = acceptedByList.indexOf(userId);
        acceptedByList.splice(index, 1);
      }
      // Update lists
      if (action === 'accept') {
        acceptedByList.push(userId);
      } else if (action === 'reject') {
        rejectedByList.push(userId);
      }
  
      // Convert lists back to comma-separated strings
      const updatedAcceptedBy = acceptedByList.join(',');
      const updatedRejectedBy = rejectedByList.join(',');
      console.log(updatedAcceptedBy,updatedRejectedBy)
      // Update the database
      const update=await queryRunner(
        'UPDATE handshake SET acceptedBy = ?, rejectedBy = ?, updated_at = NOW() WHERE id = ?',
        [updatedAcceptedBy, updatedRejectedBy, handshakeId]
      );
      console.log(update[0].affectedRows)
      if(update[0].affectedRows===0){
        return res.status(400).json({ message: 'Error updating handshake status' });
      }

      const insertInCaptureLog = await queryRunner(
        "INSERT INTO ChangeLog(record_id, locationId,table_name,message,changed_data) VALUES (?, ?, ?,?,?)",
        [handshakeId
        , 
        handshake.locationId
        ,'handshake','accepted',userId]
      );
      const updateRequestNotification = queryRunner('UPDATE notification SET isInteracted=? WHERE isHandShake=? AND relevantId=? AND userId=?', [
        1, 1, handshakeId, userId
      ]);
      
      if(updateRequestNotification[0].affectedRows>0){
        
        await insertNotification(handshake.requestedBy, `${req.user.name} has ${action}ed your handshake request`, handshake.locationId);
        return res.status(200).json({ message: `Handshake ${action}ed successfully` });
  
      }else{
        return res.status(200).json({ message: `Handshake ${action}ed successfully` });
      }
  
    } catch (error) {
      console.error('Error updating handshake status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

const { queryRunner } = require("../helper/queryRunner.js");

exports.insertNotification = async (user_id,
    notification_message,relevantId) => {
    
      try {
        if(relevantId){
            const query = `INSERT INTO notifications (userId, message, is_read,relevantId) VALUES ( ?, ?, ?,?)`;
            const insertResult=await queryRunner(
                query,[
                    user_id,
                    notification_message,
                    false,
                    relevantId
        
                ]
            )
            // console.log(insertResult[0].affectedRows)
            if(insertResult[0].affectedRows>0){
                return true
            }else{
                return false
            
            }
        }
        else{
            const query = `INSERT INTO notifications (userId, message, is_read) VALUES ( ?, ?, ?)`;
        const insertResult=await queryRunner(
            query,[
                user_id,
                notification_message,
                false,

                
    
            ]
        )
        // console.log(insertResult[0].affectedRows)

        if(insertResult[0].affectedRows>0){
            return true
        }else{
            return false
        
        
        }
        }
      } catch (err) {
        console.error("Error inserting notification:", err);
        throw err;
      }
    }
// // import { queryRunner } from "./queryRunner";

// export const captureLog = async (data) => {
//    try {
//        // Check if all required fields are present
//        if (!data?.operation_type || !data?.table_name || !data?.record_id || !data?.changed_data) {
//            throw new Error('Missing required log data');
//        }

//        const captureLogQuery = `
//            INSERT INTO ChangeLog (operation_type, table_name, record_id, changed_data) 
//            VALUES (?, ?, ?, ?)
//        `;

//        const [result] = await queryRunner(captureLogQuery, [
//            data.operation_type,
//            data.table_name,
//            data.record_id,
//            data.changed_data
//        ]);

//        if (result.affectedRows > 0) {
//            return result;
//        } else {
//            throw new Error('Unable to Insert');
//        }
//    } catch (error) {
//        // Log the error or send notifications if necessary
//        console.error(`Error adding log: ${error.message}`);
//        throw new Error(`Error adding log: ${error.message}`);
//    }
// };

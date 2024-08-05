import { queryRunner } from "./queryRunner";

export const captureLog = async (data)=>{
   try {
    const captureLogQuery='INSERT INTO ChangeLog (operation_type,table_name,record_id,changed_data) VALUES (?,?,?,?)';
    const insertLog = await queryRunner(captureLogQuery,[
        data?.operation_type,
        data?.table_name,
        data?.record_id,
        data?.changed_data
    ])
    if(insertLog[0].affectedRows > 0){
        return insertLog[0]
    }
    else{
        throw new Error('Unable to Insert');
    }
   } catch (error) {
    throw new Error(`Error adding log: ${error.message}`);
   }
}
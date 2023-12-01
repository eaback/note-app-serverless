const AWS = require("aws-sdk");
const { sendResponse } = require("../../responses");
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async ( event, context) => {

    try{
        const { Items } = await db
            .scan({
            TableName: "notes-db",
            })
            .promise();

    return sendResponse(200, { success: true, notes: Items });
    } catch (error){
        console.error("Error:", error);
        return sendResponse (500, {success: false, message: "internal server error"})
    }
};
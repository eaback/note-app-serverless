const AWS = require("aws-sdk");
const { sendResponse } = require("../../responses");
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
    const noteId = event.pathParameters.noteId;

    if (!noteId) {
        return sendResponse(400, { success: false, message: 'Note ID is required.' });
    }

    const params = {
        TableName: "notes-db",
        Key: {
        id: noteId,
        },
    };

    const { Item } = await db.get(params).promise();

    if (!Item) {
        return sendResponse(404, { success: false, message: 'Note not found.' });
    }

    await db.delete(params).promise();

    return sendResponse(200, { success: true, message: 'Note is successfully deleted' });
    } catch (error) {
    console.error('Error deleting note:', error);
    return sendResponse(500, { success: false, message: 'Failed to delete note' });
    }
};

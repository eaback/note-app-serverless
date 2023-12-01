const AWS = require("aws-sdk");
const { sendResponse } = require("../../responses");
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
    const noteId = event.pathParameters.noteId;
    const updatedNote = JSON.parse(event.body);

    if (!noteId) {
        return sendResponse(400, { success: false, message: 'Note ID is required.' });
    }

    // Check if the required fields are present in the updated note
    if (!updatedNote.title || !updatedNote.text || !updatedNote.createdAt) {
        return sendResponse(400, { success: false, message: 'Incomplete updated note data. Title, text, and createdAt are required.' });
    }

    // Check if title length is within limits
    if (updatedNote.title.length > 50) {
        return sendResponse(400, { success: false, message: 'Updated title exceeds maximum length of 50 characters.' });
    }

    // Check if text length is within limits
    if (updatedNote.text.length > 300) {
        return sendResponse(400, { success: false, message: 'Updated text exceeds maximum length of 300 characters.' });
    }

    const params = {
        TableName: "notes-db",
        Key: {
        id: noteId,
        },
        UpdateExpression: 'SET #title = :title, #text = :text, #createdAt = :createdAt, #modifiedAt = :modifiedAt',
        ExpressionAttributeNames: {
        '#title': 'title',
        '#text': 'text',
        '#createdAt': 'createdAt',
        '#modifiedAt': 'modifiedAt',
        },
        ExpressionAttributeValues: {
        ':title': updatedNote.title,
        ':text': updatedNote.text,
        ':createdAt': updatedNote.createdAt,
        ':modifiedAt': new Date().toISOString(), // Set modifiedAt to the current timestamp
        },
      ReturnValues: 'ALL_NEW', // Return the updated item
    };

    const { Attributes } = await db.update(params).promise();

    if (!Attributes) {
        return sendResponse(404, { success: false, message: 'Note not found.' });
    }

    return sendResponse(200, { success: true, message: 'Note is successfully updated', updatedNote: Attributes });
    } catch (error) {
    console.error('Error updating note:', error);
    return sendResponse(500, { success: false, message: 'Failed to update note' });
    }
};

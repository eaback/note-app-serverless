const AWS = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');
const { sendResponse } = require("../../responses");
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
    const { text, title } = JSON.parse(event.body);

    // Check if the required fields are present
    if (!title || !text) {
        return sendResponse(400, { success: false, message: 'Incomplete note data. Title and text are required.' });
    }

    // Check if title length is within limits
    if (title.length > 50) {
        return sendResponse(400, { success: false, message: 'Title exceeds maximum length of 50 characters.' });
    }

    // Check if text length is within limits
    if (text.length > 300) {
        return sendResponse(400, { success: false, message: 'Text exceeds maximum length of 300 characters.' });
    }

    const noteId = uuidv4(); // Generate a UUID for the note ID
    const createdAt = new Date().toISOString(); // Set createdAt to the current timestamp
    const modifiedAt = ''; // Set modifiedAt to an empty string

    const note = {
        id: noteId,
        title,
        text,
        createdAt,
        modifiedAt,
    };

    await db
        .put({
        TableName: "notes-db",
        Item: note,
        })
        .promise();

    return sendResponse(200, { success: true, message: 'Note is successfully created', note });
    } catch (error) {
    console.error('Error creating note:', error);
    return sendResponse(500, { success: false, message: 'Failed to create note' });
    }
};

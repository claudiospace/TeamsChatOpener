# Teams Chat Link Opener

This is a simple, single-page web application designed to solve a common pain point: accessing the dedicated persistent chat thread of a Microsoft Teams meeting quickly.

Many calendar clients (like Google Calendar) and email systems wrap the original Teams meeting link in multiple layers of redirection and encoding, preventing users from easily reaching the chat history, files, and notes after the meeting ends. This tool decodes the messy URL and generates a direct link to the meeting's chat thread.

## How to Use

1. **Paste:** Paste the entire messy link into the **"Paste Meeting Link"** text area in the application.

2. **Click:** Click the **"Open Chat →"** button.

3. **Result:** The application will immediately attempt to open the direct Teams chat link in a new browser tab. The generated, clean deep link will also be displayed below for manual copying if needed.

## ⚙️ Project Structure

The application is split into three files:

| File Name | Description | 
 | ----- | ----- | 
| `index.html` | Defines the structure, content, and the user interface elements (input box, buttons, result panel). It links to the external CSS and JavaScript files. | 
| `styles.css` | Contains all the visual styling, colors (Teams-inspired purple theme), layout, and responsiveness for the application. | 
| `script.js` | Contains the core logic. This script handles the input decoding, extracts the unique `meeting_ID`, constructs the Teams deep link, and manages the UI response (showing success/error messages, copying the link). | 

### The Deep Link Format

The application works by finding the unique `meeting_ID` embedded in the original link and assembling it into the standard Teams chat deep link format:

`https://teams.microsoft.com/l/chat/19:meeting_ID@thread.v2/conversations?context=...`

This URL instructs Microsoft Teams to open the dedicated, persistent group chat associated with the meeting, providing access to meeting files, notes, and chat history.
/**
 * Attempts to find the 'meeting_' ID within the messy input link, 
 * constructs the deep link, and attempts to open it.
 */
function processAndOpen() {
    const input = document.getElementById('inputLink').value;
    const resultPanel = document.getElementById('resultPanel');
    const outputLinkDiv = document.getElementById('outputLink');

    if (!input.trim()) {
        showError(true);
        return;
    }

    // 1. Clean and Decode
    // Recursively decode URL components to handle multiple layers of encoding 
    // often added by email clients (e.g., Google Calendar link wrappers).
    let decoded = input;
    let previous = "";
    let loopLimit = 0;
    
    try {
        while (decoded !== previous && loopLimit < 5) {
            previous = decoded;
            decoded = decodeURIComponent(decoded);
            loopLimit++;
        }
    } catch (e) {
        console.warn("Decoding stopped due to malformed URI component, proceeding with current state.");
    }

    // 2. Extract ID
    // Searches for the Teams meeting ID pattern: "meeting_" followed by UUID-like structure.
    const regex = /(meeting_[a-zA-Z0-9-]+)/;
    const match = decoded.match(regex);

    if (match && match[1]) {
        const meetingId = match[1];

        // 3. Construct Deep Link
        // This deep link format targets the meeting's persistent chat thread.
        const finalLink = `https://teams.microsoft.com/l/chat/19:${meetingId}@thread.v2/conversations?context=%7B%22contextType%22%3A%22chat%22%7D`;

        // 4. Update UI
        showError(false);
        outputLinkDiv.textContent = finalLink;
        resultPanel.style.display = 'block';

        // 5. Attempt Auto-Open
        // window.open works best when triggered directly by a user click event.
        window.open(finalLink, '_blank');

    } else {
        showError(true);
        resultPanel.style.display = 'none';
    }
}

/**
 * Toggles the error message visibility and adds a small shake effect to the container.
 */
function showError(show) {
    const el = document.getElementById('errorDisplay');
    el.style.display = show ? 'flex' : 'none';
    
    if(show) {
        const container = document.querySelector('.container');
        // Simple CSS shake effect
        container.style.transform = "translateX(5px)";
        setTimeout(() => container.style.transform = "translateX(-5px)", 100);
        setTimeout(() => container.style.transform = "translateX(0)", 200);
    }
}

/**
 * Copies the generated link to the clipboard and provides visual feedback.
 */
function copyLink() {
    const text = document.getElementById('outputLink').textContent;
    const btn = document.querySelector('.result-panel .btn-secondary:nth-child(1)'); // Target the Copy button

    // Preferred modern method
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btn.textContent;
            btn.textContent = "Link Copied!";
            setTimeout(() => btn.textContent = originalText, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
            // Fallback attempt below
            fallbackCopy(text);
        });
    } else {
        // Fallback for older browsers or restricted environments
        fallbackCopy(text);
    }
}

/**
 * Fallback copy mechanism using the deprecated but widely supported execCommand.
 */
function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Prevents scrolling
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand("copy");
        const btn = document.querySelector('.result-panel .btn-secondary:nth-child(1)');
        const originalText = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => btn.textContent = originalText, 2000);
    } catch (err) {
        console.error('Fallback copy failed: ', err);
        // Use custom modal or message if alert() was not forbidden
        // Since alert() is forbidden, we just log the failure.
        // console.error("Copy failed. Please manually select and copy the link.");
    } finally {
        textArea.remove();
    }
}

/**
 * Clears the input and hides the result panel.
 */
function resetForm() {
    document.getElementById('inputLink').value = '';
    document.getElementById('resultPanel').style.display = 'none';
    showError(false);
    document.getElementById('inputLink').focus();
}
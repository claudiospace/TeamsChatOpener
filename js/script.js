/**
 * Attempts to find the full Teams Thread ID within the messy input link, 
 * constructs the clean deep link, and attempts to open it.
 */
function processAndOpen() {
    const input = document.getElementById('inputLink').value;
    const resultPanel = document.getElementById('resultPanel');
    const outputLinkDiv = document.getElementById('outputLink');

    if (!input.trim()) {
        showError(true);
        return;
    }

    // 1. Clean and Decode (Recursively decode to handle multi-layer wrappers like Google Calendar)
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

    // 2. Extract the full Teams Thread ID
    // We look for the entire thread identifier: 19:meeting_ID@thread.v2
    // The regex is updated to look for the pattern preceded by 'threadId=' or just floating
    // in the URL. Since the decoding is done recursively, we can rely on finding 
    // "19:meeting_..." eventually.
    // The pattern captures '19:' followed by 'meeting_' and the complex Base64 ID, 
    // ending with '@thread.v2'. The preceding part (like 'threadId=') is optional in the match.
    // The new regex accounts for both: 
    // 1. Direct link format: .../l/meetup-join/19%253ameeting_...
    // 2. Meeting options link format: ...&threadId=19_meeting_...
    // It captures the ID pattern: (19:meeting_[a-zA-Z0-9\-\+\/]+@thread\.v2)
    const regex = /(?:threadId=|meetup-join\/|l\/chat\/)?(19[:_]meeting_[a-zA-Z0-9\-\+\/]+@thread\.v2)/;
    const match = decoded.match(regex);
    
    let fullThreadId = null;

    if (match && match[1]) {
        fullThreadId = match[1];
        
        // Handle the case where the ID uses an underscore instead of a colon (common in threadId= format)
        if (fullThreadId.startsWith("19_")) {
            fullThreadId = fullThreadId.replace("19_", "19:");
        }
    }
    
    if (fullThreadId) {
        // 3. Construct Clean Deep Link
        // The final link targets the dedicated chat thread using the captured full ID.
        // This structure is stable and directly opens the chat interface.
        const finalLink = `https://teams.microsoft.com/l/chat/${fullThreadId}/conversations?context=%7B%22contextType%22%3A%22chat%22%7D`;

        // 4. Update UI
        showError(false);
        outputLinkDiv.textContent = finalLink;
        resultPanel.style.display = 'block';

        // 5. Attempt Auto-Open
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
        // Logging the failure since alert() is forbidden
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

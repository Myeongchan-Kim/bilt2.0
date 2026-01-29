// Chat module

let conversationHistory = [];
let chatReady = false;
let chatRemainingSeconds = 3;
let messageCount = 0;
const MAX_MESSAGES = 10;

// Initialize chat readiness after 4 seconds
function initChatDelay() {
    const sendBtn = document.getElementById('sendBtn');
    if (!sendBtn) return;

    chatRemainingSeconds = 3;
    sendBtn.classList.add('loading');
    sendBtn.textContent = chatRemainingSeconds + 's';

    const countdown = setInterval(() => {
        chatRemainingSeconds--;
        if (chatRemainingSeconds > 0) {
            sendBtn.textContent = chatRemainingSeconds + 's';
        } else {
            clearInterval(countdown);
            chatReady = true;
            sendBtn.classList.remove('loading');
            sendBtn.textContent = window.i18n ? window.i18n.get('send') : 'Send';
        }
    }, 1000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initChatDelay);

async function sendMessage() {
    if (!chatReady) {
        const msg = window.i18n ? window.i18n.get('chat_loading') : 'AI is warming up...';
        alert(msg + ' (' + chatRemainingSeconds + 's)');
        return;
    }

    if (messageCount >= MAX_MESSAGES) {
        const msg = window.i18n ? window.i18n.get('chat_limit_reached') : 'Chat limit reached. Please refresh the page.';
        alert(msg);
        return;
    }

    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    const welcome = document.querySelector('.welcome-message');
    if (welcome) welcome.remove();

    addMessage(message, 'user');
    input.value = '';
    messageCount++;
    document.getElementById('sendBtn').disabled = true;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    document.getElementById('chatMessages').appendChild(typingDiv);
    scrollToBottom();

    try {
        const context = window.calculator ? window.calculator.getContext() : {};

        conversationHistory.push({
            role: 'user',
            content: message
        });

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                context: context,
                history: conversationHistory.slice(-10)
            })
        });

        typingDiv.remove();

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }

        const data = await response.json();
        const assistantMessage = data.reply || 'No response received.';

        conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });

        addMessage(assistantMessage, 'assistant');

    } catch (error) {
        typingDiv.remove();
        addMessage('Error: ' + error.message, 'system');
    }

    document.getElementById('sendBtn').disabled = false;
}

function parseMarkdown(text) {
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    const lines = html.split('\n');
    let result = [];
    let inList = false;
    let listType = null;

    for (let line of lines) {
        const trimmed = line.trim();

        if (trimmed.match(/^[-*]\s+/)) {
            if (!inList || listType !== 'ul') {
                if (inList) result.push(`</${listType}>`);
                result.push('<ul>');
                inList = true;
                listType = 'ul';
            }
            result.push('<li>' + trimmed.replace(/^[-*]\s+/, '') + '</li>');
        }
        else if (trimmed.match(/^\d+\.\s+/)) {
            if (!inList || listType !== 'ol') {
                if (inList) result.push(`</${listType}>`);
                result.push('<ol>');
                inList = true;
                listType = 'ol';
            }
            result.push('<li>' + trimmed.replace(/^\d+\.\s+/, '') + '</li>');
        }
        else {
            if (inList) {
                result.push(`</${listType}>`);
                inList = false;
                listType = null;
            }
            if (trimmed === '') {
                result.push('<br>');
            } else {
                result.push('<p>' + line + '</p>');
            }
        }
    }

    if (inList) {
        result.push(`</${listType}>`);
    }

    return result.join('');
}

function addMessage(text, type) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + type;

    if (type === 'assistant') {
        messageDiv.innerHTML = parseMarkdown(text);
    } else {
        messageDiv.textContent = text;
    }

    messagesDiv.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter') sendMessage();
}

function askQuickQuestion(btn) {
    const key = btn.getAttribute('data-question-key');
    const question = window.i18n ? window.i18n.get(key) : btn.textContent;
    document.getElementById('chatInput').value = question;
    sendMessage();
}

function toggleChat() {
    document.getElementById('chatSection').classList.toggle('collapsed');
}

window.chat = {
    send: sendMessage,
    handleKeyPress: handleKeyPress,
    askQuickQuestion: askQuickQuestion,
    toggle: toggleChat
};

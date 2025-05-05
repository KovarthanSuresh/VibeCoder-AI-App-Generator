// File: frontend/components/ChatBubble.jsx
import React from 'react';

export default function ChatBubble({ role, content }) {
  // 1) Strip out <think>…</think> and any ``` fences
  const cleaned = content
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/```[a-zA-Z]*\n?/g, '')
    .trim();

  // 2) Extract optional filename from a leading "# File: X"
  const fnMatch = cleaned.match(/^# File:\s*(.+)$/m);
  const filename = fnMatch ? fnMatch[1] : null;
  // 3) Remove that line from the code body
  const code = filename
    ? cleaned.replace(/^# File:.*$/m, '').trim()
    : cleaned;

  // 4) Copy-to-clipboard
  const handleCopy = () => navigator.clipboard.writeText(code);

  return (
    <div className={`bubble ${role}`}>
      {filename && <div className="file-title">{filename}</div>}

      <div className="code-container">
        <button className="copy-btn" onClick={handleCopy}>
          Copy
        </button>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

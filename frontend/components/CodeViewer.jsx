import React from 'react';

export default function CodeViewer({ code }) {
  return (
    <pre className="code-viewer">
      <code>{code}</code>
    </pre>
  );
}

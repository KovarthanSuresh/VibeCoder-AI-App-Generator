// File: frontend/components/FileTree.jsx
import React from 'react';

export default function FileTree({ tree = [], onSelect }) {
  if (!Array.isArray(tree)) {
    return <div className="error">Error: Invalid file tree</div>;
  }

  return (
    <div className="file-tree">
      {tree.map((item, idx) => {
        // item might be a string or an object { type, path }
        const filePath = typeof item === 'string' 
          ? item 
          : item.path || '';

        return (
          <div
            key={idx}
            className="file-item"
            onClick={() => onSelect(filePath)}
          >
            {filePath}
          </div>
        );
      })}
    </div>
  );
}

// File: frontend/pages/index.js
import React, { useState, useRef } from 'react';
import ChatBubble from '../components/ChatBubble';

export default function HomePage() {
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [tree, setTree] = useState([]);
  const [codeBoxes, setCodeBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const descRef = useRef(null);
  const featuresRef = useRef(null);

  const autoResize = (el) => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  const handleDescriptionInput = (e) => {
    setDescription(e.target.value);
    autoResize(e.target);
  };

  const handleFeaturesInput = (e) => {
    setFeatures(e.target.value);
    autoResize(e.target);
  };

  const buildAsciiTree = (paths) => {
    const root = {};
    for (const p of paths) {
      const parts = p.split('/');
      let node = root;
      for (const part of parts) {
        node[part] = node[part] || {};
        node = node[part];
      }
    }
    const serialize = (node, prefix = '') => {
      const entries = Object.entries(node);
      return entries.flatMap(([name, child], idx) => {
        const isLast = idx === entries.length - 1;
        const pointer = isLast ? '└─ ' : '├─ ';
        const line = `${prefix}${pointer}${name}`;
        const next = prefix + (isLast ? '   ' : '│  ');
        return [line].concat(
          Object.keys(child).length ? serialize(child, next) : []
        );
      });
    };
    return ['project/'].concat(serialize(root)).join('\n');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setTree([]);
    setCodeBoxes([]);

    try {
      // 1) Fetch scaffold
      const res = await fetch('http://localhost:8001/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name: appName,
          description,
          features: features.split('\n').filter(f => f.trim()),
        }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const { tree: rawTree } = await res.json();
      const paths = rawTree.map(item => typeof item === 'string' ? item : item.path);
      setTree(paths);

      // 2) First code box: ASCII tree
      const ascii = buildAsciiTree(paths);
      setCodeBoxes([{ title: 'Project Structure', code: ascii }]);

      // 3) Then each file’s code
      for (const path of paths) {
        const name = path.split('/').pop();
        if (!name.includes('.')) continue;

        const fileRes = await fetch('http://localhost:8001/file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app_name: appName,
            description,
            features: features.split('\n').filter(f => f.trim()),
            path,
          }),
        });
        if (!fileRes.ok) throw new Error(fileRes.statusText);
        const { code: rawCode } = await fileRes.json();
        const cleaned = rawCode
          .replace(/<think>[\s\S]*?<\/think>/g, '')
          .replace(/```[a-zA-Z]*\n?/g, '')
          .trim();

        setCodeBoxes(cb => [...cb, { title: path, code: cleaned }]);
      }
    } catch (e) {
      console.error(e);
      setError('Error generating code or fetching files.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="input-group">
          <input
            type="text"
            placeholder="App Name"
            value={appName}
            onChange={e => setAppName(e.target.value)}
          />
        </div>
        <div className="input-group">
          <textarea
            ref={descRef}
            placeholder="Short Description"
            rows={1}
            value={description}
            onChange={handleDescriptionInput}
          />
        </div>
        <div className="input-group">
          <textarea
            ref={featuresRef}
            placeholder="Features (one per line)"
            rows={1}
            value={features}
            onChange={handleFeaturesInput}
          />
        </div>
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Loading…' : 'Generate Code'}
        </button>
        {error && <div className="error">{error}</div>}
      </div>

      {/* Main panel */}
      <div className="main">
        {/* App name title, bold & centered */}
        {codeBoxes.length > 0 && (
          <h1 className="app-title">{appName || 'Your App'}</h1>
        )}

        {/* Render each code box */}
        {codeBoxes.map(({ title, code }) => (
          <ChatBubble key={title} role="assistant" content={`# File: ${title}\n${code}`} />
        ))}
      </div>
    </div>
  );
}

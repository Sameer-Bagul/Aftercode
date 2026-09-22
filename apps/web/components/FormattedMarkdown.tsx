'use client';

import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  stripFirstHeading?: boolean;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content, style, stripFirstHeading = false }) => {
  if (!content) return null;

  let text = content;
  if (stripFirstHeading) {
    text = text.replace(/^#+\s+.*?\n+/, '');
  }

  const renderInlineFormatted = (rawText: string) => {
    const parts = rawText.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} style={{ fontWeight: 700, color: '#0f172a' }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} style={{ fontStyle: 'italic', color: '#475569' }}>
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            style={{
              background: '#f1f5f9',
              color: '#0284c7',
              padding: '2px 7px',
              borderRadius: '5px',
              fontSize: '0.85em',
              fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
              border: '1px solid #e2e8f0',
              fontWeight: 600,
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let keyCounter = 0;

  const flushList = () => {
    if (currentList) {
      const isOl = currentList.type === 'ol';
      const ListTag = isOl ? 'ol' : 'ul';
      elements.push(
        <ListTag
          key={`list-${keyCounter++}`}
          style={{
            margin: '8px 0 16px',
            paddingLeft: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {currentList.items.map((item, idx) => (
            <li key={idx} style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>
              {renderInlineFormatted(item)}
            </li>
          ))}
        </ListTag>
      );
      currentList = null;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${keyCounter++}`} style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '16px 0 8px', letterSpacing: '-0.01em' }}>
          {renderInlineFormatted(trimmed.substring(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${keyCounter++}`} style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '16px 0 8px', letterSpacing: '-0.01em' }}>
          {renderInlineFormatted(trimmed.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${keyCounter++}`} style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '14px 0 6px', letterSpacing: '-0.01em' }}>
          {renderInlineFormatted(trimmed.substring(4))}
        </h3>
      );
    } else if (trimmed.startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${keyCounter++}`} style={{ fontSize: '0.975rem', fontWeight: 700, color: '#0284c7', margin: '12px 0 4px' }}>
          {renderInlineFormatted(trimmed.substring(5))}
        </h4>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.replace(/^[-*]\s*/, '');
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
    } else {
      flushList();
      elements.push(
        <p key={`p-${keyCounter++}`} style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, margin: '4px 0' }}>
          {renderInlineFormatted(trimmed)}
        </p>
      );
    }
  });

  flushList();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...style }}>
      {elements}
    </div>
  );
};


'use client';

import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content, style }) => {
  if (!content) return null;

  // Split into paragraphs by double newlines
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const renderInlineFormatted = (text: string) => {
    // Regex matching **bold**, *italic*, and `code`
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

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
              fontSize: '0.875em',
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', ...style }}>
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();

        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#0f172a',
                marginTop: idx > 0 ? '12px' : 0,
                marginBottom: '4px',
                letterSpacing: '-0.01em',
              }}
            >
              {renderInlineFormatted(trimmed.substring(4))}
            </h3>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const listItems = trimmed.split('\n').filter((l) => l.trim().length > 0);
          return (
            <ul key={idx} style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx} style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>
                  {renderInlineFormatted(item.replace(/^[-*]\s*/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} style={{ fontSize: '0.975rem', color: '#334155', lineHeight: 1.7, margin: 0 }}>
            {renderInlineFormatted(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

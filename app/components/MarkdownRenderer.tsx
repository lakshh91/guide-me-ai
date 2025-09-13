"use client";

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  isDark?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isDark = false }) => {
  // Split content into lines for processing
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="prose-h3">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="prose-h2">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="prose-h1">
          {line.slice(2)}
        </h1>
      );
    }
    // Code blocks
    else if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      const code = codeLines.join('\n');
      elements.push(
        <div key={i} className="my-4 rounded-lg overflow-hidden">
          <SyntaxHighlighter
            language={language || 'text'}
            style={isDark ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
            showLineNumbers={codeLines.length > 5}
            wrapLines={true}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }
    // Inline code
    else if (line.includes('`')) {
      const parts = line.split('`');
      const processedLine = parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <code
              key={index}
              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono"
            >
              {part}
            </code>
          );
        }
        return part;
      });
      elements.push(
        <p key={i} className="mb-2 text-gray-800 dark:text-gray-200 leading-relaxed">
          {processedLine}
        </p>
      );
    }
    // Lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* ') || lines[i].trim() === '')) {
        if (lines[i].trim()) {
          listItems.push(lines[i].slice(2));
        }
        i++;
      }
      i--; // Adjust for the outer loop increment
      
      elements.push(
        <ul key={i} className="prose-ul">
          {listItems.map((item, idx) => (
            <li key={idx} className="prose-li">{item}</li>
          ))}
        </ul>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && (/^\d+\.\s/.test(lines[i]) || lines[i].trim() === '')) {
        if (lines[i].trim()) {
          listItems.push(lines[i].replace(/^\d+\.\s/, ''));
        }
        i++;
      }
      i--; // Adjust for the outer loop increment
      
      elements.push(
        <ol key={i} className="prose-ol">
          {listItems.map((item, idx) => (
            <li key={idx} className="prose-li">{item}</li>
          ))}
        </ol>
      );
    }
    // Blockquotes
    else if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i].trim() === '')) {
        if (lines[i].trim()) {
          quoteLines.push(lines[i].slice(2));
        }
        i++;
      }
      i--; // Adjust for the outer loop increment
      
      elements.push(
        <blockquote key={i} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3 italic text-gray-700 dark:text-gray-300">
          {quoteLines.map((quoteLine, idx) => (
            <p key={idx} className="mb-1">{quoteLine}</p>
          ))}
        </blockquote>
      );
    }
    // Horizontal rules
    else if (line.startsWith('---') || line.startsWith('***')) {
      elements.push(
        <hr key={i} className="my-4 border-gray-300 dark:border-gray-600" />
      );
    }
    // Regular paragraphs
    else if (line.trim()) {
      // Check for bold and italic text
      const processedLine = line
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      elements.push(
        <p 
          key={i} 
          className="mb-2 text-gray-800 dark:text-gray-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    }
    // Empty lines
    else {
      elements.push(<br key={i} />);
    }
    
    i++;
  }

  return <div className="ai-message prose prose-sm max-w-none">{elements}</div>;
};

export default MarkdownRenderer;

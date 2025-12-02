import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isMapsUrl, isEmailUrl, isUsosUrl } from '../../utils/messageParser';
import './MessageContent.css';

interface MessageContentProps {
  text: string;
}

export const MessageContent = memo(({ text }: MessageContentProps) => {
  return (
    <div className="message-content markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom link renderer to add icons and styling
          a: ({ children, href, ...props }) => {
            const url = href || '';
            const derivedIcon = isMapsUrl(url) ? '🗺️ ' : isUsosUrl(url) ? '📧 ' : isEmailUrl(url) ? '✉️ ' : '🔗 ';
            const linkClass = isMapsUrl(url) ? 'message-link maps-link' :
                              isUsosUrl(url) ? 'message-link usos-link' :
                              isEmailUrl(url) ? 'message-link email-link' :
                              'message-link default-link';

            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={url}
                className={linkClass}
                {...props}
              >
                {derivedIcon}{children}
              </a>
            );
          },
          // Preserve line breaks
          p: ({ children }) => <p className="message-paragraph">{children}</p>,
          // Style code blocks
          code: ({ inline, children, className, ...props }: { inline?: boolean; children?: React.ReactNode; className?: string }) => {
            return inline ? (
              <code className="inline-code" {...props}>{children}</code>
            ) : (
              <code className="code-block" {...props}>{children}</code>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
});

MessageContent.displayName = 'MessageContent';

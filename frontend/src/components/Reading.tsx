// src/components/Reading.tsx

import React, { useEffect, useMemo, useState } from 'react';
import HighlightableInstructionsForReading from './HighlightableInstructionsForReadings';

// Import hardcoded data as fallback
import { lessonContents, type LessonContent, type ParagraphItem } from './LessonContents';

import api, { BACKEND_URL } from '../api';

// Block types from the API
interface ContentBlock {
  type: 'heading' | 'subheading' | 'paragraph' | 'image';
  text?: string;
  fileId?: string;
  caption?: string;
  alt?: string;
  align?: 'center' | 'left' | 'right';
  width?: number; // percentage, e.g. 80 = 80%
}

interface ApiLesson {
  _id: string;
  courseId: number;
  title: string;
  blocks: ContentBlock[];
  quiz: any[];
  interactiveTerms?: Record<string, string>;
}

interface Props {
  courseId?: number;
  onExplainRequest: (text: string) => void;
  onViewAnalogy: (text: string) => void;
}

// Dev: Enable/disable interactive terms
const ENABLE_INTERACTIVE_TERMS = false;

// Component for hover tooltip on interactive terms
const InteractiveTerm: React.FC<{ term: string; definition: string }> = ({ term, definition }) => {
  const [hover, setHover] = useState(false);
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={styles.interactive}
    >
      {term}
      {hover && <div style={styles.tooltip}>{definition}</div>}
    </span>
  );
};

// Image block component — non-selectable, accessible
const ImageBlock: React.FC<{ block: ContentBlock }> = ({ block }) => {
  const widthPercent = block.width ?? 80;
  const align = block.align ?? 'center';

  const figureStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
    margin: '32px 0',
    userSelect: 'none',
    pointerEvents: 'none' as const,
  };

  const imgStyle: React.CSSProperties = {
    maxWidth: `${widthPercent}%`,
    width: '100%',
    borderRadius: 8,
    objectFit: 'contain' as const,
  };

  const captionStyle: React.CSSProperties = {
    marginTop: 8,
    fontSize: '0.9rem',
    color: '#aab4c8',
    fontStyle: 'italic',
    textAlign: align,
    maxWidth: `${widthPercent}%`,
    userSelect: 'none',
  };

  return (
    <figure role="figure" aria-label={block.alt || block.caption || 'Lesson image'} style={figureStyle}>
      <img
        src={`${BACKEND_URL}/file/${block.fileId}`}
        alt=""
        aria-hidden="true"
        style={imgStyle}
        draggable={false}
      />
      {block.caption && <figcaption style={captionStyle}>{block.caption}</figcaption>}
    </figure>
  );
};

const Reading: React.FC<Props> = ({
  courseId = 0,
  onExplainRequest,
  onViewAnalogy,
}) => {
  const [apiLesson, setApiLesson] = useState<ApiLesson | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  // Fetch lesson from API
  useEffect(() => {
    let cancelled = false;
    setFetchAttempted(false);
    setApiLesson(null);

    api.get(`/api/lessons/${courseId}`)
      .then(res => {
        if (!cancelled) setApiLesson(res.data);
      })
      .catch(() => {
        // Fall back to hardcoded content
      })
      .finally(() => {
        if (!cancelled) setFetchAttempted(true);
      });

    return () => { cancelled = true; };
  }, [courseId]);

  // Use API data if available, otherwise fall back to hardcoded
  const useApi = apiLesson !== null;
  const fallbackContent: LessonContent | undefined = lessonContents[courseId];

  if (!useApi && fetchAttempted && !fallbackContent) {
    return <p>Lesson content not found.</p>;
  }

  // Get interactive terms
  const interactiveTerms: Record<string, string> = useApi
    ? (apiLesson.interactiveTerms || {})
    : (fallbackContent?.interactiveTerms || {});

  const renderedContent = useMemo(() => {
    if (useApi && apiLesson) {
      // Render from API blocks
      return apiLesson.blocks.map((block, idx) => {
        if (block.type === 'image') {
          return <ImageBlock key={idx} block={block} />;
        }

        const text = block.text || '';
        let elementStyle = styles.paragraph;
        let Element: keyof JSX.IntrinsicElements = 'p';

        if (block.type === 'heading') {
          elementStyle = styles.heading;
          Element = 'h3';
        } else if (block.type === 'subheading') {
          elementStyle = styles.subheading;
          Element = 'h4';
        }

        // Process interactive terms for paragraphs
        if (block.type === 'paragraph' && interactiveTerms && ENABLE_INTERACTIVE_TERMS) {
          let keyCounter = 0;
          let nodes: Array<string | JSX.Element> = [text];

          Object.entries(interactiveTerms).forEach(([term, definition]) => {
            const regex = new RegExp(`(${term})`, 'gi');
            nodes = nodes.flatMap((node) => {
              if (typeof node !== 'string') return [node];
              return node.split(regex).map((part) =>
                part.toLowerCase() === term.toLowerCase() ? (
                  <InteractiveTerm
                    key={`${idx}-${keyCounter++}`}
                    term={part}
                    definition={definition}
                  />
                ) : (
                  part
                )
              );
            });
          });

          return <Element key={idx} style={elementStyle}>{nodes}</Element>;
        }

        return <Element key={idx} style={elementStyle}>{text}</Element>;
      });
    }

    // Fallback: render from hardcoded content
    if (!fallbackContent) return null;

    return fallbackContent.paragraphs.map((item, paraIdx) => {
      let text: string;
      let type: 'heading' | 'subheading' | 'paragraph' = 'paragraph';

      if (typeof item === 'string') {
        text = item;
      } else {
        text = item.text;
        type = item.type || 'paragraph';
      }

      let elementStyle = styles.paragraph;
      let Element: keyof JSX.IntrinsicElements = 'p';

      if (type === 'heading') {
        elementStyle = styles.heading;
        Element = 'h3';
      } else if (type === 'subheading') {
        elementStyle = styles.subheading;
        Element = 'h4';
      }

      if (type === 'paragraph' && fallbackContent.interactiveTerms && ENABLE_INTERACTIVE_TERMS) {
        let keyCounter = 0;
        let nodes: Array<string | JSX.Element> = [text];

        Object.entries(fallbackContent.interactiveTerms).forEach(([term, definition]) => {
          const regex = new RegExp(`(${term})`, 'gi');
          nodes = nodes.flatMap((node) => {
            if (typeof node !== 'string') return [node];
            return node.split(regex).map((part) =>
              part.toLowerCase() === term.toLowerCase() ? (
                <InteractiveTerm
                  key={`${paraIdx}-${keyCounter++}`}
                  term={part}
                  definition={definition}
                />
              ) : (
                part
              )
            );
          });
        });

        return <Element key={paraIdx} style={elementStyle}>{nodes}</Element>;
      }

      return <Element key={paraIdx} style={elementStyle}>{text}</Element>;
    });
  }, [useApi, apiLesson, fallbackContent, interactiveTerms]);

  if (!fetchAttempted && !fallbackContent) {
    return <p style={{ color: '#aab4c8' }}>Loading lesson...</p>;
  }

  return (
    <HighlightableInstructionsForReading
      onExplain={onExplainRequest}
      onViewAnalogy={onViewAnalogy}
    >
      <div style={styles.readingBox}>
        {renderedContent}
      </div>
    </HighlightableInstructionsForReading>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  readingBox: {
    background: 'transparent',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.2,
    cursor: 'text',
  },
  paragraph: {
    marginBottom: '24px',
  },
  heading: {
    fontSize: '1.4rem',
    fontWeight: 600,
    letterSpacing: '0.75px',
    marginTop: '32px',
    marginBottom: '16px',
  },
  subheading: {
    fontSize: '1.2rem',
    fontWeight: 500,
    letterSpacing: '0.75px',
    marginTop: '24px',
    marginBottom: '12px',
  },
  title: {
    color: '#FFFFFF',
    marginTop: 0,
    marginBottom: 16,
  },
  interactive: {
    position: 'relative',
    display: 'inline-block',
    color: '#a4c8ff',
    cursor: 'default',
    textDecoration: 'underline dashed',
    fontWeight: 600,
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: '#fff',
    padding: '6px 8px',
    borderRadius: 4,
    whiteSpace: 'normal',
    width: 200,
    zIndex: 1000,
  },
};

export default Reading;

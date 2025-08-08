// src/components/Reading.tsx

import React, { useMemo, useState } from 'react';
import HighlightableInstructionsForReading from './HighlightableInstructionsForReadings';

// Define the interfaces locally to match the new structure
interface ParagraphItem {
  text: string;
  type?: 'heading' | 'subheading' | 'paragraph';
}

interface LessonContent {
  title: string;
  paragraphs: (string | ParagraphItem)[];
  interactiveTerms?: Record<string, string>;
}

// Import the lesson contents data
import { lessonContents } from './LessonContents';

interface Props {
  courseId?: number;
  onExplainRequest: (text: string) => void;
  onViewAnalogy:   (text: string) => void;
}

//Dev: Enable/disable interactive terms
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

const Reading: React.FC<Props> = ({
  courseId = 0,
  onExplainRequest,
  onViewAnalogy,
}) => {
  const content: LessonContent | undefined = lessonContents[courseId];
  if (!content) return <p>Lesson content not found.</p>;

  const renderedParagraphs = useMemo(() => {
    return content.paragraphs.map((item, paraIdx) => {
      // Handle both string and ParagraphItem formats
      let text: string;
      let type: 'heading' | 'subheading' | 'paragraph' = 'paragraph';
      
      if (typeof item === 'string') {
        text = item;
      } else {
        text = item.text;
        type = item.type || 'paragraph';
      }

      // Determine which style to use based on type
      let elementStyle = styles.paragraph;
      let Element: keyof JSX.IntrinsicElements = 'p';
      
      if (type === 'heading') {
        elementStyle = styles.heading;
        Element = 'h3';
      } else if (type === 'subheading') {
        elementStyle = styles.subheading;
        Element = 'h4';
      }

      // Process interactive terms only for regular paragraphs and if enabled
      if (type === 'paragraph' && content.interactiveTerms && ENABLE_INTERACTIVE_TERMS) {
        let keyCounter = 0;
        let nodes: Array<string | JSX.Element> = [text];

        Object.entries(content.interactiveTerms).forEach(([term, definition]) => {
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

      // For headings/subheadings or paragraphs without interactive terms
      return <Element key={paraIdx} style={elementStyle}>{text}</Element>;
    });
  }, [content]);

  return (
    <HighlightableInstructionsForReading
      onExplain={onExplainRequest}
      onViewAnalogy={onViewAnalogy}
    >
      <div style={styles.readingBox}>
        {/* <h2 style={styles.title}>{content.title}</h2> */}
        {renderedParagraphs}
      </div>
    </HighlightableInstructionsForReading>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  readingBox: {
    // padding: 20,
    // borderRadius: 8,
    background: 'transparent',
    // border: '1px solid rgba(255,255,255,0.2)',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.2,
    cursor: 'text',
  },
  paragraph: {
    marginBottom: '24px', // Extra spacing between regular paragraphs
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

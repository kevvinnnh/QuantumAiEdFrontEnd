// src/components/Reading/Reading.tsx

import React, { useMemo, useState } from 'react';
import HighlightableInstructionsForReading from '../HighlightableInstructionsForReading/HighlightableInstructionsForReading';
import styles from './Reading.module.scss';

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
import { lessonContents } from '../LessonContents';

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
      className={styles.interactive}
    >
      {term}
      {hover && <div className={styles.tooltip}>{definition}</div>}
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
      let elementClassName = styles.paragraph;
      let Element: keyof JSX.IntrinsicElements = 'p';
      
      if (type === 'heading') {
        elementClassName = styles.heading;
        Element = 'h3';
      } else if (type === 'subheading') {
        elementClassName = styles.subheading;
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

        return <Element key={paraIdx} className={elementClassName}>{nodes}</Element>;
      }

      // For headings/subheadings or paragraphs without interactive terms
      return <Element key={paraIdx} className={elementClassName}>{text}</Element>;
    });
  }, [content]);

  return (
    <HighlightableInstructionsForReading
      onExplain={onExplainRequest}
      onViewAnalogy={onViewAnalogy}
    >
      <div className={styles.readingBox}>
        {/* <h2 className={styles.title}>{content.title}</h2> */}
        {renderedParagraphs}
      </div>
    </HighlightableInstructionsForReading>
  );
};

export default Reading;
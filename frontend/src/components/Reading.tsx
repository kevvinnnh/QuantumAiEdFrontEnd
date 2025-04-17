// src/components/Reading.tsx

import React, { useMemo, useState } from 'react';
import HighlightableInstructionsForReading from './HighlightableInstructionsForReadings';  // ← fixed
import { lessonContents, LessonContent } from './LessonContents';

interface Props {
  courseId?: number;
  onExplainRequest: (text: string) => void;
  onViewAnalogy:   (text: string) => void;
}

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
    if (!content.interactiveTerms) {
      return content.paragraphs.map((raw, idx) => <p key={idx}>{raw}</p>);
    }

    return content.paragraphs.map((raw, paraIdx) => {
      let keyCounter = 0;
      let nodes: Array<string | JSX.Element> = [raw];

      Object.entries(content.interactiveTerms || {}).forEach(([term, definition]) => {
        const regex = new RegExp(`(${term})`, 'gi');
        nodes = nodes.flatMap(node =>
          typeof node === 'string'
            ? node.split(regex).map(part =>
                part.toLowerCase() === term.toLowerCase() ? (
                  <InteractiveTerm
                    key={`${paraIdx}-${keyCounter++}`}
                    term={part}
                    definition={definition}
                  />
                ) : (
                  part
                )
              )
            : [node]
        );
      });

      return <p key={paraIdx}>{nodes}</p>;
    });
  }, [content]);

  return (
    <HighlightableInstructionsForReading
      onExplain={onExplainRequest}
      onViewAnalogy={onViewAnalogy}
    >
      <div style={styles.readingBox}>
        <h2 style={styles.title}>{content.title}</h2>
        {renderedParagraphs}
      </div>
    </HighlightableInstructionsForReading>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  readingBox: {
    padding: 20,
    borderRadius: 8,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#f8f9fa',
    lineHeight: 1.7,
    fontSize: '1.05rem',
  },
  title: {
    color: '#566395',
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

// Unified lesson/content type definitions.

export interface ParagraphItem {
  text: string;
  type?: 'heading' | 'subheading' | 'paragraph';
}

export interface LessonContent {
  title: string;
  paragraphs: (string | ParagraphItem)[];
  interactiveTerms?: Record<string, string>;
}

export interface ContentBlock {
  type: 'heading' | 'subheading' | 'paragraph' | 'image';
  text?: string;
  fileId?: string;
  caption?: string;
  alt?: string;
  align?: 'center' | 'left' | 'right';
  width?: number;
}

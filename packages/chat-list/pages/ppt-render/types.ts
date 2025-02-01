export interface Element {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  style: {
    [key: string]: any;
  };
}

export interface Slide {
  id: string;
  layout: string;
  background: {
    color: string;
    image?: string;
  };
  elements: Element[];
}

export interface PPTStructure {
  slides: Slide[];
  theme: {
    colors: {
      primary: string;
      secondary: string;
    };
    fonts: {
      title: string;
      body: string;
    };
  };
  metadata: {
    title: string;
    subject: string;
    author: string;
    company: string;
  };
}
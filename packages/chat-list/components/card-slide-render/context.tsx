import userApi from '@api/user';
import { ISlideItem, Metadata } from 'chat-list/types/api/slide';

import React, { createContext, useCallback, useEffect, useLayoutEffect, useState } from 'react';


interface ISlideContextState {
  slideData: ISlideItem[];
  slideImages: { title: string, images: string[] }[]
  metadata: Metadata;
  theme: string;
  setSlideData: (slideData: ISlideItem[]) => void;
  status: 'generating' | 'done';
}

interface ISlideProviderProps {
  children: React.ReactNode;
  slideData: ISlideItem[];
  slideImages: { title: string, images: string[] }[];
  metadata: Metadata;
  theme: string;

}

const SlideContext = createContext<ISlideContextState>(null);

const SlideProvider = ({ children, slideData: defaultSlideData, slideImages, metadata, theme: defaultTheme }: ISlideProviderProps) => {
  const [theme, setTheme] = useState(defaultTheme);
  // const [colors, setColors] = useState<any>(null);
  // const [pages, setPages] = useState([]);
  // const [temps, setTemps] = useState([]);
  // const [fonts, setFonts] = useState({
  //   title: 'Arial',
  //   body: 'Arial',
  //   web: {
  //     title: 'Arial',
  //     body: 'Arial'
  //   }
  // })
  const [slideData, setSlideData] = useState(defaultSlideData);

  useEffect(() => {
    setSlideData(defaultSlideData)
  }, [defaultSlideData])

  return (
    <SlideContext.Provider value={{
      slideData,
      slideImages,
      metadata,
      theme,
      setSlideData
    }}>
      {children}
    </SlideContext.Provider>
  );
};

export { SlideContext, SlideProvider };

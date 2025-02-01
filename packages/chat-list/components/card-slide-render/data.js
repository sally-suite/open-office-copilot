const pptStructure = {
  slides: [
    {
      id: 'slide1',
      layout: 'CUSTOM',
      background: {
        color: '#E6F3FF',
      },
      elements: [
        {
          type: 'text',
          content: '秦国的政治体制与改革',
          style: {
            fontSize: 36,
            fontColor: '#000080',
            fontFamily: 'SimHei',
            bold: true,
            italic: false,
            underline: false,
          },
          position: {
            x: 5,
            y: 0.5,
          },
          size: {
            width: 5,
            height: 0.8,
          },
        },
        {
          type: 'image',
          src: 'qin_shi_huang.png',
          alt: 'Portrait of Qin Shi Huang',
          position: {
            x: 0.5,
            y: 1.5,
          },
          size: {
            width: 4,
            height: 3.5,
          },
        },
        {
          type: 'text',
          content: '商鞅变法',
          style: {
            fontSize: 24,
            fontColor: '#000080',
            fontFamily: 'SimHei',
            bold: true,
          },
          position: {
            x: 5,
            y: 1.5,
          },
          size: {
            width: 4.5,
            height: 0.5,
          },
        },
        {
          type: 'text',
          content: '秦孝公时期，商鞅进行了一系列深刻的政治、经济和军事改革。',
          style: {
            fontSize: 18,
            fontColor: '#000000',
            fontFamily: 'SimSun',
          },
          position: {
            x: 5,
            y: 2,
          },
          size: {
            width: 4.5,
            height: 1,
          },
        },
        {
          type: 'text',
          content: '集权制度',
          style: {
            fontSize: 24,
            fontColor: '#000080',
            fontFamily: 'SimHei',
            bold: true,
          },
          position: {
            x: 5,
            y: 3,
          },
          size: {
            width: 4.5,
            height: 0.5,
          },
        },
        {
          type: 'text',
          content: '秦国建立了强大的中央集权制度。',
          style: {
            fontSize: 18,
            fontColor: '#000000',
            fontFamily: 'SimSun',
          },
          position: {
            x: 5,
            y: 3.5,
          },
          size: {
            width: 4.5,
            height: 0.5,
          },
        },
        {
          type: 'text',
          content: '法律制度',
          style: {
            fontSize: 24,
            fontColor: '#000080',
            fontFamily: 'SimHei',
            bold: true,
          },
          position: {
            x: 5,
            y: 4,
          },
          size: {
            width: 4.5,
            height: 0.5,
          },
        },
        {
          type: 'text',
          content: '秦国制定了严格的法律制度。',
          style: {
            fontSize: 18,
            fontColor: '#000000',
            fontFamily: 'SimSun',
          },
          position: {
            x: 5,
            y: 4.5,
          },
          size: {
            width: 4.5,
            height: 0.5,
          },
        },
      ],
    },
  ],
  theme: {
    colors: {
      primary: '#000080',
      secondary: '#4169E1',
    },
    fonts: {
      title: 'SimHei',
      body: 'SimSun',
    },
  },
  metadata: {
    title: '秦朝的政治体制与改革',
    subject: '中国古代史',
    author: '历史学教授',
    company: '某大学历史系',
  },
};

export default pptStructure;

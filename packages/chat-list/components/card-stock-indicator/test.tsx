import React from 'react';
import code from './data/code.md';
import data from './data/data.json';
import CardEchart from './index';

export default function Test() {
  return (
    <CardEchart
      code={code}
      data={data}
      onError={(err) => {
        console.log(err);
      }}
    />
  );
}

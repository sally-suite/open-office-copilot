import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import Button from '../button';
import sheetService from '@api/sheet';
import colors from 'chat-list/data/templates/colors';


export default function CardCreate() {
  const [colorIndex, setColor] = useState(0);

  const handleAddInNew = async () => {
    // const theme = themes[colorIndex];
    await sheetService.formatTable(colors[colorIndex]);
  };
  const onSelectTheme = (index: number) => {
    setColor(index);
  };
  return (
    <Card className="w-full">
      <CardTitle>Format Sheet</CardTitle>
      <CardContent className=" grid grid-cols-4 md:grid-cols-6 w-72 md:w-full">
        {colors.map(
          (
            { headerRowColor, firstRowColor, secondRowColor, footerRowColor },
            index
          ) => {
            return (
              <div
                className={` m-1 h-12 border-2 border-black-50 hover:border-primary cursor-pointer ${colorIndex === index ? 'border-primary' : ''
                  }`}
                key={index}
                onClick={onSelectTheme.bind(null, index)}
              >
                <div
                  className="h-1/4 "
                  style={{ backgroundColor: headerRowColor }}
                ></div>
                <div
                  className="h-1/4 "
                  style={{ backgroundColor: firstRowColor }}
                ></div>
                <div
                  className="h-1/4 "
                  style={{ backgroundColor: secondRowColor }}
                ></div>
                <div
                  className="h-1/4 "
                  style={{ backgroundColor: footerRowColor }}
                ></div>
              </div>
            );
          }
        )}
      </CardContent>
      <CardActions>
        <Button action="create" color="primary" onClick={handleAddInNew}>
          Ok
        </Button>
      </CardActions>
    </Card>
  );
}

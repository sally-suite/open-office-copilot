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
import { colors } from 'chat-list/data/templates/colors';

interface ICardFilterProps {
  rows: { row: number, data: any }[];
  color: string;
}

export default function CardFilter(props: ICardFilterProps) {
  const { rows, color } = props;
  const [colorIndex, setColor] = useState(colors.findIndex(p => p === color));
  const hightLightRow = async () => {
    // const theme = themes[colorIndex];
    const rowNums = rows.map(p => p.row);
    await sheetService.highlightRowsWithColor(rowNums, colors[colorIndex]);
  };
  const onSelectTheme = (index: number) => {
    setColor(index);
  };
  return (
    <Card className="w-full">
      <CardTitle>Update Highlight Color</CardTitle>
      <CardContent className=" flex flex-row flex-wrap justify-center">
        {colors.map(
          (
            color,
            index
          ) => {
            return (
              <div
                className={`h-12 w-1/4 border-2 hover:border-primary cursor-pointer ${colorIndex === index ? 'border-primary' : 'border-white '
                  }`}
                key={index}
                onClick={onSelectTheme.bind(null, index)}
                style={{
                  backgroundColor: color
                }}
              />
            )
          }
        )}

      </CardContent>
      <CardActions>
        <Button action="create" color="primary" onClick={hightLightRow}>
          Ok
        </Button>
      </CardActions>
    </Card>
  )
}

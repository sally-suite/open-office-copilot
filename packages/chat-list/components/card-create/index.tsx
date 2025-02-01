import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import Button from '../button';
import sheet from '@api/sheet';
import colors from 'chat-list/data/templates/colors';
import { DataValidationColConfig } from '../../types/api/sheet';
import { FieldConfig } from 'chat-list/types/field';

interface ICardCreateProps {
  name: string;
  fields: FieldConfig[];
}

export function getTitles(fields: FieldConfig[]) {
  const titles = fields.map((field: FieldConfig) => {
    if (typeof field === 'string') {
      return field;
    }
    return field.name;
  });
  return titles;
}
export function getColConfig(fields: FieldConfig[]): DataValidationColConfig[] {
  const titles = fields
    // .filter((p) => typeof p !== 'string')
    .map((field: FieldConfig, index) => {
      if (typeof field === 'string') {
        return null;
      }
      return {
        col: index,
        ...field,
      };
    })
    .filter((p) => !!p);
  return titles as unknown as DataValidationColConfig[];
}

export function CardCreate(props: ICardCreateProps) {
  const { name, fields = [] } = props;
  const [colorIndex, setColor] = useState(0);

  const handleAddInNew = async () => {
    const titles = getTitles(fields);

    const options = colors[colorIndex];
    await sheet.initSheet(name, titles, options);
    const colConfig = getColConfig(fields);
    await sheet.setDataValidationAfterRow(1, colConfig, []);
  };
  const onSelectTheme = (index: number) => {
    setColor(index);
  };
  return (
    <Card className=" w-72 md:w-full">
      <CardTitle>Create {name}</CardTitle>
      <CardContent>
        <p>This template include columns:</p>
        <ol className="list-decimal pl-8">
          {fields.map((field) => {
            if (typeof field === 'string') {
              return <li key={field}>{field}</li>;
            }
            return <li key={field.name}>{field.name}</li>;
          })}
        </ol>
        <p>Do you want to create new sheet ?</p>
      </CardContent>
      <CardContent className="grid grid-cols-4  md:grid-cols-6 w-72 md:w-full">
        {colors.map(
          (
            { headerRowColor, firstRowColor, secondRowColor, footerRowColor },
            index
          ) => {
            return (
              <div
                className={`m-1 h-12 border-2 border-black-50 hover:border-primary cursor-pointer ${colorIndex === index ? ' border-primary ' : ''
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

export default React.memo(CardCreate);

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import { RadioGroup, RadioGroupItem } from 'chat-list/components/ui/radio-group';
import Button from '../button';
import sheetApi from '@api/sheet';
import { ModeType } from 'chat-list/types/edit';

export interface ICardSelectRangeProps {
  mode: ModeType;
  onRangeChange: (range: string) => void;
  onModeChange: (mode: ModeType) => void;
}

export default function CardSelectRange(
  props: ICardSelectRangeProps
) {
  const { mode, onRangeChange, onModeChange } = props;
  const [range, setRange] = useState('');
  const [editMode, setEditMode] = useState<ModeType>(mode);
  const [showMore, setShowMore] = useState(false);
  const onSelect = async () => {
    const range = await sheetApi.getRangeA1Notation();
    setRange(range);
    onRangeChange?.(range);
  };
  const handleModeChange = (val: ModeType) => {
    setEditMode(val);
    onModeChange?.(val);
  };
  const options = [{ label: 'Auto', value: 'auto' },
  { label: 'Data', value: 'data' },
  { label: 'Function', value: 'function' }];
  return (
    <Card className="w-card">
      <CardTitle>Edit Sheet</CardTitle>
      <CardContent className="markdown flex flex-col justify-center overflow-hidden">
        <label className="input-label">Edit Mode:</label>
        <div>
          <RadioGroup className="flex flex-row" defaultValue={editMode} onValueChange={handleModeChange}>
            {
              options.map(({ value, label }) => {
                return (
                  <div key={value} className="flex items-center">
                    <RadioGroupItem id={`x-${value}}`} value={value} />
                    <label
                      className="mx-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor={`x-${value}}`}>{label}</label>
                  </div>
                );
              })
            }
          </RadioGroup>
          {editMode == 'auto' && (
            <>
              <p>
                In <code>AUTO</code> mode, I&apos;ll let GPT determine whether
                to use <code>DATA</code> mode or <code>FUNCTION</code> mode to
                process your data.
              </p>
              {showMore && (
                <>
                  <p>Data mode can do some works like:</p>
                  <ol>
                    <li>Translation</li>
                    <li>Answering questions</li>
                    <li>Literary composition</li>
                  </ol>
                  <p>Function mode can do some works like:</p>
                  <ol>
                    <li>String manipulation</li>
                    <li>Mathematical operations</li>
                    <li>Data format conversion</li>
                    <li>Data copying</li>
                  </ol>
                </>
              )}
            </>
          )}
          {editMode == 'data' && (
            <>
              <p>
                In <code>DATA</code> mode, I&apos;ll let GPT edit sheet for you,
                you can do some creative works.
              </p>
              {showMore && (
                <>
                  <p>You can do some works like:</p>
                  <ol>
                    <li>Translate it into English for me</li>
                    <li>
                      Help me answer the questions in the first column by
                      filling in the answers in the second column
                    </li>
                  </ol>
                  <p>This mode may consume more tokens.</p>
                </>
              )}
            </>
          )}
          {editMode == 'function' && (
            <>
              <p>
                In <code>FUNCTION</code> mode, I&apos;ll let GPT generate
                function and handle data on local.
              </p>
              {showMore && (
                <>
                  <p>
                    If you are dealing with a large amount of data and
                    understand some programming skills, this model is more
                    appropriate.
                  </p>
                  <p>You can do some works like:</p>
                  <ol>
                    <li>Add prefix $ to the second column</li>
                    <li>Add 100 to the third column</li>
                  </ol>
                </>
              )}
            </>
          )}
        </div>
        {showMore ? (
          <a
            href="#"
            className=" text-blue-500"
            onClick={() => setShowMore(!showMore)}
          >
            Hide
          </a>
        ) : (
          <a
            href="#"
            className=" text-blue-500"
            onClick={() => setShowMore(!showMore)}
          >
            More
          </a>
        )}
        <label className="input-label">Edit Range:</label>
        <code>{range || 'All Sheet'}</code>
        <div className="mt-2">
          <Button action="select-range" color="primary" onClick={onSelect}>
            Ok
          </Button>
        </div>
        <p>
          Please select the data you want to edit and click Ok. By default, all
          data will be selected.
        </p>
      </CardContent>
    </Card>
  );
}

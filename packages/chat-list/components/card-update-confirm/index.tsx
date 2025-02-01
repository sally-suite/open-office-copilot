import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import Button from '../button';
import sheetApi from '@api/sheet';

export interface ICardUpdateConfirmProps {
  data: string[][];
  onUpdate?: () => void;
  onCancel?: () => void;
}

export default React.memo(function CardSelectRange(
  props: ICardUpdateConfirmProps
) {
  const { data, onUpdate, onCancel } = props;

  const onOk = async () => {
    await sheetApi.setValues(data);
    onUpdate?.();
  };
  const handleCancel = () => {
    onCancel?.();
  };

  const renderTable = () => {
    try {
      const trs = data.map((row, index) => {
        return (
          <tr key={index} className="border-b border-gray-200">
            {row.map((cell, cellIndex) => {
              return (
                <td
                  key={cellIndex}
                  className="px-2 py-1 border-b border-gray-200"
                >
                  {cell}
                </td>
              );
            })}
          </tr>
        );
      });
      return (
        <>
          <p>
            This is the result of the editing, if you confirm that there are no
            problems, click Ok to update to the Sheet{' '}
          </p>
          <div className=" overflow-auto max-h-52">
            <table>{trs}</table>
          </div>
        </>

      );
    } catch (e) {
      return (
        <>
          <p>
            Sorry, the GPT generated results may not meet your expectations, please review the results and then adjust your needs!
          </p>
          <pre>
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      );
    }
  };
  return (
    <Card className="w-card">
      <CardTitle>Confirm and update to Sheet</CardTitle>
      <CardContent className="flex flex-col justify-center items-center overflow-hidden">
        <div className="markdown">
          {
            renderTable()
          }
        </div>
      </CardContent>
      <CardActions>
        <Button action="select-range" className='mx-1' color="primary" onClick={onOk}>
          Ok
        </Button>
      </CardActions>
    </Card>
  );
});

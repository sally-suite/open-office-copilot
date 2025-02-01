import React, { useContext, useState } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import sheetService from '@api/sheet';
import { Edit, Play } from 'lucide-react';
import IconButton from '../button';
import { ChatContext } from 'chat-list/store/chatContext';
interface ICardFormulaProps {
  script: string;
  onComplete?: () => void;
  onError?: (erro: Error) => void;
}

export default function CardScript(props: ICardFormulaProps) {
  const { script, onComplete, onError } = props;
  const { setPlugin, plugins, setMode } = useContext(ChatContext);
  const [value, setValue] = useState(script || '');
  const [running, setRunning] = useState(false);
  const onRun = async () => {
    try {
      setRunning(true);
      await sheetService.runScript(value);
      await onComplete?.();
      setRunning(false);
    } catch (e) {
      onError?.(e);
    }
  };
  const onEdit = () => {
    // setValue(script);
    const plg = plugins.find(p => p.action == 'coder');
    plg.code = value;
    setMode(plg.action, 'custom');
    setPlugin(plg);
  };

  return (
    <Card className="w-full">
      <CardTitle>Run Script</CardTitle>
      <CardContent className=" flex flex-row flex-wrap justify-center">
        <div className="markdown w-full mt-2">
          <pre className='bg-slate-700 p-1 rounded'>
            <code>
              {value}
            </code>
          </pre>

          <div className='flex flex-row justify-start items-center w-full'>

          </div>
        </div>
      </CardContent>
      <CardActions>
        <IconButton
          loading={running}
          // title={`Run code`}
          onClick={onRun}
          className='ml-0 mt-2 mx-2'
          icon={Play}
        >
          {
            running && 'Running'
          }
          {
            !running && 'Run'
          }
        </IconButton>
        <IconButton
          onClick={onEdit}
          className='ml-0 mt-2 mx-2'
          icon={Edit}
        >
          Edit
        </IconButton>
      </CardActions>
    </Card>
  );
}

import { useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';
import { SelectedRange } from '../plugins/types';

const {
    useContainer: useSelection,
    Provider: SelectionProvider,
} = createContainer(() => {
    const [selectedText, setSelectedText] = useState('');
    const [selectedRange, setSelectedRange] = useState<SelectedRange>(null);
    return {
        selectedText,
        setSelectedText,
        selectedRange,
        setSelectedRange,
    }
});

export { useSelection, SelectionProvider };

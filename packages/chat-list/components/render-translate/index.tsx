import React from 'react';
import TranslateForm from 'chat-list/components/card-translate/form';
export default React.memo(function CardTranslate() {
  return (
    <div className="flex flex-col p-2">
      <TranslateForm targetLanguage='' tone='' sheetName='' batchSize={3} />
    </div>
  );
});

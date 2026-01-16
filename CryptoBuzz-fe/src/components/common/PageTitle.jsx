import React from 'react';
import useDocumentTitle from '@/hooks/use-document-title';

const PageTitle = ({ title, description, suffix = 'Cripto Buzz' }) => {
  useDocumentTitle(title, { suffix });

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold text-black dark:text-white">{title}</h1>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
};

export default PageTitle;

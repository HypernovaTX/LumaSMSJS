import React from 'react';
import { useTranslation } from 'react-i18next';

import Error from 'error';

export default function Error404() {
  // Custom hooks
  const { t } = useTranslation();

  // Output
  return (
    <Error
      error={{
        error: '404',
        code: 404,
        message: t('error.error404Page'),
      }}
    />
  );
}

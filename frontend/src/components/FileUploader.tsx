import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@mui/system';
import { UploadFile } from '@mui/icons-material';

import { LumaButton, LumaText } from 'components';
import { GlobalContext } from 'global/GlobalContext';
import { bytesToSize } from 'lib';
import theme, { slightlyDark } from 'MUIConfig';

interface FileUploaderProp {
  accepts: string;
  disabled?: boolean;
  file?: File | null;
  onChange: (e: File | null) => void;
  onReset: () => void;
}

export function FileUploader(props: FileUploaderProp) {
  // Const
  const {
    contrastText,
    dark: darkColor,
    main: mainColor,
  } = theme.palette.primary;

  // Custom Hooks
  const { t } = useTranslation();

  // Context
  const { isMobile, toast } = useContext(GlobalContext);

  // Ref
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const dropzoneRef = useRef<HTMLDivElement>();

  // State
  const [dragging, setDragging] = useState(false);

  // Effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(initEffect, []);

  // Output
  return props.file ? (
    <Box
      p={1}
      mt={1}
      mb={3}
      width="100%"
      textAlign="center"
      color={props.disabled ? mainColor : contrastText}
      border={`2px solid ${contrastText}`}
      borderRadius="8px"
      style={{
        backgroundColor: props.disabled ? slightlyDark : darkColor,
        userSelect: 'none',
      }}
    >
      <Box mb={1}>
        <LumaText variant="h6">{t('main.selectedFile')}</LumaText>
      </Box>
      <Box
        style={{
          wordBreak: 'break-all',
        }}
      >
        <LumaText variant="body2">{props.file.name}</LumaText>
      </Box>
      <Box>
        <LumaText variant="body2">{bytesToSize(props.file.size)}</LumaText>
      </Box>
      <LumaButton
        disabled={props.disabled}
        variant="text"
        onClick={props.onReset}
        size="small"
        color="secondary"
        sx={{ my: 1 }}
      >
        {t('main.clear')}
      </LumaButton>
    </Box>
  ) : (
    <Box
      p={1}
      mt={1}
      mb={3}
      width="100%"
      textAlign="center"
      color={
        props.disabled ? slightlyDark : dragging ? contrastText : mainColor
      }
      border={`2px dashed ${
        props.disabled ? slightlyDark : dragging ? contrastText : mainColor
      }`}
      borderRadius="8px"
      component="div"
      ref={dropzoneRef}
      style={{
        userSelect: 'none',
        cursor: 'pointer',
        backgroundColor: dragging ? slightlyDark : undefined,
        transition: '200ms linear all',
      }}
      onClick={handleOpenUploader}
    >
      <UploadFile
        style={{
          color: props.disabled
            ? slightlyDark
            : dragging
            ? contrastText
            : mainColor,
          transition: '200ms linear all',
          width: 48,
          height: 48,
          pointerEvents: 'none',
        }}
      />
      <input
        type="file"
        disabled={props.disabled}
        ref={inputRef}
        style={{ display: 'none', pointerEvents: 'none' }}
        accept={props.accepts}
        onChange={(e) =>
          props.onChange(e.target?.files ? e.target.files[0] : null)
        }
      />
      <Box style={{ pointerEvents: 'none' }}>
        <LumaText variant="h5" style={{ pointerEvents: 'none' }}>
          {t(isMobile ? 'main.selectFile' : 'main.dndFile')}
        </LumaText>
      </Box>
      {isMobile ? null : (
        <Box style={{ pointerEvents: 'none' }}>
          <LumaText variant="h5" style={{ pointerEvents: 'none' }}>
            {`-${t('main.or')}-`}
          </LumaText>
        </Box>
      )}
      {isMobile ? null : (
        <LumaButton
          disabled={props.disabled}
          variant="contained"
          LinkComponent="select"
          size="large"
          sx={{ my: 1, pointerEvents: 'none' }}
          style={{
            pointerEvents: 'none',
          }}
        >
          {t('main.selectFile')}
        </LumaButton>
      )}
    </Box>
  );

  // Handles
  function handleOpenUploader() {
    if (inputRef?.current?.click) {
      inputRef.current.click();
    }
  }

  // Effect Hoists
  function initEffect() {
    const div = dropzoneRef.current;
    if (div && div.addEventListener) {
      div.addEventListener('dragenter', dragInEvent);
      div.addEventListener('dragleave', dragOutEvent);
      div.addEventListener('dragover', dragEvent);
      div.addEventListener('drop', dropEvent);
    }

    return () => {
      if (div && div.removeEventListener) {
        div.removeEventListener('dragenter', dragInEvent);
        div.removeEventListener('dragleave', dragOutEvent);
        div.removeEventListener('dragover', dragEvent);
        div.removeEventListener('drop', dropEvent);
      }
    };
  }

  // Event Function
  function dragInEvent(this: HTMLDivElement, e: DragEvent) {
    preventDefault(e);
    if (e?.dataTransfer?.items && e?.dataTransfer?.items?.length > 0) {
      setDragging(true);
    }
  }
  function dragOutEvent(this: HTMLDivElement, e: DragEvent) {
    preventDefault(e);
    setDragging(false);
  }
  function dragEvent(this: HTMLDivElement, e: DragEvent) {
    preventDefault(e);
  }
  function dropEvent(this: HTMLDivElement, e: DragEvent) {
    preventDefault(e);
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.length === 1) {
      props.onChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.length > 1) {
      toast(t('error.noMultiFile'), 'error');
    }
    setDragging(false);
  }
  function preventDefault(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }
}

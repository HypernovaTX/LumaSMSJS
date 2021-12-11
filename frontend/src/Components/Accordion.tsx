import React from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  AccordionSummaryProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import theme from 'MUIConfig';

export const LumaAccordion = styled((props: AccordionProps) => (
  <Accordion disableGutters elevation={0} square {...props} />
))(() => ({
  backgroundColor: 'rgba(0,0,0,0)',
  position: 'initial',
  border: 'none',
}));

export const LumaAccordionItem = styled((props: AccordionSummaryProps) => (
  <AccordionSummary
    expandIcon={
      <ArrowForward
        sx={{ fontSize: '1rem', color: theme.palette.primary.contrastText }}
      />
    }
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: 'rgba(0,0,0,0.1)',
  border: 'none',
  color: theme.palette.primary.contrastText,
  fontSize: '2rem',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    margin: theme.spacing(2),
  },
}));

export const LumaAccordionContent = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(0),
  color: theme.palette.primary.contrastText,
}));

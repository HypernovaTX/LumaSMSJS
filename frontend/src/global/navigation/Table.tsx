import { Box } from '@mui/material';
import theme from 'theme/styles';

interface TableProps<D extends object> {
  data: D[];
  columns: {
    name: keyof D;
    onClick?: () => void;
  }[];
}

export default function LumaTable<D extends object>(props: TableProps<D>) {
  return <table></table>;
}

import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import Popper, { PopperProps } from '@mui/material/Popper';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import type * as CSS from 'csstype';

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: ((style as CSS.Properties).top as number) + LISTBOX_PADDING,
  };

  return (
    <Typography component='li' {...dataSet[0]} noWrap style={inlineStyle}>
      {dataSet[1]}
    </Typography>
  );
}

const OuterElementContext = React.createContext({});

const InnerElement: React.ForwardRefRenderFunction<HTMLDivElement> = (
  props,
  ref
) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
};

const OuterElementType = React.forwardRef<HTMLDivElement>(InnerElement);

const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData: React.ReactChild[] = [];
  (children as React.ReactChild[]).forEach(
    (item: React.ReactChild & { children?: React.ReactChild[] }) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    }
  );

  const itemCount = itemData.length;

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={400}
          width='100%'
          // ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType='ul'
          itemSize={() => 36}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

const randomStation = (): string => {
  return `Station ${Math.floor(Math.random() * 9000) + 1000}`;
};

const OPTIONS = Array.from(new Array(10000))
  .map(() => randomStation())
  .sort((a: string, b: string) =>
    a.toUpperCase().localeCompare(b.toUpperCase())
  );

const useStyles = makeStyles(() => ({
  root: {
    [`& .${autocompleteClasses.listbox}`]: {
      boxSizing: 'border-box',
      '& ul': {
        padding: 0,
        margin: 0,
      },
    },
  },
}));

const StyledPopper = (props: PopperProps) => {
  const classes = useStyles();

  return <Popper {...props} className={classes.root} />;
};

export default function Virtualize() {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <>
      <Autocomplete
        id='virtualize-demo'
        style={{ width: 300 }}
        disableListWrap
        PopperComponent={StyledPopper}
        ListboxComponent={ListboxComponent}
        options={OPTIONS}
        renderInput={(params) => (
          <TextField {...params} label='10,000 options' />
        )}
        renderOption={(props, option, state) =>
          [props, option, state.index] as React.ReactNode
        }
        // TODO: Post React 18 update - validate this conversion, look like a hidden bug
        renderGroup={(params) => params as unknown as React.ReactNode}
        onChange={(
          _event: React.SyntheticEvent,
          newValue: string | null
        ) => {
          setValue(newValue);
        }}
      />
      {value ?? 'not set yet'}
    </>
  );
}

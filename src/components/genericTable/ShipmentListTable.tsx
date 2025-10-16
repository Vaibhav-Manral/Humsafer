import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  styled,
  tableCellClasses,
  tableRowClasses,
  Paper,
  Grid,
  TableSortLabel,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { createArrayWithNumbers } from "../../utils/Utils";
import { Loading } from "../loading/Loading";
import Style from "./GenericTable.module.css";

interface ITableHeaderProps<T> {
  header: string;
  sortByField?: string;
  filter?: IFilterProps<T>;
}

interface IFilterProps<T> {
  filterValues: string[];
  isValid: (val: T, selectedFilter: string) => boolean;
}

export interface IGenericTableProps<T> {
  headers: ITableHeaderProps<T>[] | string[];
  data: T[];
  defaultSortByField?: string;
  dataRenderer: (
    dataRow: T,
    column: number,
    row: number
  ) => string | number | ReactNode;
  getWidth?: (column: number) => number | undefined;
  onRowClick?: (dataRow: T) => void;
  pagination?: boolean;
  maxHeight?: string;
  hover?: boolean;
  cursor?: "pointer";
  hoverIndex?: number;
  setHoverIndex?: (index?: number) => void;
  isLoading?: boolean;
  alignContent?: "left" | "center";
  filteredRecords?: number;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
}

interface ISortState {
  selectedFieldToSort: string;
  direction: "asc" | "desc";
}

function ShipmentListTable<T>(props: IGenericTableProps<T>) {
  const {
    headers,
    dataRenderer,
    onRowClick = (_: T) => {},
    pagination = false,
    maxHeight = "100%",
    getWidth = (column: number) => {
      if (column === 0 || column === headers.length - 1) {
        return 30;
      }
      return 110;
    },
    hover = true,
    cursor,
    setHoverIndex,
    isLoading = false,
    data,
    defaultSortByField,
    alignContent = "left",
    filteredRecords,
    onPageChange,
    onRowsPerPageChange,
    currentPage,
    pageSize,
  } = props;

  const [state, setState] = useState<T[]>(data);
  const [selectedFilters, setSelectedFilters] = useState<Map<number, string>>(
    new Map()
  );

  let normalizedHeaders = useMemo(() => {
    return headers.map((value: string | ITableHeaderProps<T>) =>
      typeof value === "string" ? { header: value } : value
    );
  }, [headers]);

  const [sortState, setSortState] = useState<ISortState>({
    selectedFieldToSort: "",
    direction: "asc",
  });

  const addFilter = (key: number, filterValue: string) => {
    const newState = new Map(selectedFilters);
    newState.set(key, filterValue);
    setSelectedFilters(newState);
  };

  function getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  }

  const sortByField = useCallback(
    (arr: T[], key: string, ascending: boolean): T[] => {
      const newData = [...arr];
      newData.sort((a: any, b: any) => {
        const nestedValueA = getNestedValue(a, key);
        const nestedValueB = getNestedValue(b, key);

        if (nestedValueA === undefined && nestedValueB === undefined) return 0;
        if (nestedValueA === undefined || nestedValueB === undefined)
          return ascending
            ? nestedValueA === undefined
              ? 1
              : -1
            : nestedValueB === undefined
            ? -1
            : 1;

        return ascending
          ? nestedValueA > nestedValueB
            ? 1
            : nestedValueA < nestedValueB
            ? -1
            : 0
          : nestedValueA < nestedValueB
          ? 1
          : nestedValueA > nestedValueB
          ? -1
          : 0;
      });
      return newData;
    },
    []
  );

  const filterData = useCallback(
    (tableHeaders: ITableHeaderProps<T>[], dataList: T[]): T[] => {
      const setList = tableHeaders.map((header, index) => {
        if (!header.filter) return new Set(dataList);
        const isValid = header.filter.isValid;
        const selected = selectedFilters.get(index);
        return new Set(
          dataList.filter(
            (e) =>
              selected === "All" ||
              selected === undefined ||
              (isValid && isValid(e, selected))
          )
        );
      });

      const commonObjects =
        setList.length > 0
          ? setList.reduce(
              (acc, currentSet) =>
                new Set(Array.from(acc).filter((obj) => currentSet.has(obj)))
            )
          : new Set<T>();

      const filteredData = Array.from(commonObjects);
      return filteredData;
    },
    [selectedFilters]
  );

  useEffect(() => {
    let newData: T[] = [];
    if (data && data.length > 0) {
      newData = filterData(normalizedHeaders, [...data]);
      if (defaultSortByField) {
        setSortState({
          selectedFieldToSort: defaultSortByField,
          direction: "asc",
        });
        newData = sortByField(newData, defaultSortByField, true);
      }
    }
    setState(newData);
    if (!pagination) setRowsPerPage(newData.length);
  }, [
    data,
    selectedFilters,
    sortByField,
    defaultSortByField,
    filterData,
    pagination,
    normalizedHeaders,
  ]);

  const sort = useCallback(
    (key: string) => {
      const ascending =
        sortState.selectedFieldToSort !== key || sortState.direction === "desc";
      const newSortState: ISortState = {
        selectedFieldToSort: key,
        direction: ascending ? "asc" : "desc",
      };
      setSortState(newSortState);
      setState(sortByField([...state], key, ascending));
    },
    [sortState, state, sortByField]
  );

  const numberOfRows = state.length;

  const GenericTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
      color: "#6A7085",
      fontSize: "16px",
      fontWeight: "600 !important",
      textAlign: "center !important",
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: "14px",
      fontWeight: "400 !important",
      color: "#06152B",
      borderBottom: "none !important",
      textAlign: "center",
    },
    [`&:first-of-type`]: {
      textAlign: "center",
    },
  }));

  const GenericTableRow = styled(TableRow)(() => ({
    [`&.${tableRowClasses.root}`]: {
      cursor: cursor,
      borderBottom: "none !important",
    },
  }));

  const [page, setPage] = useState((currentPage ?? 1) - 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    pagination ? pageSize ?? 20 : numberOfRows
  );

  useEffect(() => {
    if (currentPage !== undefined) {
      setPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newVal = parseInt(event.target.value);
    setRowsPerPage(newVal);
    setPage(0);
    onRowsPerPageChange?.(newVal);
  };
  const shipmentIdColumnIndex = normalizedHeaders.findIndex(
    (header) => header.header === "Shipment ID"
  );

  return (
    <TableContainer component={Paper} sx={{ maxHeight }}>
      <Table size="small" sx={{ maxWidth: "100%" }}>
        <TableHead>
          <GenericTableRow>
            {normalizedHeaders.map((header, index) => (
              <GenericTableCell
                key={index}
                align={alignContent}
                sx={{ verticalAlign: "top", width: getWidth(index) }}
                className={Style.tableHeader_style}
              >
                <Grid
                  flexDirection="column"
                  textAlign="center"
                  style={{ width: getWidth(index) }}
                >
                  <Grid>
                    {header.sortByField ? (
                      <TableSortLabel
                        active={
                          sortState.selectedFieldToSort === header.sortByField
                        }
                        direction={sortState.direction}
                        onClick={() => sort(header.sortByField!)}
                      >
                        {header.header}
                      </TableSortLabel>
                    ) : (
                      header.header
                    )}
                  </Grid>
                  {header.filter && (
                    <FormControl sx={{ m: 1 }} size="small">
                      <Select
                        defaultValue="All"
                        value={selectedFilters.get(index)}
                        onChange={(e) => addFilter(index, e.target.value)}
                        variant="standard"
                        sx={{ textAlign: "center" }}
                      >
                        <MenuItem value="All">All</MenuItem>
                        {header.filter.filterValues.map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Grid>
              </GenericTableCell>
            ))}
          </GenericTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <GenericTableRow>
              <GenericTableCell
                colSpan={normalizedHeaders.length}
                sx={{ textAlign: "center" }}
              >
                <Loading isLoading={true} />
              </GenericTableCell>
            </GenericTableRow>
          ) : numberOfRows === 0 ? (
            <GenericTableRow>
              {normalizedHeaders.map((_, index) => (
                <GenericTableCell key={index} width={getWidth(index)}>
                  -
                </GenericTableCell>
              ))}
            </GenericTableRow>
          ) : (
            createArrayWithNumbers(numberOfRows)
              .slice(0, rowsPerPage)
              .map((rowIndex) => (
                <GenericTableRow
                  key={rowIndex}
                  hover={hover}
                  onMouseOver={() => setHoverIndex?.(rowIndex)}
                  onMouseOut={() => setHoverIndex?.(undefined)}
                  className={Style.tableRow_style}
                  sx={{
                    backgroundColor: rowIndex % 2 === 0 ? "#f8f9fd" : "#ffffff",
                    height: "55px",
                    borderRadius: "5px",
                  }}
                  onClick={() => onRowClick(state[rowIndex])}
                >
                  {normalizedHeaders.map((_, columnIndex) => {
                    const value =
                      dataRenderer(state[rowIndex], columnIndex, rowIndex) ??
                      "";
                    return (
                      <GenericTableCell
                        key={`${rowIndex}_${columnIndex}`}
                        width={getWidth(columnIndex)}
                        align={alignContent}
                        sx={
                          columnIndex === shipmentIdColumnIndex
                            ? {
                                fontWeight: "400 !important",
                                fontSize: "14px !important",
                                "& .MuiTypography-root": {
                                  fontWeight: "400 !important",
                                  fontSize: "14px !important",
                                },
                              }
                            : undefined
                        }
                      >
                        {typeof value === "number" ? value.toFixed(2) : value}
                      </GenericTableCell>
                    );
                  })}
                </GenericTableRow>
              ))
          )}
        </TableBody>
      </Table>
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[20, 50, 100, 150, 500]}
          component="div"
          count={filteredRecords ?? numberOfRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Shipments per page"
          labelDisplayedRows={({ page, count }) => {
            const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
            return `Page ${page + 1} of ${totalPages}`;
          }}
        />
      )}
    </TableContainer>
  );
}

export default ShipmentListTable;

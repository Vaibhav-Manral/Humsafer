import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  OutlinedInput,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  createShipmentShareLink,
  changeShipmentPriority,
} from "../../api/ShipmentsListApi";
import Toast, { IToastBasicProps } from "../../components/Toast/Toast";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { HumsaferError } from "../../models/HumsaferError";
import {
  IShipment,
  IDateRange,
  IFilterStatus,
  AppHealth,
  ShipmentTrackingStatus,
  ShipmentStatus,
  ShipmentPriority,
  IFilterShipmentResponse,
  IQueryHelperResponse,
  ICountObject,
  ISearchType,
  Plant,
} from "../../models/ShipmentsView";
import styles from "./ShipmentsList.module.css";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "../../assets/setting.svg";
import { Loading } from "../../components/loading/Loading";
import SyncIcon from '@mui/icons-material/Sync';
import {
  useMediaQuery,
  Theme,
  Select,
  InputLabel,
  FormControl,
  Chip,
} from "@mui/material";
import { formatDateForBackend, formatTimestamp } from "../../utils/DateUtils";
// import ReportIcon from "@mui/icons-material/Report";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ModeOfTravelIcon from "@mui/icons-material/ModeOfTravel";
import BeenhereIcon from "@mui/icons-material/Beenhere";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ShipmentListTable from "../../components/genericTable/ShipmentListTable";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelSharpIcon from "@mui/icons-material/CancelSharp";
import ProgressBar from "../../components/progressBar/ProgressBar";
import ActionMenu from "./ShipmentsActionMenu";
import CompanyInfoWithSwitcher from "../../components/companyInfoWithSwitcher/CompanyInfoWithSwitcher";
import { isAllowedToSwitchCompanies } from "../../utils/CapabitilityUtils";
import { CompanyDataContext } from "../../contexts/CompanyDataContext";
import { Auth } from "../../utils/Auth";
import AppBlockingIcon from "@mui/icons-material/AppBlocking";
import MobileOffIcon from "@mui/icons-material/MobileOff";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import { getDisplayDateRange } from "../../utils/DisplayUtils";
import CSVDownload from "../../components/utils/CSVDownload";
import { getShipmentsListDataForExport } from "../../utils/CSVExportUtils";
import moment from "moment";
import HumsaferDialog from "../../components/humsaferDialog/HumsaferDialog";
import {usePostFilterShipments, useGetQueryHelper, useGetAllCountV2} from "../../hooks/shipmentListProvider";

const initialSearchObject = {
  shipmentId: null,
  vehicleNumber: null,
  driverName: null,
  driverMobileNumber: null,
};

const initiaFilterObject = {
  fromCity: null,
  toCity: null,
  transporter: null,
  loadPlantCode: null,
  consigneeZone: null,
  consignerZone: null,
};

const filterTypeOptions = {
  shipmentId: "Shipment Id",
  vehicleNumber: "Vehicle Number",
  driverName: "Driver Name",
  driverMobileNumber: "Driver Mobile Number (without +91)",
};

const normalizeDriverMobileNumber = (input: string): string => {
  const trimmedInput = (input ?? "").trim();

  if (/^\+91\d{10}$/.test(trimmedInput)) {
    return trimmedInput;
  }

  if (/^91\d{10}$/.test(trimmedInput)) {
    return `+${trimmedInput}`;
  }

  if (/^\d{10}$/.test(trimmedInput)) {
    return `+91${trimmedInput}`;
  }

  return trimmedInput;
};

const TATA_COMPANY_IDS = ["K3R8gs01kggEcS0gvXT8", "yGD2kAp8lX5My9MCtE4u"];
const NESTLE_COMPANY_IDS = ["fYwQw2jZTudAwKsszs0C", "0ZjjjFANruz9fHLEKOFA"];

const ShipmentList: React.FC = React.memo(() => {
  const [shipments, setShipments] = useState<IShipment[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [dateRange, setDateRange] = useState<IDateRange>(
    () =>
      (window.localStorage.getItem("dateRange") as IDateRange) ||
      IDateRange.LAST_WEEK
  );
  const [filterStatus, setFilterStatus] = useState<IFilterStatus>(
    () =>
      (window.localStorage.getItem("filterStatus") as IFilterStatus) ||
      IFilterStatus.ALL
  );
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );
  const [showToast, setShowToast] = useState<IToastBasicProps>({
    open: false,
    message: "",
    type: "success",
  });
  // const [isFilterUIOpen] = useState(false); // filter dialog visibility
  const [activeFilter, setActiveFilter] = useState<Record<string, any> | null>(null); // currently applied filter, or null
  const [activeStatus, setActiveStatus] = useState(IFilterStatus.ALL); // selected status card
  const { primaryColor } = useContext(HumsaferThemeContext);
  const [shipmentStartCity, setShipmentStartCity] = useState<string[]>([]);
  const [shipmentDestinationCity, setShipmentDestinationCity] = useState<
    string[]
  >([]);
  const [shipmentTransporter, setShipmentTransporter] = useState<string[]>([]);
  const [allPlantDetails, setAllPlantDetails] = useState<Plant[]>([]);
  const [isPrioritized, setIsPrioritized] = useState<boolean>(false);
  const [isCopyShareLink, setIsCopyShareLink] = useState<boolean>(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [, setIsFilterApplied] = useState(false);

  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [lastVisibleShipmentId, setLastVisibleShipmentId] = useState<
    string 
  >("");
  const [firstVisibleShipmentId, setFirstVisibleShipmentId] = useState<
    string 
  >("");
  const [pageSize, setPageSize] = useState(10);

  const [totalRecords, setTotalRecords] = useState(0);
  const [filteredRecords, setFilteredRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [fromCity, setFromCity] = useState<string | null>(null);
  const [toCity, setToCity] = useState<string | null>(null);
  const [transporter, setTransporter] = useState<string | null>(null);
  const [loadPlantCode, setLoadPlantCode] = useState<string | null>(null);
  const [isTataCompany, setIsTataCompany] = useState(false);
  const [currentSearch, setCurrentSearch] = useState<string>(
    ISearchType.SEARCH
  );
  const [isNestleCompany, setIsNestleCompany] = useState(false);
  const [consigneeZones, setConsigneeZones] = useState<string[]>([]);
  const [consignerZones, setConsignerZones] = useState<string[]>([]);
  const [consigneeZone, setConsigneeZone] = useState<string | null>(null);
  const [consignerZone, setConsignerZone] = useState<string | null>(null);
   // const [shipmentsStatusWiseCount,setShipmentsStatusWiseCount]=useState<ICountObject| null>(null)

  // --- New state for improved filtering/card logic ---
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isSearchFilter, setIsSearchFilter] = useState(false);
  const [isFilter, setIsFilter] = useState(false);

  // --- State for card counts (separate from paginated table data) ---
  const [cardCounts, setCardCounts] = useState({
    totalCount: 0,
    inTransitCount: 0,
    completeCount: 0,
    untrackedCount: 0,
    priorityCount: 0,
    appStatusUnhealthyCount: 0,
    awaitingSync: 0
  });

  const previousCompanyIdRef = useRef<string | null>(null);
  const previousCountParamsRef = useRef<string>("");

  // Helper function to extract only count-relevant parameters (exclude pagination params)
  const getCountParams = useCallback((filterObj: any) => {
    const { pageSize, backward, lastVisibleShipmentId, firstVisibleShipmentId, ...countParams } = filterObj;
    return countParams;
  }, []);

  // Helper function to update count params only if they actually changed (deep comparison)
  const updateCountParamsIfChanged = useCallback((newParams: any) => {
    const newParamsString = JSON.stringify(newParams);
    if (previousCountParamsRef.current !== newParamsString) {
      previousCountParamsRef.current = newParamsString;
      setShipmentCountparams(newParams);
    }
  }, []);

  const resetAllFilters = useCallback(() => {
    setFilterType("");
    setFilterValue("");
    setFromCity(null);
    setToCity(null);
    setTransporter(null);
    setLoadPlantCode(null);
    setConsigneeZone(null);
    setConsignerZone(null);
    setActiveFilter(null);
    setIsFilterActive(false);
    setIsSearchFilter(false);
    setIsFilter(false);
    setFilterStatus(IFilterStatus.ALL);
    setActiveStatus(IFilterStatus.ALL);
    setCurrentSearch(ISearchType.SEARCH);
    setLastVisibleShipmentId("");
    setFirstVisibleShipmentId("");
    setCurrentPage(1);
    setIsFilterApplied(false);
  }, []);

 

  const handleFilterTypeChange = (event) => {
    const newFilterType = event.target.value;

    setFilterType(newFilterType);
    setFilterValue("");
  };

  const handleFilterValueChange = (event) => {
    const value = event.target.value;

    setFilterValue(value);
  };

  const { selectedCompany } = useContext(CompanyDataContext);

  const allowCompanySwitcher = isAllowedToSwitchCompanies();

  const getDateAndCompanyId = useCallback(() => {
    let companyId = Auth.getInstance().getCompanySettings()?.id;
    if (selectedCompany) {
      companyId = selectedCompany.id;
    }

    let date = formatDateForBackend(new Date());
    switch (dateRange) {
      case IDateRange.TODAY:
        date = formatDateForBackend(new Date());
        break;
      case IDateRange.YESTERDAY:
        date = formatDateForBackend(
          new Date(new Date().setDate(new Date().getDate() - 1))
        );
        break;
      case IDateRange.LAST_WEEK:
        date = formatDateForBackend(
          new Date(new Date().setDate(new Date().getDate() - 7))
        );
        break;
      case IDateRange.LAST_MONTH:
        date = formatDateForBackend(
          new Date(new Date().setMonth(new Date().getMonth() - 1))
        );
        break;
    }
    return { companyId, date };
  }, [dateRange, selectedCompany]);

  useEffect(() => {
    let companyId = Auth.getInstance().getCompanySettings()?.id;
    if (selectedCompany) {
      companyId = selectedCompany.id;
    }
    if (companyId) {
      setIsTataCompany(TATA_COMPANY_IDS.includes(companyId));
      setIsNestleCompany(NESTLE_COMPANY_IDS.includes(companyId));
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (!selectedCompany) {
      previousCompanyIdRef.current = null;
      return;
    }

    const newCompanyId = selectedCompany.id;

    if (previousCompanyIdRef.current && previousCompanyIdRef.current !== newCompanyId) {
      resetAllFilters();
      // Don't call fetchFilteredShipment here - let the other useEffect (line 956) handle it
      // This prevents duplicate API calls when switching companies
    }

    previousCompanyIdRef.current = newCompanyId;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany, resetAllFilters]);

  // React Query hooks
  const postFilterShipmentsMutation = usePostFilterShipments();

  const { companyId: currentCompanyId, date: currentDate } = getDateAndCompanyId();

  const [shipmentCountparams, setShipmentCountparams]= useState({shipmentsStartingFrom: currentDate})

  const queryHelperQuery = useGetQueryHelper(currentCompanyId || '', !!currentCompanyId);

  const getAllCountQuery = useGetAllCountV2({ companyId: currentCompanyId || '',  data: {...shipmentCountparams}, enabled: !!currentCompanyId });


     // Update card counts from React Query data

  const updateCardCountsFromQuery = useCallback(() => {
    if (getAllCountQuery.data && !(getAllCountQuery.data instanceof HumsaferError)) {
      const stats = (getAllCountQuery.data as unknown )as ICountObject;
      setCardCounts({
        totalCount: stats.totalShipmentsCount || 0,
        inTransitCount: stats.inTransitShipmentsCount || 0,
        completeCount: stats.completedShipmentsCount || 0,
        untrackedCount: stats.unTrackedShipmentsCount || 0,
        priorityCount: stats.prioritizedShipmentsCount || 0,
        appStatusUnhealthyCount: stats.appSetUpIncompleteShipmentsCount || 0,
        awaitingSync: stats.awaitingSyncShipmentsCount || 0
      });

    } else {
      setCardCounts({
        totalCount: 0,
        inTransitCount: 0,
        completeCount: 0,
        untrackedCount: 0,
        priorityCount: 0,
        appStatusUnhealthyCount: 0,
        awaitingSync: 0
      });
    }
  }, [getAllCountQuery.data]);

  // Update filter options from React Query data

  const updateFilterOptionsFromQuery = useCallback(() => {
    if (queryHelperQuery.data && !(queryHelperQuery.data instanceof HumsaferError) && 
        (queryHelperQuery.data as IQueryHelperResponse).queryHelperList?.length) {
      const queryData = (queryHelperQuery.data as IQueryHelperResponse).queryHelperList[0];

      setShipmentStartCity(
        Array.from(new Set(queryData.from || [])).sort((a, b) => a.localeCompare(b))
      );

      setShipmentDestinationCity(
        Array.from(new Set(queryData.to || [])).sort((a, b) => a.localeCompare(b))
      );

      setShipmentTransporter(
        Array.from(new Set(queryData["Transporter_Names"] || [])).sort((a, b) => a.localeCompare(b))
      );

      setAllPlantDetails(
        Array.from(new Set(queryData.plantDetails || [])).sort((a, b) => 
          a.loadPlantName.localeCompare(b.loadPlantName)
        )
      );

      setConsigneeZones(
        Array.from(new Set(queryData.consigneeZone || [])).sort((a, b) => a.localeCompare(b))
      );

      setConsignerZones(
        Array.from(new Set(queryData.consignerZone || [])).sort((a, b) => a.localeCompare(b))
      );
    }
  }, [queryHelperQuery.data]);


  // Effect to update card counts when query data changes
  useEffect(() => {
    updateCardCountsFromQuery();
  }, [updateCardCountsFromQuery]);

  // Effect to update filter options when query data changes
  useEffect(() => {
    updateFilterOptionsFromQuery();
  }, [updateFilterOptionsFromQuery]);

  // Fetch shipments based on filter and status with robust error handling
  const fetchShipments = useCallback(
    async (filter, status, retryCount = 0) => {
      const { companyId, date } = getDateAndCompanyId();
      if (!companyId) {
        console.warn('fetchShipments: No companyId available');
        return [];
      }
      
      let filterObj = { ...filter };
      if (status && status !== IFilterStatus.ALL) {
        filterObj.status = status;
      }
      filterObj.shipmentsStartingFrom = date;

      // Update count params without pagination parameters (only if changed)
      updateCountParamsIfChanged(getCountParams(filterObj));
      
      try {
       const shipmentsResponse = await postFilterShipmentsMutation.mutateAsync({
          companyId,
          data: filterObj,
        });
        
        if (shipmentsResponse instanceof HumsaferError) {
          console.error('fetchShipments: API returned error:', shipmentsResponse.message);
          
          if (retryCount < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return fetchShipments(filter, status, retryCount + 1);
          }
          
          setShowToast({
            open: true,
            message: `Failed to load shipments: ${shipmentsResponse.message}`,
            type: "error",
          });
          return [];
        }

     setCurrentPage(shipmentsResponse?.currentPage);
    setTotalPages(shipmentsResponse?.totalPages);
    setFilteredRecords(shipmentsResponse?.filteredRecords);
        
        return shipmentsResponse?.shipments || [];
      } catch (error) {
        console.error('fetchShipments: Network/unexpected error:', error);
        
        if (retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return fetchShipments(filter, status, retryCount + 1);
        }
        
        setShowToast({
          open: true,
          message: 'Network error while loading shipments. Please try again.',
          type: "error",
        });
        return [];
      }
    },
    [getDateAndCompanyId, postFilterShipmentsMutation, getCountParams, updateCountParamsIfChanged]
  );

  // --- UI event handlers ---
  // Open filter dialog (does NOT change data)
  // const handleOpenFilter = () => setIsFilter(true);
  // Close filter dialog (reset to unfiltered data)
  const handleCloseFilter = async () => {
    setIsFilter(false);
    setIsFilterActive(false);
    setActiveFilter(null);

    // Reset to default list and refresh card counts
    await fetchFilteredShipment(initialSearchObject);
    // await fetchQueryData();

    setActiveStatus(IFilterStatus.ALL);
    setFilterStatus(IFilterStatus.ALL);
    setCurrentSearch(ISearchType.SEARCH);
  };

  // Apply filter (on Search in filter dialog)
  const handleApplyFilter = async (filterObj, shouldCloseFilter = true) => {
    setActiveFilter(filterObj);
    setActiveStatus(IFilterStatus.ALL); // reset status card
    if (shouldCloseFilter) {
      setIsFilter(false);
    }
    setIsFilterActive(true);
    
    // Use the appropriate API based on filter type
    const hasLocationFilter = ((filterObj as any).fromCity && (filterObj as any).fromCity !== null) || 
      ((filterObj as any).toCity && (filterObj as any).toCity !== null) || 
      ((filterObj as any).transporter && (filterObj as any).transporter !== null) || 
      ((filterObj as any).loadPlantCode && Array.isArray((filterObj as any).loadPlantCode) && (filterObj as any).loadPlantCode.length > 0) || 
      ((filterObj as any).consigneeZone && (filterObj as any).consigneeZone !== null) || 
      ((filterObj as any).consignerZone && (filterObj as any).consignerZone !== null);
    
    let filteredShipments;
    if (hasLocationFilter) {
      // Use fetchFilteredShipment for location-based filters
      filteredShipments = await fetchFilteredShipment(filterObj);
    } else {
      // Use fetchShipments for other filters
      setIsFetching(true);
      try {
        filteredShipments = await fetchShipments(filterObj, IFilterStatus.ALL);
      } finally {
        setIsFetching(false);
      }
    }

    // setCurrentPage(filteredShipments?.currentPage);
    // setTotalPages(filteredShipments?.totalPages);
    // setFilteredRecords(filteredShipments?.filteredRecords);
    
    setShipments(filteredShipments || []);
  };

  // Status card click (filter current data by status)
  const handleStatusCardClick = async (status) => {
    setCurrentPage(1)
    setActiveStatus(status);
    setIsFetching(true);
    
    try {
      const { companyId, date } = getDateAndCompanyId();
      
      if (!companyId) {
        console.warn('handleStatusCardClick: No companyId available');
        setIsFetching(false);
        return;
      }
      let filterObj;

      if (isFilterActive && activeFilter) {
        // If filters are active, use existing filter with status
        filterObj = {
          ...activeFilter,
          status,
          pageSize: String(pageSize),
          shipmentsStartingFrom: date ?? "",
          lastVisibleShipmentId: "",
          firstVisibleShipmentId: "",
          backward: false,
        };

      } else {

        // If no filters, use just status

        filterObj = {

          status,

          pageSize: String(pageSize),

          shipmentsStartingFrom: date ?? "",

        };

      }

      const statusShipments = await postFilterShipmentsMutation.mutateAsync({

        companyId,

        data: filterObj,

      });

      if (statusShipments instanceof HumsaferError) {
        setShowToast({
          open: true,
          message: statusShipments.message,
          type: "error",
        });
        return;
      }
      setCurrentPage(statusShipments?.currentPage);
      setTotalPages(statusShipments?.totalPages);
      setFilteredRecords(statusShipments?.filteredRecords);
      
      const shipmentsList = statusShipments?.shipments || [];
      setShipments(shipmentsList);
      
      // Don't update card counts during filtering - keep original API counts
    } catch (error) {
      console.error("Error fetching status-wise shipments:", error);
      setShowToast({
        open: true,
        message: "Failed to fetch shipments by status",
        type: "error",
      });
    } finally {
      setIsFetching(false);
    }
  };



  // --- Card rendering logic (use API total counts for the time range) ---
  const allShipmentsCount = cardCounts.totalCount;
  const inTransitCount = cardCounts.inTransitCount;
  const completeCount = cardCounts.completeCount;
  const untrackedShipmentCount = cardCounts.untrackedCount;
  const priorityCount = cardCounts.priorityCount;
  const awaitingSync = cardCounts.awaitingSync;
  // const appStatusUnhealthyCount = cardCounts.appStatusUnhealthyCount;

  // --- UI rendering ---
  // Filter button opens dialog, dialog uses handleApplyFilter and handleResetFilter
  // Cards use handleStatusCardClick
  // Table uses shipments

  const onSearchFilter = async () => {
    if (!filterType) {
      setShowToast({
        open: true,
        message: `Please select one filter type`,
        type: "error",
      });
      return;
    }

    if (filterType && !filterValue) {
      setShowToast({
        open: true,
        message: `Please enter ${filterTypeOptions[filterType]}`,
        type: "error",
      });
      return;
    }

    const normalizedValue =
      filterType === "driverMobileNumber"
        ? normalizeDriverMobileNumber(filterValue)
        : filterValue;

    const newFilterObject = {
      ...initialSearchObject,
      [filterType]: normalizedValue,
      pageSize: filterType === "driverMobileNumber" ? 10 : 10,
    };

    setCurrentSearch(ISearchType.SEARCH);
    setFilterStatus(IFilterStatus.ALL);
    await handleApplyFilter(newFilterObject, false); // Don't close filter box
  };

  const onSubmitFilter = async () => {
    if (
      !fromCity &&
      !toCity &&
      !transporter &&
      !loadPlantCode &&
      !consigneeZone &&
      !consignerZone
    ) {
      setShowToast({
        open: true,
        message: `Please select at least one filter`,
        type: "error",
      });
      return;
    }

    const newFilterObject = {
      ...initiaFilterObject,
      fromCity,
      toCity,
      transporter,
      loadPlantCode: loadPlantCode ? loadPlantCode : null,
      consigneeZone,
      consignerZone,
    };

    setCurrentSearch(ISearchType.FILTER);
    setFilterStatus(IFilterStatus.ALL);
    await handleApplyFilter(newFilterObject, false); // Don't close filter box
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    const pagestatus = currentPage>newPage?true:false;
   

    if (currentSearch === ISearchType.FILTER) {
      const filterObj = {
        ...initiaFilterObject,
        fromCity,
        toCity,
        transporter,
        loadPlantCode: loadPlantCode ? loadPlantCode : null,
        consigneeZone,
        consignerZone,
      };
      fetchFilteredShipment(filterObj);
      
      
    } else if (currentSearch === ISearchType.STATUS) {
      handleStatusCardClick(activeStatus);
     
    } else {
      handleApplyFilter({...initialSearchObject, lastVisibleShipmentId: pagestatus? "" : shipments[shipments.length - 1].id,
         firstVisibleShipmentId:pagestatus? shipments[0].id : "", backward: pagestatus});
    }

     setCurrentPage(newPage);
  };

  const handleRowsChange = (rowsPerPage: number) => {
    setPageSize(rowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const applyFilter = async (
    data: object,
    isPageChange: boolean = false,
    isBackward: boolean = false
  ) => {
    const { companyId, date } = getDateAndCompanyId();

    if (companyId === undefined) {
      return;
    }

    setIsFetching(true);
    let filterObj = {
      ...data,
      shipmentsStartingFrom: date ?? "",
      status: filterStatus,
      pageSize: pageSize,
      lastVisibleShipmentId: isPageChange ? lastVisibleShipmentId : "",
      firstVisibleShipmentId: isBackward ? firstVisibleShipmentId : "",
      isBackward:isBackward,
    };

    // Use getShipments consistently to avoid data sync issues and multiple points errors
    let shipmentsResponse;
    try {
      shipmentsResponse = await postFilterShipmentsMutation.mutateAsync({

        companyId,

        data: filterObj,

      });
    } catch (error) {
      console.error('getShipments failed in applyFilter:', error);
      setIsFetching(false);
      return;
    }

    if (shipmentsResponse as IFilterShipmentResponse) {
      setTotalRecords(
        (shipmentsResponse as IFilterShipmentResponse).totalRecords || 0
      );

      setFilteredRecords(
        (shipmentsResponse as IFilterShipmentResponse).filteredRecords || 0
      );

      setFirstVisibleShipmentId(
        (shipmentsResponse as IFilterShipmentResponse).firstVisibleShipmentId ??
          ""
      );
      setLastVisibleShipmentId(
        (shipmentsResponse as IFilterShipmentResponse).lastVisibleShipmentId ??
          ""
      );
      setCurrentPage(
        (shipmentsResponse as IFilterShipmentResponse).currentPage || 1
      );
      setTotalPages(
        (shipmentsResponse as IFilterShipmentResponse).totalPages || 1
      );
      // totalCount is now managed via cardCounts state
    }

    const filteredShipments = (shipmentsResponse as IFilterShipmentResponse)
      ?.shipments;

    setIsFetching(false);
    if (filteredShipments instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: filteredShipments.message,
        type: "error",
      });
      return;
    }

    const shipmentsList = filteredShipments || [];
    setShipments(shipmentsList);
    
    // Recalculate card counts for status filter results
    // updateCardCountsFromShipments(shipmentsResponse);
  };

  const fetchFilteredShipment = async (
    data: object,
    isPageChange: boolean = false,
    isBackward: boolean = false
  ) => {
    const { companyId, date } = getDateAndCompanyId();

    if (companyId === undefined) {
      return [];
    }

    setIsFetching(true);
    let filterObj = {
      ...data,
     shipmentsStartingFrom: date ?? "",

      pageSize: filterType === "driverName" ? totalRecords : pageSize,

      lastVisibleShipmentId: isPageChange ? lastVisibleShipmentId : "",

      firstVisibleShipmentId: isBackward ? firstVisibleShipmentId : "",

      backward: isBackward,

    };

   // Update count params without pagination parameters (only if changed)
   updateCountParamsIfChanged(getCountParams(filterObj));

    // Use React Query mutation for all shipment filtering

    let shipmentsResponse;

    try {

      shipmentsResponse = await postFilterShipmentsMutation.mutateAsync({

        companyId,

        data: filterObj,

      });

    } catch (error) {

      console.error('postFilterShipmentsMutation failed in fetchFilteredShipment:', error);

      setIsFetching(false);

      return [];
    }

    if (shipmentsResponse as IFilterShipmentResponse) {
      setTotalRecords(
        (shipmentsResponse as IFilterShipmentResponse).totalRecords || 0
      );

      setFilteredRecords(
        (shipmentsResponse as IFilterShipmentResponse).filteredRecords || 0
      );

      setFirstVisibleShipmentId(
        (shipmentsResponse as IFilterShipmentResponse).firstVisibleShipmentId ??
          ""
      );
      setLastVisibleShipmentId(
        (shipmentsResponse as IFilterShipmentResponse).lastVisibleShipmentId ??
          ""
      );
      setCurrentPage(
        (shipmentsResponse as IFilterShipmentResponse).currentPage || 1
      );
      setTotalPages(
        (shipmentsResponse as IFilterShipmentResponse).totalPages || 1
      );
      // Only update totalCount if this is a filtered fetch (not initialSearchObject)
      const isUnfiltered =
        JSON.stringify(data) === JSON.stringify(initialSearchObject);
      if (!isUnfiltered) {
        // setTotalCount(
        //   (shipmentsResponse as IFilterShipmentResponse).totalRecords || 0
        // );
      }
    }

    const shipmentOrError = (shipmentsResponse as IFilterShipmentResponse)
      ?.shipments;

    setIsFetching(false);
    if (shipmentOrError instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: shipmentOrError.message,
        type: "error",
      });
      return;
    }

    const shipmentsList = shipmentOrError || [];
    setShipments(shipmentsList);
    
    // Check if this is a filtered fetch (not initialSearchObject)
    const isUnfiltered = JSON.stringify(data)  === JSON.stringify(initialSearchObject);


    
    if (!isUnfiltered) {
      // Recalculate card counts for filtered searches
      // updateCardCountsFromShipments(shipmentsResponse);
    } 
    
    return shipmentsList;
  };

  const fetchShipment = async (
    data: object,
    isPageChange: boolean = false,
    isBackward: boolean = false,
    isFilter: boolean = false // new param
  ) => {
    const { companyId, date } = getDateAndCompanyId();

    if (companyId === undefined) {
      return;
    }

    setIsFetching(true);
    let filterObj = {
      ...data,
         shipmentsStartingFrom: date ?? "",
      pageSize,
      lastVisibleShipmentId: isPageChange ? lastVisibleShipmentId : "",
      firstVisibleShipmentId: isBackward ? firstVisibleShipmentId : "",
      backward: isBackward,
    };

   // Update count params without pagination parameters (only if changed)
   updateCountParamsIfChanged(getCountParams(filterObj));
    try {
      // Use React Query mutation for all shipment fetching
      const shipmentsResponse = await postFilterShipmentsMutation.mutateAsync({
        companyId,
        data: filterObj,
      });

      if (shipmentsResponse instanceof HumsaferError) {
        setShowToast({
          open: true,
          message: shipmentsResponse.message,
          type: "error",
        });
        return;
      }

      updatePaginationState(shipmentsResponse);
      const shipmentsList = shipmentsResponse.shipments || [];
      setShipments(shipmentsList);
      
      // Check if this is a filtered fetch (not initialSearchObject)
      const isUnfiltered = JSON.stringify(data) === JSON.stringify(initialSearchObject);
      
      if (!isUnfiltered || isFilter) {
        // Recalculate card counts for filtered fetches
        // updateCardCountsFromShipments(shipmentsResponse);
      } 
    } catch (error) {
      console.error("Error fetching shipments:", error);
      setShowToast({
        open: true,
        message: "Failed to fetch shipments",
        type: "error",
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      
      try {
        // Always refresh card counts when date range or company changes
        // await fetchQueryData();
        
        // If a status card is selected (not ALL), fetch filtered data for that status
        if (filterStatus !== IFilterStatus.ALL) {
          setCurrentSearch(ISearchType.STATUS);
          await applyFilter(activeFilter || {});
        } else if (currentSearch === ISearchType.FILTER) {
          // Only call fetchShipment if we have actual location filters
          const hasActualLocationFilters = fromCity || toCity || transporter ||
            loadPlantCode || consigneeZone || consignerZone;

          if (hasActualLocationFilters) {
            await fetchShipment({
              ...initiaFilterObject,
              fromCity,
              toCity,
              transporter,
              loadPlantCode: loadPlantCode ? [loadPlantCode] : null,
              consigneeZone,
              consignerZone,
            }, false, false, true);
          } else {
            // Fallback to safe API for company/date switching without filters
            await fetchFilteredShipment(activeFilter || initialSearchObject);
          }
        } else if (currentSearch === ISearchType.SEARCH && activeFilter) {
          // If there's an active search filter (shipmentId, vehicleNumber, etc.), use it
          await fetchFilteredShipment(activeFilter);
        } else {
          await fetchFilteredShipment(initialSearchObject);
        }
      } catch (error) {
        console.error('Date/Company/PageSize change: Error during refresh:', error);
        setShowToast({
          open: true,
          message: 'Failed to refresh data after changes. Please try again.',
          type: "error",
        });
      } finally {
        setIsFetching(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, selectedCompany, pageSize]);

  useEffect(() => {
    if (
      currentSearch === ISearchType.SEARCH ||
      currentSearch === ISearchType.FILTER
    )
      return;
    applyFilter({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);


  const handleToastClose = () => {
    setShowToast({
      open: false,
      message: showToast.message,
      type: showToast.type,
    });
  };

  const handleCopyShareLink = async (shipment: IShipment) => {
    setIsCopyShareLink(true);
    const shipmentOrError = await createShipmentShareLink(
      shipment.companyId,
      shipment.id
    );
    setIsCopyShareLink(false);
    if (shipmentOrError instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: shipmentOrError.message,
        type: "error",
      });
      return;
    }
    await navigator.clipboard.writeText(shipmentOrError.shareLink);
    setShowToast({
      open: true,
      message: "Shipment link copied",
      type: "success",
    });
  };

  const handlePrioritised = async (shipment: IShipment) => {
    setIsPrioritized(true);
    const setPriority =
      shipment.priority === ShipmentPriority.DEFAULT
        ? ShipmentPriority.PRIORITIZED
        : ShipmentPriority.DEFAULT;
    const shipmentOrError = await changeShipmentPriority(
      shipment.companyId,
      shipment.id,
      setPriority
    );
    setIsPrioritized(false);
    if (shipmentOrError instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: shipmentOrError.message,
        type: "error",
      });
      return;
    }
    // Refresh the shipment list using the current filter/status
    if (currentSearch === ISearchType.FILTER) {
      await fetchShipment({
        ...initiaFilterObject,
        fromCity,
        toCity,
        transporter,
        loadPlantCode: loadPlantCode ? loadPlantCode : null,
        consigneeZone,
        consignerZone,
      }, false, false, true);
    } else if (currentSearch === ISearchType.STATUS) {
      await applyFilter({});
    } else if (currentSearch === ISearchType.SEARCH) {
      // Re-apply the last search filter
      const normalizedValue =
        filterType === "driverMobileNumber"
          ? normalizeDriverMobileNumber(filterValue)
          : filterValue;

      const newFilterObject = {
        ...initialSearchObject,
        [filterType]: normalizedValue,
        pageSize: filterType === "driverMobileNumber" ? totalRecords : 20,
      };
      await fetchFilteredShipment(newFilterObject);
    } else {
      // Default to all shipments
      await fetchFilteredShipment(initialSearchObject);
    }
    setShowToast({
      open: true,
      message: `Shipment priority ${setPriority} set successfully`,
      type: "success",
    });
  };

  const handelViewDetails = (data: IShipment) => {
    window.open(`/shipments/${data.id}`, "_blank");
  };

  const refreshShipment = async () => {
    setIsFetching(true);
    
    try {
      // Always refresh card counts first
      // await fetchQueryData();
      
      // Then refresh table data based on current state
      if (currentSearch === ISearchType.FILTER) {
        const hasActualLocationFilters = fromCity || toCity || transporter || 
          (loadPlantCode && loadPlantCode.length > 0) || consigneeZone || consignerZone;
        
        if (hasActualLocationFilters) {
          const filterObj = {
            ...initiaFilterObject,
            fromCity,
            toCity,
            transporter,
            loadPlantCode: loadPlantCode ? loadPlantCode : null,
            consigneeZone,
            consignerZone,
          };
          await fetchFilteredShipment(filterObj);
        } else {
          await fetchFilteredShipment(initialSearchObject);
        }
      } else if (currentSearch === ISearchType.SEARCH) {
        const normalizedValue =
          filterType === "driverMobileNumber"
            ? normalizeDriverMobileNumber(filterValue)
            : filterValue;

        const searchFilterObject = {
          ...initialSearchObject,
          [filterType]: normalizedValue,
        };
        await fetchFilteredShipment(searchFilterObject);
      } else if (filterStatus !== IFilterStatus.ALL) {
        await applyFilter({});
      } else {
        await fetchFilteredShipment(initialSearchObject);
      }
      
      setShowToast({
        open: true,
        message: 'Data refreshed successfully',
        type: "success",
      });
    } catch (error) {
      console.error('refreshShipment: Error during refresh:', error);
      setShowToast({
        open: true,
        message: 'Failed to refresh data. Please try again.',
        type: "error",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleDateRangeChange = (dateRange: IDateRange) => {
    if (dateRange !== IDateRange.LAST_MONTH) {
      setDateRange(dateRange);
      window.localStorage.setItem("dateRange", dateRange);
    } else {
      setShowSubscriptionDialog(true);
    }
  };

  const resetLocationFilters = async () => {
    setFromCity(null);
    setToCity(null);
    setLoadPlantCode(null);
    setConsignerZone(null);
    setConsigneeZone(null);
    setTransporter(null);
    setIsFilterApplied(false);
    setActiveFilter(null);
    await fetchFilteredShipment({ ...initiaFilterObject, loadPlantCode: null });
    // await fetchQueryData(); // Refresh status card counts to show totals for time range
  };

  useEffect(() => {
    // Reset pagination when data changes
    if (shipments.length === 0) {
      setCurrentPage(1);
      setTotalPages(1);
    }
  }, [shipments]);

  const updatePaginationState = (response: IFilterShipmentResponse) => {
    const totalRecords = response.totalRecords || 0;
    const calculatedTotalPages = Math.ceil(totalRecords / pageSize);

    setTotalRecords(totalRecords);
    setFilteredRecords(response.filteredRecords || 0);
    setFirstVisibleShipmentId(response.firstVisibleShipmentId ?? "");
    setLastVisibleShipmentId(response.lastVisibleShipmentId ?? "");
    setTotalPages(Math.max(1, calculatedTotalPages));

    // Ensure current page is valid
    if (currentPage > calculatedTotalPages) {
      setCurrentPage(Math.max(1, calculatedTotalPages));
    }
  };

  const handleSwitch =()=>{
    setFromCity(null)
    setToCity(null)
    setTransporter(null)
    setLoadPlantCode(null)
    setIsFilter(false);
    setIsFilterActive(false);
    setActiveFilter(null);
    setActiveStatus(IFilterStatus.ALL);
    setFilterStatus(IFilterStatus.ALL);
    setCurrentSearch(ISearchType.SEARCH);
    setFromCity(null);
    setToCity(null);
    setLoadPlantCode(null);
    setConsignerZone(null);
    setConsigneeZone(null);
    setTransporter(null);
    setIsFilterApplied(false);
    setActiveFilter(null);
  }

  return (
    <>
      <Toast
        message={showToast.message}
        open={showToast.open}
        onClose={handleToastClose}
        type={showToast.type}
      />
      {isFetching && (
        <div className={styles.shipment_details_loader}>
          <CircularProgress size={25} />
        </div>
      )}

      {!isFetching && shipments && (
        <>
          <HumsaferDialog
            title="Subscription Required"
            description={
              <p className={styles.shipment_subscription_message}>
                Access to this data is available exclusively to our paid
                subscribers. Upgrade your subscription to view the monthly data.
              </p>
            }
            buttonText={"Okay"}
            isOpen={showSubscriptionDialog}
            closeDialog={() => setShowSubscriptionDialog(false)}
          />
          {allowCompanySwitcher && (
            <CompanyInfoWithSwitcher onBeforeCompanySelect={handleSwitch} />
          )}
          <Grid container>
            <Box sx={{ flexGrow: 1 }} className={styles.shipment_top_bar}>
              <Grid
                container
                spacing={1}
                className={styles.shipment_top_bar_align}
              >
                <Grid item xs={6} md={4}>
                  <div className={styles.shipment_title_align}>
                    <span className={styles.shipment_top_bar_text}>
                      All Shipments
                    </span>
                  </div>
                </Grid>
                {isMobile && (
                  <Grid item xs={6} md={3}>
                    <div>
                      <Button
                        variant="text"
                        className={styles.shipment_top_bar_refresh}
                        onClick={refreshShipment}
                      >
                        <RefreshIcon />
                        Refresh
                      </Button>
                    </div>
                  </Grid>
                )}

                <Grid item xs={12} md={4}>
                  <div className={styles.shipment_buttons_align}>
                    <Button
                      className={
                        dateRange === IDateRange.TODAY
                          ? styles.shipment_top_bar_button_active
                          : styles.shipment_top_bar_button
                      }
                      onClick={() => {
                        handleDateRangeChange(IDateRange.TODAY);
                      }}
                      variant="text"
                    >
                      Today
                    </Button>
                    <Button
                      className={
                        dateRange === IDateRange.YESTERDAY
                          ? styles.shipment_top_bar_button_active
                          : styles.shipment_top_bar_button
                      }
                      onClick={() => {
                        handleDateRangeChange(IDateRange.YESTERDAY);
                      }}
                      variant="text"
                    >
                      Yesterday
                    </Button>
                    <Button
                      className={
                        dateRange === IDateRange.LAST_WEEK
                          ? styles.shipment_top_bar_button_active
                          : styles.shipment_top_bar_button
                      }
                      onClick={() => {
                        handleDateRangeChange(IDateRange.LAST_WEEK);
                      }}
                      variant="text"
                    >
                      Past 7 days
                    </Button>
                    {/* <Button className={dateRange === IDateRange.LAST_MONTH ? styles.shipment_top_bar_button_active : styles.shipment_top_bar_button} onClick={() => { handleDateRangeChange(IDateRange.LAST_MONTH) }} variant="text"> Past 1 month</Button> */}
                  </div>
                </Grid>
                {!isMobile && (
                  <Grid item xs={6} md={4}>
                    <div>
                      <Button
                        variant="text"
                        className={styles.shipment_top_bar_refresh}
                        onClick={refreshShipment}
                      >
                        <RefreshIcon />
                        Refresh
                      </Button>
                    </div>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          <Grid container>
            <Box sx={{ flexGrow: 1 }} className={styles.shipment_top_bar}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={12}>
                  <div className={styles.shipment_top_bar_search}>
                    <Button
                      variant="text"
                      className={styles.shipment_filter_box_button_ml}
                      onClick={() => [
                        setIsSearchFilter(!isSearchFilter),
                        setIsFilter(false),
                      ]}
                      sx={{ flexGrow: 1 }}
                      startIcon={<SearchIcon />}
                    >
                      {`Search for ${
                        isNestleCompany ? "FO Number" : "Shipment Id"
                      }, Vehicle number, Driver name, Driver Mobile Number`}
                    </Button>
                    <Grid item>
                      <IconButton>
                        <img
                          src={FilterAltIcon}
                          onClick={() => [
                            setIsFilter(!isFilter),
                            setIsSearchFilter(false),
                          ]}
                          alt="filterIcon"
                        />
                      </IconButton>
                    </Grid>
                  </div>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          {isSearchFilter && (
            <Grid container>
              <Box sx={{ flexGrow: 1 }}>
                <Box
                  sx={{ flexGrow: 1 }}
                  className={styles.shipment_filter_box}
                >
                  <Grid className={styles.search_filter_grid}>
                    <span className={styles.shipment_filter_text}>
                      Search Filter
                    </span>
                  </Grid>
                  <Box />
                  <Grid spacing={2} className={styles.main_search_container}>
                    <Grid className={styles.search_by_container}>
                      <Grid item xs={6} md={3}>
                        <span className={styles.shipment_filter_box_title}>
                          Search By
                        </span>
                      </Grid>
                      <TextField
                        value={filterType}
                        className=
                        {styles.search_by_input}
                        onChange={handleFilterTypeChange}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        size="small"
                        select
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        }}
                      >
                        <MenuItem value="shipmentId">
                          {isNestleCompany ? "FO Number" : "Shipment ID"}
                        </MenuItem>
                        <MenuItem value="vehicleNumber">
                          Vehicle Number
                        </MenuItem>
                        <MenuItem value="driverName">Driver Name</MenuItem>
                        <MenuItem value="driverMobileNumber">
                          Driver Mobile Number
                        </MenuItem>
                      </TextField>
                    </Grid>
                    <Grid className={styles.search_by_container}>
                      <Grid item xs={6} md={3}>
                        <span className={styles.shipment_filter_box_title}>
                          Search Value
                        </span>
                      </Grid>
                      <TextField
                        className={styles.search_by_input}
                        placeholder={
                          filterType
                            ? `Enter ${filterTypeOptions[filterType]}`
                            : "Select a search type first"
                        }
                        value={filterValue}
                        onChange={handleFilterValueChange}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        size="small"
                        disabled={!filterType}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        }}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      className={styles.search_button_container}
                    >
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={async () => {
                          setIsSearchFilter(!isSearchFilter);
                          await fetchFilteredShipment(initialSearchObject);
                        }}
                        className={styles.search_close_button_style}
                        disabled={isFetching}
                      >
                        <Loading isLoading={isFetching} text="Close" />
                      </Button>
                      <Button
                        type="button"
                        variant="contained"
                        className={styles.search__button_style}
                        disabled={!filterType || !filterValue || isFetching}
                        onClick={onSearchFilter}
                      >
                        <Loading isLoading={isFetching} text="Search" />
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          )}
          {isFilter && (
            <Grid container>
              <Box sx={{ flexGrow: 1 }} className={styles.shipment_top_bar}>
                <Box
                  sx={{ flexGrow: 1 }}
                  className={styles.shipment_filter_box}
                >
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={9}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={2}>
                          <span
                            className={styles.shipment_filter_box_title}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            By Location
                          </span>
                        </Grid>
                        <Grid item xs={12} sm={6} md={5}>
                          {isTataCompany || isNestleCompany ? (
                            <FormControl
                              fullWidth
                              variant="outlined"
                              size="small"
                            >
                              <InputLabel>Plant</InputLabel>
                              <Select
                                value={loadPlantCode}
                                onChange={(e) =>
                                  setLoadPlantCode(e.target.value as string)
                                }
                                input={<OutlinedInput label="Plant" />}
                                renderValue={(selected) => (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 4,
                                    }}
                                  >
                                      <Chip key={selected} label={selected} />
                                  </div>
                                )}
                              >
                                {Object.values(allPlantDetails).map((plant) => (
                                  <MenuItem
                                    key={plant.loadPlantCode}
                                    value={plant.loadPlantCode}
                                  >
                                    {`${plant.loadPlantCode} - ${plant.loadPlantName}`}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              label="From"
                              variant="outlined"
                              size="small"
                              fullWidth
                              value={fromCity}
                              onChange={(e) => setFromCity(e.target.value)}
                              select
                            >
                              {Object.values(shipmentStartCity).map((city) => (
                                <MenuItem key={city} value={city}>
                                  {city}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        </Grid>
                        <Grid item xs={12} sm={6} md={5}>
                          <TextField
                            label="To"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={toCity}
                            onChange={(e) => setToCity(e.target.value)}
                            select
                          >
                            {Object.values(shipmentDestinationCity).map(
                              (city) => (
                                <MenuItem key={city} value={city}>
                                  {city}
                                </MenuItem>
                              )
                            )}
                          </TextField>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4} md={2}>
                          <span className={styles.shipment_filter_box_title}>
                            By Transporter
                          </span>
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <TextField
                            value={transporter}
                            onChange={(e) => setTransporter(e.target.value)}
                            fullWidth
                            variant="outlined"
                            size="small"
                            select
                            label="Transporter"
                          >
                            {Object.values(shipmentTransporter).map((item) => (
                              <MenuItem key={item} value={item}>
                                {item}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* By Zone (Only for Nestle) */}
                    {isNestleCompany && (
                      <Grid item xs={12} md={9}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <span className={styles.shipment_filter_box_title}>
                              By Zone
                            </span>
                            <TextField
                              value={consigneeZone}
                              onChange={(e) => setConsigneeZone(e.target.value)}
                              fullWidth
                              variant="outlined"
                              size="small"
                              select
                              label="Consignee Zone"
                            >
                              {Object.values(consigneeZones).map((item) => (
                                <MenuItem key={item} value={item}>
                                  {item}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              value={consignerZone}
                              onChange={(e) => setConsignerZone(e.target.value)}
                              fullWidth
                              variant="outlined"
                              size="small"
                              select
                              label="Consigner Zone"
                            >
                              {Object.values(consignerZones).map((item) => (
                                <MenuItem key={item} value={item}>
                                  {item}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        </Grid>
                      </Grid>
                    )}

                    <Grid
                      item
                      xs={12}
                      className={styles.filter_button_styles}
                      textAlign="center"
                    >
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={handleCloseFilter}
                        className={styles.search_close_button_style}
                      >
                        <Loading isLoading={isFetching} text="Close" />
                      </Button>
                      <Button
                        type="button"
                        variant="contained"
                        className={styles.search__button_style}
                        onClick={onSubmitFilter}
                      >
                        <Loading isLoading={isFetching} text="Search" />
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={async () => {
                          await resetLocationFilters();
                          // await fetchQueryData(); // Refresh status card counts
                        }}
                        className={styles.search__button_style}
                      >
                        <Loading isLoading={isFetching} text="Reset" />
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          )}
          <Grid container>
            <Box sx={{ flexGrow: 1 }} className={styles.shipment_count_box}>
              <Grid container spacing={2}>
                {[
                  {
                    label: `All Shipments`,
                    icon: <ViewInArIcon />,
                    count: allShipmentsCount,
                    status: IFilterStatus.ALL,
                  },
                  {
                    label: "Awaiting Sync",
                    icon: <SyncIcon/>,
                    count: awaitingSync,
                    status: IFilterStatus.AWAITING_SYNC,
                  },
                  {
                    label: "In Transit",
                    icon: <LocalShippingIcon />,
                    count: inTransitCount,
                    status: IFilterStatus.IN_TRANSIT,
                  },
                  {
                    label: "Untracked",
                    icon: <VisibilityOffIcon />,
                    count: untrackedShipmentCount,
                    status: IFilterStatus.UNTRACKED,
                  },
                  {
                    label: "Completed",
                    icon: <ModeOfTravelIcon />,
                    count: completeCount,
                    status: IFilterStatus.COMPLETED,
                  },
                  {
                    label: "Prioritized",
                    icon: <BeenhereIcon />,
                    count: priorityCount,
                    status: IFilterStatus.PRIORITIZED,
                  },
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                    <div
                      className={
                        activeStatus === item.status
                          ? styles.shipment_count_card_active
                          : styles.shipment_count_card
                      }
                      onClick={() => handleStatusCardClick(item.status)}
                    >
                      <div className={styles.shipment_inner_wrapper}>
                        <div className={styles.shipment_count_icon_bg}>
                          {item.icon}
                        </div>
                        <div className={styles.shipment_text_block}>
                          <Grid className={styles.shipment_count}>
                            {item.count}
                          </Grid>
                          <Grid className={styles.shipment_count_text}>
                            {item.label}
                          </Grid>
                        </div>
                      </div>
                    </div>
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Grid item xs={12}>
              <Card className={styles.shipment_tableCard}>
                <Box className={styles.shipment_textHeadingConatiner}>
                  <Typography
                    className={styles.shipment_tableTitle}
                    style={{ color: primaryColor }}
                  >
                    Shipments
                  </Typography>
                  <CSVDownload
                    filename={`Shipments list - ${
                      selectedCompany?.name
                        ? selectedCompany.name + " - "
                        : Auth.getInstance().getCompanySettings()?.name
                        ? Auth.getInstance().getCompanySettings()?.name + " - "
                        : ""
                    }${getDisplayDateRange(dateRange)} - ${moment().format(
                      "DD-MMM-YYYY HH:mm a"
                    )}`}
                    data={getShipmentsListDataForExport(shipments)}
                  />
                </Box>
                <CardContent>
                  <ShipmentListTable
                    data={(() => {
                      const tableData = shipments.length > 0 ? shipments.sort(
                        (a, b) => b.creationTime - a.creationTime
                      ) : [];
                      return tableData;
                    })()}
                    headers={[
                      { header: "" },
                      { header: isNestleCompany ? "FO Number" : "Shipment ID" },
                      { header: "Truck No" },
                      { header: "Driver Name" },
                      { header: "From" },
                      { header: "To" },
                      {
                        header: "Last Updated On",
                        sortByField: "lastLiveLocationReceivedTime",
                      },
                      { header: "App Status" },
                      {
                        header: "Trip Completion",
                        sortByField: "shipmentCompletionPercentage",
                      },
                      { header: "Created At" },
                      { header: "View Shipment" },
                      { header: "" },
                    ]}
                    dataRenderer={(data, column) => {
                      const shipment = data;
                      switch (column) {
                        case 0: {
                          const iconClass =
                            shipment.status === ShipmentStatus.COMPLETE ||
                            shipment.status === ShipmentStatus.CANCELLED
                              ? styles.shipment_details_status_not_applicable
                              : shipment.shipmentTrackingStatus ===
                                ShipmentTrackingStatus.ACTIVELY_TRACKED
                              ? styles.shipment_details_status_tracked
                              : shipment.shipmentTrackingStatus ===
                                ShipmentTrackingStatus.INTERMITTENTLY_TRACKED
                              ? styles.shipment_details_status_intermittent
                              : styles.shipment_details_status_not_tracked;

                          return (
                            <Box display="flex" justifyContent="center">
                              <FiberManualRecordIcon
                                fontSize="small"
                                className={iconClass}
                              />
                            </Box>
                          );
                        }
                        case 1:
                          return (
                            <Typography fontWeight="bold">
                              {shipment.vanityId}
                            </Typography>
                          );

                        case 2:
                          return shipment.vehicleNumber;

                        case 3:
                          return shipment.driverName;

                        case 4:
                          return shipment.shipmentStartCity;

                        case 5:
                          return shipment.shipmentDestinationCity;

                        case 6:
                          return formatTimestamp(
                            shipment.lastUpdateTime
                          );

                        case 7:
                          switch (shipment.appHealth) {
                            case AppHealth.HEALTHY:
                              return (
                                <Tooltip title="Healthy">
                                  <CheckCircleIcon
                                    fontSize="small"
                                    className={
                                      styles.shipment_details_app_status_healthy
                                    }
                                  />
                                </Tooltip>
                              );
                            case AppHealth.PERMISSIONS_PENDING:
                              return (
                                <Tooltip title="Permissions pending">
                                  <AppBlockingIcon
                                    fontSize="small"
                                    className={
                                      styles.shipment_details_app_status_unhealthy
                                    }
                                  />
                                </Tooltip>
                              );
                            case AppHealth.APP_NOT_INSTALLED:
                              return (
                                <Tooltip title="App not installed">
                                  <MobileOffIcon
                                    fontSize="small"
                                    className={
                                      styles.shipment_details_app_status_unhealthy
                                    }
                                  />
                                </Tooltip>
                              );
                            case AppHealth.APP_UPDATE_REQUIRED:
                              return (
                                <Tooltip title="App update required">
                                  <UpgradeIcon
                                    fontSize="small"
                                    className={
                                      styles.shipment_details_app_status_unhealthy
                                    }
                                  />
                                </Tooltip>
                              );
                            default:
                              return shipment.vanityId ? (
                                <CheckCircleIcon
                                  className={
                                    styles.shipment_details_app_status_exist
                                  }
                                />
                              ) : (
                                <CancelSharpIcon
                                  className={
                                    styles.shipment_details_app_status_not_exist
                                  }
                                />
                              );
                          }

                        case 8:
                          return (
                            <Box>
                              <Typography
                                variant="body2"
                                className={
                                  shipment.shipmentCompletionPercentage === 100
                                    ? styles.shipment_details_progress_bar_100
                                    : styles.shipment_details_progress_bar
                                }
                              >
                                {shipment.shipmentCompletionPercentage.toFixed(
                                  0
                                )}
                                %
                              </Typography>
                              <ProgressBar
                                value={shipment.shipmentCompletionPercentage}
                              />
                            </Box>
                          );

                        case 9:
                          return formatTimestamp(shipment.creationTime);

                        case 10:
                          return (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handelViewDetails(shipment)}
                            >
                              View
                            </Button>
                          );

                        case 11:
                          return (
                            <ActionMenu
                              shipment={shipment}
                              handlePrioritised={handlePrioritised}
                              handleCopyShareLink={handleCopyShareLink}
                              isPrioritized={isPrioritized}
                              isCopyShareLink={isCopyShareLink}
                            />
                          );

                        default:
                          return null;
                      }
                    }}
                    pagination
                    filteredRecords={filteredRecords}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsChange}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
});

export default ShipmentList;

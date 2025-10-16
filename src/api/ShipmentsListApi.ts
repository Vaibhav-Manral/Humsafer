import { IFilterShipmentResponse, IShipment, ShipmentPriority, IQueryHelperResponse } from "../models/ShipmentsView";
import { HumsaferError } from "../models/HumsaferError";
import { BACKEND_URL_V2, get, post } from "../utils/Api";

interface IGetFilterShipments {
  shipments: IShipment[];
  lastVisibleShipmentId: string | null;
  firstVisibleShipmentId: string | null;
  filteredRecords: number;
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

interface ICreateShipmentShareLink {
  shareLink: string;
}

interface ICreateShipmentShareLink {
  shipmentId: string,
  priority: ShipmentPriority
}

interface Plant {
  loadPlantCode: string,
  loadPlantName: string,
}

interface IQueryHelperObject {
  companyId: string,
  "Transporter_Names": string[],
  from: string[],
  to: string[],
  loadPlantCodes: string[],
  plantDetails: Plant[],
  consigneeZone: string[],
  consignerZone: string[]
}

interface IQueryHelper {
  queryHelperList: IQueryHelperObject[];
}

interface ICountObject {
  appSetUpIncompleteShipmentsCount: number,
  unTrackedShipmentsCount: number,
  inTransitShipmentsCount: number,
  prioritizedShipmentsCount: number,
  totalShipmentsCount: number,
  completedShipmentsCount: number,
  awaitingSyncShipmentsCount: number;
}

interface IStatusCount {
  shipmentsStatusWiseCount: ICountObject;
}

export interface IPostFilterShipmentsRequest {
  transporter?: string;
  start?: string;
  end?: string;
  shipmentsStartingFrom?: string;
  fromCity?: string;
  toCity?: string;
  status?: string;
  loadPlantCode?: string | string[];
  consigneeZone?: string;
  consignerZone?: string;
  pageSize?: number;
  lastVisibleShipmentId?: string;
  firstVisibleShipmentId?: string;
  backward?: boolean;
}

export interface IGetAllCountV2Request {
  shipmentsStartingFrom?: string;
  end?: string;
  fromCity?: string;
  toCity?: string;
  transporter?: string;
  loadPlantCode?: string | string[];
  consigneeZone?: string;
  consignerZone?: string;
}

function objectToQueryParams(obj: any): string {
  
  const params: string[] = [];
  
  Object.entries(obj).forEach(([key, value]) => {
    
    // Skip null, undefined, and empty string values
    if (value === null || value === undefined || value === '') {
      return;
    }
    
    // Handle arrays by creating repeated query parameters
    if (Array.isArray(value)) {
      if (value.length > 0) {
        value.forEach((item: any, index: number) => {
          if (item !== null && item !== undefined && item !== '') {
            try {
              params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
            } catch (error) {
              console.error(`objectToQueryParams: Error processing array item ${index} for key="${key}":`, error, 'item:', item);
            }
          }
        });
      }
    } else {
      // Handle single values
      try {
        params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      } catch (error) {
        console.error(`objectToQueryParams: Error processing single value for key="${key}":`, error, 'value:', value);
      }
    }
  });
  
  return params.join('&');
}

export const getStatusWiseShipments = async (companyId: string, data: any, status?: string, pageSize?: string, shipmentsStartingFrom?: string): Promise<IFilterShipmentResponse | HumsaferError> => {
  try {
    
    const sanitizedData = {
      ...data,
      ...(status && { status }),
      ...(pageSize && { pageSize }),
      ...(shipmentsStartingFrom && { shipmentsStartingFrom })
    };

    // More robust cleaning to handle nested nulls and objects
    const cleanedData = {};
    Object.entries(sanitizedData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          const filteredArray = value.filter(item => item !== null && item !== undefined && item !== '');
          if (filteredArray.length > 0) {
            cleanedData[key] = filteredArray;
          }
        } else if (typeof value === 'object' && value !== null) {
          // Handle nested objects - remove null properties
          const cleanedObject = {};
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            if (nestedValue !== null && nestedValue !== undefined && nestedValue !== '') {
              cleanedObject[nestedKey] = nestedValue;
            }
          });
          if (Object.keys(cleanedObject).length > 0) {
            cleanedData[key] = cleanedObject;
          }
        } else {
          cleanedData[key] = value;
        }
      }
    });
    
    const queryParams = objectToQueryParams(cleanedData);
    
    const response = await get<IGetFilterShipments>(`${BACKEND_URL_V2}/companies/${companyId}/getStatusWiseShipments?${queryParams}`);
    
    if (response.parsedBody?.shipments) {
      return response.parsedBody;
    }
    
    const errorMessage = response.serverError?.error.message ?? "Shipment could not be retrieved";
    
    // If shipmentsWithPagination fails with multiple points or similar error, return minimal response
    if (errorMessage.includes('multiple points') || errorMessage.includes('Multiple points') || 
        errorMessage.includes('invalid') || errorMessage.includes('Invalid')) {
      return {
        shipments: [],
        totalRecords: 0,
        filteredRecords: 0,
        currentPage: 1,
        totalPages: 1,
        firstVisibleShipmentId: null,
        lastVisibleShipmentId: null
      };
    }
    
    return new HumsaferError(errorMessage);
  } catch (err) {
    // Return empty response instead of error to prevent crashes
    return {
      shipments: [],
      totalRecords: 0,
      filteredRecords: 0,
      currentPage: 1,
      totalPages: 1,
      firstVisibleShipmentId: null,
      lastVisibleShipmentId: null
    };
  }
};

export const getShipments = async (companyId: string, data: any): Promise<IFilterShipmentResponse | HumsaferError> => {
  try {
    // Sanitize and validate data to prevent API failures
    const sanitizedData = {
      ...data,
      // Remove problematic values that cause API failures
      fromCity: data.fromCity === null || data.fromCity === '' ? undefined : data.fromCity,
      toCity: data.toCity === null || data.toCity === '' ? undefined : data.toCity,
      transporter: data.transporter === null || data.transporter === '' ? undefined : data.transporter,
      loadPlantCode: Array.isArray(data.loadPlantCode) && data.loadPlantCode.length > 0 ? data.loadPlantCode : undefined,
      consigneeZone: data.consigneeZone === null || data.consigneeZone === '' ? undefined : data.consigneeZone,
      consignerZone: data.consignerZone === null || data.consignerZone === '' ? undefined : data.consignerZone,
    };

    // Clean the data object to remove null/undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(sanitizedData).filter(([_, value]) => 
        value !== null && value !== undefined && value !== '' && 
        !(Array.isArray(value) && value.length === 0)
      )
    );
    
    const queryParams = objectToQueryParams(cleanedData);
    
    const response = await get<IGetFilterShipments>(`${BACKEND_URL_V2}/companies/${companyId}/shipmentsWithPagination?${queryParams}`);
    
    if (response.parsedBody?.shipments) {
      return response.parsedBody;
    }
    
    const errorMessage = response.serverError?.error.message ?? "Shipment could not be retrieved";
    console.error('ShipmentsWithPagination API error:', errorMessage);
    
    // If shipmentsWithPagination fails with multiple points or similar error, return minimal response
    if (errorMessage.includes('multiple points') || errorMessage.includes('Multiple points') || 
        errorMessage.includes('invalid') || errorMessage.includes('Invalid')) {
      return {
        shipments: [],
        totalRecords: 0,
        filteredRecords: 0,
        currentPage: 1,
        totalPages: 1,
        firstVisibleShipmentId: null,
        lastVisibleShipmentId: null
      };
    }
    
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.error('ShipmentsWithPagination API exception:', err);
    // Return empty response instead of error to prevent crashes
    return {
      shipments: [],
      totalRecords: 0,
      filteredRecords: 0,
      currentPage: 1,
      totalPages: 1,
      firstVisibleShipmentId: null,
      lastVisibleShipmentId: null
    };
  }
};

export const getFilteredShipments = async (companyId: string, data: any): Promise<IFilterShipmentResponse | HumsaferError> => {
  try {
    // NUCLEAR OPTION: Check if we actually have location filters before calling filterWithLocations
    const hasActualLocationFilters = (
      (data.fromCity && data.fromCity !== null && data.fromCity !== '') ||
      (data.toCity && data.toCity !== null && data.toCity !== '') ||
      (data.transporter && data.transporter !== null && data.transporter !== '') ||
      (Array.isArray(data.loadPlantCode) && data.loadPlantCode.length > 0) ||
      (data.consigneeZone && data.consigneeZone !== null && data.consigneeZone !== '') ||
      (data.consignerZone && data.consignerZone !== null && data.consignerZone !== '')
    );

    if (!hasActualLocationFilters) {
      return await getShipments(companyId, data);
    }
    
    // Sanitize data similar to getShipments to prevent API failures
    const sanitizedData = {
      ...data,
      fromCity: data.fromCity === null || data.fromCity === '' ? undefined : data.fromCity,
      toCity: data.toCity === null || data.toCity === '' ? undefined : data.toCity,
      transporter: data.transporter === null || data.transporter === '' ? undefined : data.transporter,
      loadPlantCode: Array.isArray(data.loadPlantCode) && data.loadPlantCode.length > 0 ? data.loadPlantCode : undefined,
      consigneeZone: data.consigneeZone === null || data.consigneeZone === '' ? undefined : data.consigneeZone,
      consignerZone: data.consignerZone === null || data.consignerZone === '' ? undefined : data.consignerZone,
    };
    
    // Clean the data object to remove null/undefined values that cause "multiple points" error
    const cleanedData = Object.fromEntries(
      Object.entries(sanitizedData).filter(([_, value]) => 
        value !== null && value !== undefined && value !== '' && 
        !(Array.isArray(value) && value.length === 0)
      )
    );
    
    const queryParams = objectToQueryParams(cleanedData);
    
    const response = await get<IGetFilterShipments>(`${BACKEND_URL_V2}/companies/${companyId}/filterWithLocations?${queryParams}`);
    if (response.parsedBody?.shipments) {
      return response.parsedBody;
    }
    
    const errorMessage = response.serverError?.error.message ?? "Shipment could not be retrieved";
    console.error('FilterWithLocations API error:', errorMessage);
    
    // If filterWithLocations fails with any validation error, fallback to getShipments
    if (errorMessage.includes('multiple points') || errorMessage.includes('Multiple points') || 
        errorMessage.includes('invalid') || errorMessage.includes('Invalid') ||
        errorMessage.includes('error') || errorMessage.includes('Error')) {
      return await getShipments(companyId, data);
    }
    
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.error('FilterWithLocations API exception:', err);
    // Always fallback to getShipments if filterWithLocations fails
    try {
      return await getShipments(companyId, data);
    } catch (fallbackErr) {
      console.error('Fallback getShipments also failed:', fallbackErr);
      // Return empty response as last resort to prevent UI crashes
      return {
        shipments: [],
        totalRecords: 0,
        filteredRecords: 0,
        currentPage: 1,
        totalPages: 1,
        firstVisibleShipmentId: null,
        lastVisibleShipmentId: null
      };
    }
  }
};

export const getStatusFilteredShipments = async (companyId: string, data: any): Promise<IFilterShipmentResponse | HumsaferError> => {
  try {
    // ALWAYS use getShipments to avoid multiple points error
    return await getShipments(companyId, data);
  } catch (err) {
    console.error('GetStatusWiseShipments fallback failed:', err);
    return new HumsaferError("GetStatusWiseShipments API failed");
  }
};

export const getQueryHelper = async (companyId: string): Promise< IQueryHelperResponse | HumsaferError> => {
  try {
    const response = await get<IQueryHelper>(`${BACKEND_URL_V2}/companies/${companyId}/getAllQueryHelperDetails`);
    if (response.parsedBody) {
      return response.parsedBody;
    }
    const errorMessage = response.serverError?.error.message ?? "Data could not be retrieved";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const getAllStatsCount = async (companyId: string, data: string): Promise< ICountObject | HumsaferError> => {
  try {
    const response = await get<IStatusCount>(`${BACKEND_URL_V2}/companies/${companyId}/getAllCount?shipmentsStartingFrom=${data}`);
    if (response.parsedBody?.shipmentsStatusWiseCount) {
      return response.parsedBody.shipmentsStatusWiseCount;
    }
    const errorMessage = response.serverError?.error.message ?? "Data could not be retrieved";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};


export const createShipmentShareLink = async (companyId: string, shipmentId: string): Promise<ICreateShipmentShareLink | HumsaferError> => {
  try {
    const response = await post<ICreateShipmentShareLink>(`${BACKEND_URL_V2}/companies/${companyId}/shipments/${shipmentId}/shareLink`);
    if (response.parsedBody) {
      return response.parsedBody;
    }
    const errorMessage = response.serverError?.error.message ?? "Something went wrong";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const changeShipmentPriority = async (companyId: string, shipmentId: string, priority: ShipmentPriority): Promise<ICreateShipmentShareLink | HumsaferError> => {
  try {

    const response = await post<ICreateShipmentShareLink>(`${BACKEND_URL_V2}/companies/${companyId}/shipments/${shipmentId}/priority/${priority}`);
    if (response.parsedBody) {
      return response.parsedBody;
    }
    const errorMessage = response.serverError?.error.message ?? "Something went wrong";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};


export const postFilterShipments = async (companyId: string, data: IPostFilterShipmentsRequest): Promise<IFilterShipmentResponse | HumsaferError> => {
  try {
    const response = await post<IGetFilterShipments>(`${BACKEND_URL_V2}/companies/${companyId}/shipments/filter`, data);
    if (response.parsedBody?.shipments) {
      return response.parsedBody;
    }
    const errorMessage = response.serverError?.error.message ?? "Shipment could not be retrieved";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const getAllCountV2 = async (companyId: string, data: IGetAllCountV2Request): Promise<IStatusCount | HumsaferError> => {
  try {
    // Clean the data object to remove null/undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) =>
        value !== null && value !== undefined && value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      )
    );

    const queryParams = objectToQueryParams(cleanedData);

    const response = await get<IStatusCount>(`${BACKEND_URL_V2}/companies/${companyId}/getAllCount/v2?${queryParams}`);

    if (response.parsedBody) {
      return response.parsedBody;
    }

    const errorMessage = response.serverError?.error.message ?? "Data could not be retrieved";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};





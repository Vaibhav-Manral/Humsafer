import { useMutation, useQuery } from '@tanstack/react-query';
import { postFilterShipments, getAllCountV2, getQueryHelper } from '../api/ShipmentsListApi';
import { IPostFilterShipmentsRequest, IGetAllCountV2Request } from '../api/ShipmentsListApi';
import { ICountObject, IQueryHelperResponse } from '../models/ShipmentsView';
import { HumsaferError } from '../models/HumsaferError';

export const usePostFilterShipments = () => {
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: IPostFilterShipmentsRequest }) =>{
      data.loadPlantCode = (Array.isArray(data.loadPlantCode) && data.loadPlantCode.length === 0)
     ? ""
     : data.loadPlantCode;
     return postFilterShipments(companyId, data)}
  });
};

interface UseGetAllCountV2Props {
  companyId: string;
  data: IGetAllCountV2Request;
  enabled?: boolean;
}

export const useGetAllCountV2 = ({ companyId, data, enabled = true }: UseGetAllCountV2Props) => {
  return useQuery<ICountObject, HumsaferError>({
    queryKey: ['getAllCountV2', companyId, data],
    queryFn: async () => {
      const result = await getAllCountV2(companyId, data);
      if (result instanceof HumsaferError) {
        throw result;
      }
      return result.shipmentsStatusWiseCount;
    },
    enabled: enabled && !!companyId,
  });
};

export const useGetQueryHelper = (companyId: string, enabled = true) => {
  return useQuery<IQueryHelperResponse, HumsaferError>({
    queryKey: ['getQueryHelper', companyId],
    queryFn: async () => {
      const result = await getQueryHelper(companyId);
      if (result instanceof HumsaferError) {
        throw result;
      }
      return result;
    },
    enabled: enabled && !!companyId,
  });
};
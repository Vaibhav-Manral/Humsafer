import {
  IShipment,
  IShipmentEndMethod,
  ShipmentStatus,
} from "../models/ShipmentsView";
import { formatTimestamp } from "./DateUtils";
import {
  getDisplayNameForAppHealth,
  getDisplayTextForShipmentStatus,
} from "./DisplayUtils";

export function getShipmentsListDataForExport(shipmentListViews: IShipment[]): {
  headers: { label: string; key: string }[];
  rows: any[];
} {
  if (!shipmentListViews || shipmentListViews.length === 0) {
    console.warn("No shipment data available for export.");
    return { headers: [], rows: [] };
  }

  const rows: {
    shipmentId: string;
    truckNumber: string;
    driverName: string;
    associatedEntity: string;
    driverMobileNumber: string;
    from: string;
    to: string;
    creationTime?: string;
    lastUpdatedOn?: string;
    appStatus: string;
    tripCompletion: string;
    status: string;
    loadPLantCode?: string;
    loadPlantDescription?: string;
  }[] = [];

  shipmentListViews.sort((a, b) => {
    return a.creationTime > b.creationTime ? 1 : -1;
  });

  shipmentListViews.forEach((shipment) => {
    // const statusText = getDisplayTextForShipmentStatus(shipment.status);
    // const manualIndicator =
    //   (shipment.status === ShipmentStatus.COMPLETE &&
    //     shipment.shipmentEndMethod === IShipmentEndMethod.MANUAL) ||
    //   (shipment.status === ShipmentStatus.NOT_TRACKED &&
    //     shipment.shipmentEndMethod === IShipmentEndMethod.MANUAL &&
    //     Number(shipment.shipmentCompletionPercentage.toFixed(0)) === 0)
    //     ? "(M)"
    //     : "";

    const row = {
      shipmentId: shipment.vanityId,
      truckNumber: shipment.vehicleNumber,
      driverName: shipment.driverName,
      associatedEntity: shipment.associatedEntity,
      driverMobileNumber: shipment.driverMobileNumber,
      from: shipment.shipmentStartCity,
      to: shipment.shipmentDestinationCity,
      creationTime: formatTimestamp(shipment.creationTime),
      lastUpdatedOn: formatTimestamp(shipment.lastLiveLocationReceivedTime),
      appStatus: getDisplayNameForAppHealth(shipment.appHealth),
      tripCompletion: `${shipment.shipmentCompletionPercentage.toFixed(0)} %`,
      status: `${getDisplayTextForShipmentStatus(shipment.status)} ${
        shipment.status === ShipmentStatus.COMPLETE &&
        shipment.shipmentEndMethod === IShipmentEndMethod.MANUAL
          ? "(M)"
          : shipment.status === ShipmentStatus.NOT_TRACKED &&
            shipment.shipmentEndMethod === IShipmentEndMethod.MANUAL &&
            Number(shipment.shipmentCompletionPercentage.toFixed(0)) === 0
          ? "(M)"
          : shipment.status === ShipmentStatus.IN_COMPLETE &&
            shipment.shipmentEndMethod === IShipmentEndMethod.MANUAL
          ? "(M)"
          : ""
      }`,

      loadPLantCode: shipment?.loadPLantCode,
      loadPlantDescription: shipment?.loadPlantDescription,
    };
    rows.push(row);
  });

  const headers = [
    { label: "Shipment ID", key: "shipmentId" },
    { label: "Truck No", key: "truckNumber" },
    { label: "Driver Name", key: "driverName" },
    { label: "Branch / Transporter", key: "associatedEntity" },
    { label: "Driver Mobile Number", key: "driverMobileNumber" },
    { label: "From", key: "from" },
    { label: "To", key: "to" },
    { label: "Creation Time", key: "creationTime" },
    { label: "Last Updated On", key: "lastUpdatedOn" },
    { label: "App Status", key: "appStatus" },
    { label: "Trip Completion", key: "tripCompletion" },
    { label: "Status", key: "status" },
  ];

  if (
    shipmentListViews.some(
      (shipment) =>
        shipment.loadPLantCode !== undefined &&
        shipment.loadPlantDescription !== undefined
    )
  ) {
    headers.push({ label: "Plant ID", key: "loadPLantCode" });
    headers.push({ label: "Plant Name", key: "loadPlantDescription" });
  }

  return {
    headers,
    rows,
  };
}

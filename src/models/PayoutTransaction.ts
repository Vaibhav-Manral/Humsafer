export interface IPayoutTransaction {
  id: string;
  status: PayoutTransactionStatus;
  reason: PayoutReason;
  razorPayTransactionId: string;
  userId: string;
  amountInPaise: number;
  starPoints: number;
  upiAddress: string;
  creationTime: number;
  lastUpdateTime: number;

}

export enum PayoutReason {
  UPI_ADDED = "UPI_ADDED",
  STAR_POINTS_REDEEM = "STAR_POINTS_REDEEM"
}

export enum PayoutTransactionStatus {
  INITIATED = "INITIATED",
  PROCESSED = "PROCESSED",
  REVERSED = "REVERSED",
  REJECTED = "REJECTED",
}

import { IPayoutTransaction } from "../../models/PayoutTransaction";
import { formatDateTime } from "../../utils/DateUtils";
import { formatAmountInPaiseForDisplay } from "../../utils/DisplayUtils";
import GenericTableWithTitle from "../genericTable/GenericTableWithTitle";

interface IPayoutTransactionsProps {
    payoutTransactions: IPayoutTransaction[];
}

const PayoutTransactionsTable: React.FC<IPayoutTransactionsProps> = (props) => {
    const { payoutTransactions } = props;
    return (
        <>
            <GenericTableWithTitle
                title={`Last ${payoutTransactions.length} Transactions`}
                headers={["Time", "Amount (in ₹)", "Razorpay Transaction ID", "Star Points", "Upi Address", "Status", "Last updated time"]}
                data={payoutTransactions}
                dataRenderer={(data, column) => {
                    const transaction = data;
                    switch (column) {
                        case 0:
                            return formatDateTime(transaction.creationTime);
                        case 1:
                            return formatAmountInPaiseForDisplay(transaction.amountInPaise);
                        case 2:
                            return transaction.razorPayTransactionId;
                        case 3:
                            return transaction.starPoints;
                        case 4:
                            return transaction.upiAddress;
                        case 5:
                            return transaction.status;
                        case 6:
                            return formatDateTime(transaction.lastUpdateTime);
                    }
                }}
            />
        </>
    )
}

export default PayoutTransactionsTable;

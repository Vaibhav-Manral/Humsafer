import { Card, CardContent, Grid } from "@mui/material";
import { useContext } from "react";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { IPaymentMethodView, PaymentMethodStatus } from "../../models/PaymentMethodView";
import { IPayoutTransaction } from "../../models/PayoutTransaction";
import PayoutTransactionsTable from "../payoutTransactionsTable/PayoutTransactionsTable";
import styles from "./PaymentInfo.module.css";

export interface IPaymentInfoProps {
    paymentMethods: IPaymentMethodView[] | undefined;
    payoutTransactions: IPayoutTransaction[];
}

const PaymentInfo: React.FC<IPaymentInfoProps> = (props) => {
    const { paymentMethods, payoutTransactions } = props;
    const { primaryColor } = useContext(HumsaferThemeContext);
    const paymentMethod = (paymentMethods && paymentMethods.length > 0) ? paymentMethods[0] : undefined;
    return (
        <>
            <Card className={styles.paymentInfo_container}>
                <div className={styles.paymentInfo_headingConatiner}>
                    <div className={styles.paymentInfo_title} style={{ color: primaryColor }}>Payout Info</div>
                </div>
                <CardContent>
                    {paymentMethod && (
                        <div >
                            <Grid container spacing={2} className={styles.paymentInfo_row}>
                                <Grid item md={6}>
                                    <div className={styles.paymentInfo_label}>UPI Address</div>
                                    <div className={styles.paymentInfo_value}>{paymentMethod.upiAddress ?? "-"}</div>
                                </Grid>
                                <Grid item md={6}>
                                    <div className={styles.paymentInfo_label}>UPI status</div>
                                    <div className={paymentMethod.status === PaymentMethodStatus.VALID ?
                                        styles.paymentInfo_successValue : styles.paymentInfo_errorValue}>
                                        {paymentMethod.status}
                                    </div>
                                </Grid>
                            </Grid>
                            <br />
                            {payoutTransactions && payoutTransactions.length > 0 && (
                                <PayoutTransactionsTable payoutTransactions={payoutTransactions} />
                            )}
                            {(!payoutTransactions || payoutTransactions.length === 0) && (
                                <Grid container className={styles.paymentInfo_row}>
                                    <br />
                                    <Grid item md={12}>
                                        No payout transactions found for this user
                                    </Grid>
                                </Grid>
                            )}
                        </div>
                    )}
                </CardContent>

            </Card>

        </>
    );
}

export default PaymentInfo;

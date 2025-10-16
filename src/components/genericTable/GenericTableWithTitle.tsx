import { Card, CardContent } from '@mui/material';
import { useContext } from 'react';
import { HumsaferThemeContext } from '../../contexts/HumsaferThemeContext';
import GenericTable, { IGenericTableProps } from './GenericTable';
import style from "./GenericTable.module.css"

interface IProps {
    title: string;
}

function GenericTableWithTitle<T>({ title, ...rest }: IProps & IGenericTableProps<T>) {

    const { primaryColor } = useContext(HumsaferThemeContext);

    return (
        <>
        {/* // <Card className={style.GenericTable__tableCard}> */}
            {/* <div className={style.GenericTable__textHeadingConatiner}>
                <div className={style.GenericTable__tableTitle} style={{ color: primaryColor }}>{title}</div>
            </div> */}
            <CardContent className={style.GenericTable__cardContent}>
                <GenericTable {...rest} />
            </CardContent>
        </>
        // {/* </Card> */}
    )
}

export default GenericTableWithTitle

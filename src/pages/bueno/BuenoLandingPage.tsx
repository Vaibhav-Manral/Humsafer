import React, { useContext } from 'react';
import { HumsaferThemeContext } from '../../contexts/HumsaferThemeContext';
import styles from "./BuenoLandingPage.module.css";

const BuenoLandingPage: React.FC = React.memo(() => {

    const { logoDark } = useContext(
        HumsaferThemeContext
    );
    return (
        <div className={styles.buenoPage_componentContainer}>
            <img src={logoDark} alt="logo" className={styles.logo} />
            <h3>हमने इस सेवा को कुछ समाई के लिए बंद किया है, हम आपको सेवा के वापस शुरू होते ही सुचित करेंगे। धन्यवाद</h3>
            <h3>We have shut down this service temporarily,
                we will notify you when we resume this service.</h3>
        </div >
    );
});

export default BuenoLandingPage;

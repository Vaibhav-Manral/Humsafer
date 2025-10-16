import { Box, Grid } from "@mui/material";
import React from "react";
import AffiliationProvisioning from "../../components/affiliationProvisioning/AffiliationProvisioning";
import styles from "./Partnerships.module.css";
import { useContext } from "react";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";

const PartnershipsPage: React.FC = React.memo(() => {
  const { primaryColor } = useContext(HumsaferThemeContext);

  return (
    <Box>
      <Grid container>
        <Grid item lg={12} md={12} xs={12}>
          <Box className={styles.partnershipsPage_parentContainer}>
            <Box className={styles.title} style={{ color: primaryColor }}>
              Partnerships
            </Box>
          </Box>
          <Grid
            className={styles.partnershipsPage_componentContainer}
            item
            lg={12}
            md={12}
            xs={12}
          >
            <AffiliationProvisioning />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
});

export default PartnershipsPage;

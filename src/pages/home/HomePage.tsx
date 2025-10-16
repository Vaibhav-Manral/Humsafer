import { Typography } from '@mui/material';
import React from 'react';

const HomePage: React.FC = React.memo(() => {
    return (
        <Typography variant='h1' sx={{ fontSize: { xs: "22px", sm: "28px", md: "34px", lg: "40px" }, fontWeight: 700 }}>
            Home Page - Logged in      
        </Typography>
    );
});

export default HomePage;

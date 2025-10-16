import React from 'react';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';

interface CustomLinearProgressProps extends LinearProgressProps {
  valueProp: number;
}

const BorderLinearProgress = styled(
  ({ valueProp, ...other }: CustomLinearProgressProps) => <LinearProgress {...other} />
)(
  ({ valueProp }) => ({
    height: 4,
    borderRadius: 3,
    '& .MuiLinearProgress-bar': {
      borderRadius: 5,
    },
    '& .MuiLinearProgress-barColorPrimary': {
      backgroundColor: valueProp === 100 ? '#03A89E' : '#2D9CDB',
    },
    '& .MuiLinearProgress-colorPrimary': {
      backgroundColor: '#E2E8F0',
    },
    '&.MuiLinearProgress-root': {
      backgroundColor: '#E2E8F0',
    },
  })
);

interface ProgressBarProps {
  value: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  return (
    <BorderLinearProgress valueProp={value} variant="determinate" value={value} />
  );
};

export default ProgressBar;

import React from "react";
import { CSVLink } from "react-csv";

interface IProps {
  filename: string;
  data: { headers: { label: string; key: string }[]; rows: any[] };
}

const CSVDownload: React.FC<IProps> = (props) => {
  return (
    <CSVLink
      headers={props.data.headers}
      data={props.data.rows}
      filename={`${props.filename}.csv`}
      target="_blank"
    >
      Export to CSV
    </CSVLink>
  );
};

export default CSVDownload;

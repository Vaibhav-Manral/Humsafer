import contentDisposition from "content-disposition";

export const downloadFile = (
    headers: Headers,
    blob: Blob,
    defaultFileName: string
) => {
    const contentDispositionHeader = headers.get("Content-Disposition");

    let fileName;
    if (contentDispositionHeader) {
        const res = contentDisposition.parse(contentDispositionHeader);
        fileName = res.parameters.filename as string;
    }

    const anchor = window.document.createElement("a");
    anchor.href = window.URL.createObjectURL(blob);
    anchor.download = fileName ?? defaultFileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(anchor.href);
};

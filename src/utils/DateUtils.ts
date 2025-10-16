import humanizeDuration from "humanize-duration";
import moment from "moment";

export const formatDate = (date: string | number, parseFormat?: "DD-MM-yyyy" | "YYYY-MM-DD", dateFormat?: "DD-MMM-YYYY" | string) => {
    const dateStr = moment(date, parseFormat);
    const formattedDate = dateStr.format(dateFormat);
    return formattedDate;
};

export const formatDateTime = (date: string | number) => {
    const dateStr = moment(date);
    const formattedDate = dateStr.format('DD-MMM-YYYY, h:mm a');
    return formattedDate;
};

export const formatDateForBackend = (date: Date) => {
    const dateStr = moment(date);
    const formattedDate = dateStr.format('yyyy-MM-DD');
    return formattedDate;
};

export const firstOfThisMonth = () => {
    return moment().startOf('month').toDate()
}

export const lastOfThisMonth = () => {
    return moment().endOf('month').toDate()
}

export const formatMilliSecondsForDisplay = (millis: number) => {
    return humanizeDuration(millis, { round: true });
}

export const googleMapLinkForLatLong = (latitude: number, longitude: number) => {
    if (latitude === 0 || longitude === 0) {
        return;
    }

    return `https://www.google.com/maps?q=${latitude},${longitude}`
}

export const formatTimestamp = (timestamp: number | undefined) => {
    if (timestamp) {
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', options);
    }
}

export const formatTimestampForDate = (timestamp: number | undefined) => {
    if (timestamp) {
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short'
        };
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', options);
    }
}

export const convertMillisToMinutes = (millis: number) => {
    const duration = moment.duration(millis);
    return duration.minutes();
}

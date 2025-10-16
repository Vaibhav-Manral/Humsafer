export const generateMapsUrl = (waypointsList, mapsUrl) => {
    // 9 waypoints are selected since Google Maps shows only 9 waypoints at max
    if (waypointsList.length > 1 && waypointsList.length <= 10) {
        // Starting from index 1 since index 0 is same as the ride start point
        for (let i = 1; i < waypointsList.length; i++) {
            mapsUrl += `${waypointsList[i].latitude},${waypointsList[i].longitude}%7C`
        }
        // Selecting 9 evenly distributed waypoints from a list of 9+ waypoints
    } else if (waypointsList.length > 10) {
        let interval = waypointsList.length / 10;
        for (let i = 1; i < 10; i++) {
            let index = Math.floor(i * interval + interval / 2);
            mapsUrl += `${waypointsList[index].latitude},${waypointsList[index].longitude}%7C`
        }
    }

    // Sample mapUrl (waypoints are optional)
    // https://www.google.com/maps/dir/?api=1&origin=30.8177167,78.6230083&destination=29.9456533,78.1539617&travelmode=driving&waypoints=30.72961,78.4381367%7C30.7152925,78.3511858%7C30.587022,78.3241368%7C30.4712556,78.3480956%7C30.3885498,78.4004439%7C30.2929765,78.3554703%7C30.2485324,78.3665567%7C30.1284564,78.2937739%7C29.945653,78.1539617%7C

    return mapsUrl;
};

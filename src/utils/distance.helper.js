const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees) => {
    return (degrees * Math.PI) / 180;
};

// 1. Calcular distancia entre puntos
const calculateDistanceBetweenPoints = (
    latitude1,
    longitude1,
    latitude2,
    longitude2,
) => {
    const lat1 = toRadians(Number(latitude1));
    const lat2 = toRadians(Number(latitude2));

    const deltaLatitude = toRadians(
        Number(latitude2) - Number(latitude1),
    );

    const deltaLongitude = toRadians(
        Number(longitude2) - Number(longitude1),
    );

    const a =
        Math.sin(deltaLatitude / 2) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLongitude / 2) ** 2;

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a),
    );

    return EARTH_RADIUS_METERS * c;
};

// 2. Calcular distancia total
const calculateTotalDistance = (points = []) => {
    if (!Array.isArray(points) || points.length < 2) {
        return 0;
    }

    let totalDistance = 0;

    for (let index = 1; index < points.length; index++) {
        const previousPoint = points[index - 1];
        const currentPoint = points[index];

        totalDistance += calculateDistanceBetweenPoints(
            previousPoint.latitud,
            previousPoint.longitud,
            currentPoint.latitud,
            currentPoint.longitud,
        );
    }

    return Number(totalDistance.toFixed(2));
};

module.exports = {
    calculateDistanceBetweenPoints,
    calculateTotalDistance,
};
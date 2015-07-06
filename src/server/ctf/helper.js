// compare distance
function get_distance(latitude1, longitude1, latitude2, longitude2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(latitude2-latitude1);  // deg2rad below
    var dLon = deg2rad(longitude2-longitude1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(latitude1)) * Math.cos(deg2rad(latitude2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // distance in metres
}

function get_direction(latitude1, longitude1, latitude2, longitude2) {
    var startLat = deg2rad(latitude1);
    var startLong = deg2rad(longitude1);
    var endLat = deg2rad(latitude2);
    var endLong = deg2rad(longitude2);

    var dLong = endLong - startLong;

    var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
    if (Math.abs(dLong) > Math.PI){
        if (dLong > 0.0)
            dLong = -(2.0 * Math.PI - dLong);
        else
            dLong = (2.0 * Math.PI + dLong);
    }

    return (rad2deg(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}
function rad2deg(n) {
    return n * (180 / Math.PI);
}

module.exports = {
    get_distance: get_distance,
    get_direction: get_direction,
    deg2rad: deg2rad,
    rad2deg: rad2deg
};
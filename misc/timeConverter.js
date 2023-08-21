/**
* Time Parameter converter from different units to ms
* @module
*/

function convert(timeParam, timeUnit) {
    let multiple = 1;
    switch (timeUnit) {
        case ('seconds'):
            multiple = 1000;
            break;
        case ('minutes'):
            multiple = 1000 * 60;
            break;
        case ('hours'):
            multiple = 1000 * 60 * 60;
            break;
        case ('days'):
            multiple = 1000 * 60 * 60 * 24;
            break;
        default:
            break;
    }
    return timeParam * multiple;
}

export default convert;

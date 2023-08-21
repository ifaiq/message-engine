function getFakeViewsCount() {
    const min = 1;
    const max = 10;
    /**
     * Random number between min and max
     */
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber;
}

export default getFakeViewsCount;

const getAverageLength = (arr) => {
    if (!arr || arr.length === 0) return 0;
    
    // Use reduce for a cleaner "total" calculation
    const totalLength = arr.reduce((acc, el) => acc + el.text.length, 0);

    return totalLength / arr.length;
};

module.exports = getAverageLength;
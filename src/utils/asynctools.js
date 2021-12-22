// enable async foreach, callback should be a Promise
export function asyncForEach(arr, callback) {
    let resultArr = [];
    let promiseArr = [];
    const O = Object(arr);
    for (let i = 0; i < arr.length; i++) {
        let p = new Promise((resolve, reject) => {
            callback(O[i], i, O).then((result) => {
                // console.log('Promise: ', result);
                resultArr.push(result);
                resolve();
            })
        })
        promiseArr.push(p);
    }
    return Promise.all(promiseArr).then(res => {
        return resultArr;
    })
}
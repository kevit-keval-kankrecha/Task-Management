const calculateTip = (total,tipPercent=.25)=>total+(total*tipPercent);

const fahrenheitToCelsuis=(temprature)=>{
    return (temprature-32)/1.8;
}

const celsiusToFahrenheit=(temprature)=>{
    return (temprature*1.8)+32;
}

const add=(a,b)=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            if(a<0 || b<0){
                reject('Number Should be Positive');
            }
            resolve(a+b);
        },1000);
    });
}



module.exports={
    calculateTip,
    celsiusToFahrenheit,
    fahrenheitToCelsuis,
    add
}
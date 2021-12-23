const ConstantLoader = (envName: string) => {
    console.log('env', process.env);
    return process.env.NODE_ENV;
}


export default ConstantLoader;
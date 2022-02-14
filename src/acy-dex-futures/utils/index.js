import {bigNumberify} from '@/utils/utils';

export async function getGasLimit(contract, method, params = [], value, gasBuffer) {
  const defaultGasBuffer = 200000;
  const defaultValue = bigNumberify(0);

  if (!value) {
    value = defaultValue;
  }

  let gasLimit = await contract.estimateGas[method](...params, { value });

  if (!gasBuffer) {
    gasBuffer = defaultGasBuffer;
  }

  return gasLimit.add(gasBuffer);
}

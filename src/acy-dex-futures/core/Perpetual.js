export async function callContract(chainID, method, params, opts) {
  try {
    if (!Array.isArray(params) && typeof params === 'object' && opts === undefined) {
      opts = params;
      params = [];
    }
    if (!opts) {
      opts = {};
    }

    if (!opts.gasLimit) {
      opts.gasLimit = await getGasLimit(contract, method, params, opts.value);
    }

    const res = await contract[method](...params, { gasLimit: opts.gasLimit, value: opts.value });
    const txUrl = getExplorerUrl(chainID) + 'tx/' + res.hash;
    const sentMsg = opts.sentMsg || 'Transaction sent.';
    helperToast.success(
      <div>
        {sentMsg}{' '}
        <a href={txUrl} target="_blank" rel="noopener noreferrer">
          View status.
        </a>
        <br />
      </div>
    );
    if (opts.setPendingTxns) {
      const pendingTxn = {
        hash: res.hash,
        message: opts.successMsg || 'Transaction completed.',
      };
      opts.setPendingTxns(pendingTxns => [...pendingTxns, pendingTxn]);
    }
    return res;
  } catch (e) {
    let failMsg;
    const [message, type] = extractError(e);
    switch (type) {
      case NOT_ENOUGH_FUNDS:
        failMsg = (
          <div>
            There is not enough ETH in your account on Arbitrum to send this transaction.
            <br />
            <br />
            <a
              href={'https://arbitrum.io/bridge-tutorial/'}
              target="_blank"
              rel="noopener noreferrer"
            >
              Bridge ETH to Arbitrum
            </a>
          </div>
        );
        break;
      case USER_DENIED:
        failMsg = 'Transaction was cancelled.';
        break;
      case SLIPPAGE:
        failMsg =
          'The mark price has changed, consider increasing your Slippage Tolerance by clicking on the "..." icon next to your address.';
        break;
      default:
        failMsg = (
          <div>
            {opts.failMsg || 'Transaction failed.'}
            <br />
            {message && <ToastifyDebug>{message}</ToastifyDebug>}
          </div>
        );
    }
    helperToast.error(failMsg);
    throw e;
  }
}

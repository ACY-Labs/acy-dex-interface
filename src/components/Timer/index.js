import { useEffect, useState, useRef } from 'react';

const Timer = ({ callBack, ms=10000 }) => {
  const [count, setCount] = useState(0);
  const saveCallback = useRef();

  useEffect(() => {
    saveCallback.current = callBack;
  })

  useEffect(() => {
    const timer = setInterval(() => {
      saveCallback.current();
    }, ms);

    return () => {
      clearInterval(timer);
    }
  }, [])

  return (
    <></>
  )
}

export default Timer;
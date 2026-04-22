import { useState, useEffect, useCallback } from 'react';

/**
 * API 호출에 공통적으로 필요한 loading / error / data 상태를 관리하는 커스텀 훅
 *
 * @param {Function} apiFn  - API를 호출하는 함수 (Promise 반환)
 * @param {Array}    deps   - useEffect 의존성 배열 (변경 시 재요청)
 *
 * 사용 예시:
 *   const { data: products, loading, error, refetch } = useApi(
 *     () => productApi.getProducts(), []
 *   );
 */
function useApi(apiFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      // axios 응답이면 .data 를 꺼내고, 일반 값이면 그대로 사용
      setData(result?.data !== undefined ? result.data : result);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        '요청 처리 중 오류가 발생했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

export default useApi;

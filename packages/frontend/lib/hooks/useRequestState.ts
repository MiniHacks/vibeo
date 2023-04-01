import { Dispatch, SetStateAction, useCallback, useState } from "react";

export type State<Data, ErrorType> =
  | {
      data: Data;
      loading: false;
      success: true;
      error?: ErrorType;
    }
  | {
      data: undefined;
      loading: true;
      success: false;
      error?: ErrorType;
    }
  | {
      data: undefined;
      loading: false;
      success: false;
      error?: ErrorType;
    };

export type UseRequestStateType<Data, ErrorType> = {
  state: State<Data, ErrorType>;
  setState: Dispatch<SetStateAction<State<Data, ErrorType>>>;
  setLoading: (loading: boolean) => void;
  setData: (data: Data) => void;
  setError: (error: ErrorType) => void;
};

/**
 * @name useRequestState
 */
export function useRequestState<Data = unknown, ErrorType = unknown>(): UseRequestStateType<Data, ErrorType> {
  const [state, setState] = useState<State<Data, ErrorType>>({
    loading: false,
    success: false,
    error: undefined,
    data: undefined,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState({
      loading,
      success: false,
      data: undefined,
      error: undefined,
    });
  }, []);

  const setData = useCallback((data: Data) => {
    setState({
      data,
      success: true,
      loading: false,
      error: undefined,
    });
  }, []);

  const setError = useCallback((error: ErrorType) => {
    setState({
      data: undefined,
      loading: false,
      success: false,
      error,
    });
  }, []);

  return {
    state,
    setState,
    setLoading,
    setData,
    setError,
  };
}

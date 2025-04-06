/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react'
import { IAPIKeys } from './index'
import api from './index'
import { RequestConfig } from './request';
export const useRequest = (url: IAPIKeys, params: { [x: string]: any }, requestConfig?: RequestConfig) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState(null)
    const request = async (params: { [x: string]: any }, requestConfig?: RequestConfig) => {
        setLoading(true);
        const result = await api[url](params, requestConfig);
        setResponse(result);
        setLoading(false);
    }

    const reload = () => {
        request(requestConfig);
    }

    return {
        loading,
        data: response,
        reload,
        request
    }
}
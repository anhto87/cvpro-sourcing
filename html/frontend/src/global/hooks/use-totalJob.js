import { useState, useEffect, useCallback } from 'react';
import apis from '../helpers/apis';

export const useTotalJobs = () => {
    const [total, setTotal] = useState(0);

    const fetchData = useCallback(() => {
        apis.getTotalJob().then(data => {
            let totalJob = data?.total || 0;
            setTotal(totalJob);
        })
    }, []);

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 20000);
        return () => clearInterval(interval);
    }, [fetchData])

    return total;
}
import { ExecutionResponseType, ExecutionType, UseEcexutionsOptions } from "@workspace/types";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

export function useExecutions({ projectId, limit = 20, status, workflowId, refreshInterval = 0 }: UseEcexutionsOptions) {
    const [allExecutions, setAllExecutions] = useState<ExecutionType[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const prevFilters = useRef({ status, workflowId });

    const fetchExecutions = useCallback(async (page: number, isLoadMore: boolean = false) => {
        if (!projectId) return;
        try {
            if (!isLoadMore) {
                setError(null);
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            })

            if (status) params.append('status', status);
            if (workflowId) params.append('workflowId', workflowId);

            const apiResponse = await axios.get(`/api/projects/${projectId}/executions?${params}`)

            if (!apiResponse.data) throw new Error('Failed to fetch executions');

            const responseData: ExecutionResponseType = apiResponse.data;

            if (isLoadMore) {
                setAllExecutions(prev => [...prev, ...responseData.executions]);
            } else {
                setAllExecutions(responseData.executions);
            }

            setHasMore(responseData.pagination.hasMore);
            setTotalCount(responseData.pagination.total);
            setCurrentPage(page);

        } catch (error) {
            console.error("Error fetching executions: ", error);
            setError("Failed to load Executions");
            if (!isLoadMore) setAllExecutions([]);

        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [projectId, limit, status, workflowId]);

    // reset data when execution changes
    useEffect(() => {
        const isFiltersChanged = prevFilters.current.status !== status || prevFilters.current.workflowId !== workflowId;
        if (isFiltersChanged) {
            setAllExecutions([]);
            setCurrentPage(1);
            setHasMore(true);
            prevFilters.current = { status, workflowId };
        }
    }, [status, workflowId]);

    // initial fetch
    useEffect(() => {
        setLoading(true);
        fetchExecutions(1, false);
    }, [fetchExecutions]);

    // autorefresh for running executions
    useEffect(() => {
        if (refreshInterval <= 0) return;

        const interval = setInterval(() => {
            const hasRunningExecutions = allExecutions.some((exec) => exec.status === "RUNNING" || exec.status === "STARTING")

            if (hasRunningExecutions) fetchExecutions(1, false);
        }, refreshInterval);

        return () => clearInterval(interval);
    }, []);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchExecutions(currentPage + 1, true);
        }
    }, [loadingMore, hasMore, currentPage, fetchExecutions]);

    const refetch = useCallback(() => {
        setAllExecutions([]);
        setCurrentPage(1);
        setHasMore(true);
        fetchExecutions(1, false);
    }, [fetchExecutions]);

    return {
        executions: allExecutions,
        loading,
        loadingMore,
        error,
        hasMore,
        totalCount,
        loadMore,
        refetch
    }
}
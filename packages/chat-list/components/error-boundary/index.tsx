import React, { useEffect } from 'react';
import { ErrorBoundary } from "react-error-boundary";
import { logEvent } from 'chat-list/service/log';
export interface ErrorWarperProps {
    children?: React.ReactNode;
    fallback?: string | React.ReactNode;
}

export default React.memo(function ErrorWraper(props: ErrorWarperProps) {
    const { children, fallback } = props;
    function fallbackRender({ error, resetErrorBoundary }: any) {
        if (fallback) {
            return fallback;
        }
        logEvent('exception', { message: error.message });
        return (
            <div className={`p-3`} role="alert">
                <p>Sorry, something went wrong:</p>
                <pre style={{ color: "red" }}>{error.message}</pre>
            </div>
        );
    }
    // useEffect(()=>{

    // },[children])
    return (
        <ErrorBoundary fallbackRender={fallbackRender} >
            {children}
        </ErrorBoundary>
    );
}); 
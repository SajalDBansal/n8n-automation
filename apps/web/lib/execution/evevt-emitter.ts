import { EventEmitter } from "events";

const executionEmitter = new EventEmitter();
executionEmitter.setMaxListeners(0);

const executionEventName = (executionId: string) => `execution:${executionId}`;

export const publishExecutionEvent = async (executionId: string, payload: Record<string, unknown>) => {
    executionEmitter.emit(executionEventName(executionId), JSON.stringify(payload));
}

export const subscribeExecutionEvents = (executionId: string, callback: (message: string) => void) => {
    const eventName = executionEventName(executionId);
    executionEmitter.on(eventName, callback);
    return () => {
        executionEmitter.off(eventName, callback);
    }
}
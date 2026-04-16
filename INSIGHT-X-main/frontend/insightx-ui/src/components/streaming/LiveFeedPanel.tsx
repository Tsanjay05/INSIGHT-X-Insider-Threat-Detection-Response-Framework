import { useState, useEffect } from 'react';
import { Activity, Pause, Play } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatTimestamp, getRiskLevelColor, getControlStatusColor } from '../../lib/utils';

interface LiveFeedProps {
    streamUrl: string;
    title: string;
    eventType: 'trust' | 'control' | 'provenance';
}

export function LiveFeedPanel({ streamUrl, title, eventType }: LiveFeedProps) {
    const [events, setEvents] = useState<any[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);

    useEffect(() => {
        if (isPaused || !streamUrl) return;

        const es = new EventSource(streamUrl);

        es.onopen = () => {
            setIsConnected(true);
        };

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setEvents(prev => [data, ...prev].slice(0, 50)); // Keep last 50 events
            } catch (error) {
                console.error('Failed to parse SSE event:', error);
            }
        };

        es.onerror = () => {
            setIsConnected(false);
            es.close();
        };

        setEventSource(es);

        return () => {
            es.close();
        };
    }, [streamUrl, isPaused]);

    const togglePause = () => {
        setIsPaused(prev => !prev);
        if (eventSource && !isPaused) {
            eventSource.close();
            setEventSource(null);
            setIsConnected(false);
        }
    };

    const renderEvent = (event: any, index: number) => {
        switch (eventType) {
            case 'trust':
                return (
                    <div key={index} className="p-3 rounded-md border border-border-subtle hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs text-text-tertiary">{event.decisionId?.slice(0, 12)}</span>
                            <Badge className={getRiskLevelColor(event.riskLevel || 'LOW')}>
                                {event.riskLevel || 'LOW'}
                            </Badge>
                        </div>
                        <div className="text-sm">
                            <p className="text-text-primary font-medium">{event.entityId}</p>
                            <p className="text-xs text-text-tertiary mt-1">
                                Score: <span className="text-text-primary font-semibold">{event.finalScore?.value || 0}</span>
                            </p>
                        </div>
                    </div>
                );

            case 'control':
                return (
                    <div key={index} className="p-3 rounded-md border border-border-subtle hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs text-text-tertiary">{event.controlId?.slice(0, 12)}</span>
                            <Badge className={getControlStatusColor(event.status || 'ACTIVE')}>
                                {event.status || 'ACTIVE'}
                            </Badge>
                        </div>
                        <div className="text-sm">
                            <p className="text-text-primary font-medium">{event.entityId}</p>
                            <p className="text-xs text-text-tertiary mt-1">{event.controlType?.replace(/_/g, ' ')}</p>
                        </div>
                    </div>
                );

            case 'provenance':
                return (
                    <div key={index} className="p-3 rounded-md border border-border-subtle hover:bg-white/5 transition-colors">
                        <div className="font-mono text-xs text-text-tertiary mb-2">{event.decisionId?.slice(0, 12)}</div>
                        <div className="text-sm">
                            <p className="text-text-primary font-medium">{event.entityId}</p>
                            <p className="text-xs text-text-tertiary mt-1">
                                {event.decidedAt && formatTimestamp(event.decidedAt)}
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Activity className={`w-5 h-5 ${isConnected ? 'text-success-400' : 'text-neutral-500'}`} />
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                        <p className="text-xs text-text-tertiary">
                            {isConnected ? 'Live' : 'Disconnected'} • {events.length} events
                        </p>
                    </div>
                </div>
                <button
                    onClick={togglePause}
                    className="p-2 rounded-md hover:bg-white/10 transition-colors"
                    title={isPaused ? 'Resume' : 'Pause'}
                >
                    {isPaused ? (
                        <Play className="w-5 h-5 text-text-secondary" />
                    ) : (
                        <Pause className="w-5 h-5 text-text-secondary" />
                    )}
                </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {events.length === 0 ? (
                    <div className="text-center py-12 text-text-tertiary">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Waiting for events...</p>
                    </div>
                ) : (
                    events.map((event, index) => renderEvent(event, index))
                )}
            </div>
        </Card>
    );
}

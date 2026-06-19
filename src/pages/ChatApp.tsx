import { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { api } from '../services/api'

/* ─────────────────────────────────────────────────────────── types */
type Message = {
    id: string;
    role: 'user' | 'assistant';
    parts: { type: 'text'; text: string }[];
    steps?: AgentStep[];
};

type AgentStep = {
    id: string;
    type: 'rag_search' | 'web_search' | 'thinking';
    status: 'running' | 'done' | 'error';
    label: string;
    detail?: string;
    ragas?: {
        score: number;
        context_precision: number;
        faithfulness: number;
        verdict: string;
    };
};

/* ─────────────────────────────────────────────────────────── step icons */
function StepIcon({ type, status }: { type: AgentStep['type']; status: AgentStep['status'] }) {
    if (status === 'running') {
        return (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full">
                <svg className="animate-spin w-4 h-4 text-accent-light" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            </span>
        );
    }
    if (status === 'error') {
        return <span className="text-danger text-sm">✗</span>;
    }
    if (type === 'rag_search') return <span className="text-success text-sm">📚</span>;
    if (type === 'web_search') return <span className="text-accent-light text-sm">🌐</span>;
    return <span className="text-success text-sm">✓</span>;
}

/* ─────────────────────────────────────────────────────────── RAG Evaluation badge */
function RagEvalBadge({ ragas }: { ragas: NonNullable<AgentStep['ragas']> }) {
    const pct      = Math.round(ragas.score * 100);
    const isStrong = ragas.score >= 0.7;
    const isOk     = ragas.score >= 0.5;
    const color    = isStrong
        ? 'text-success border-success/30 bg-success/10'
        : isOk
            ? 'text-warning border-warning/30 bg-warning/10'
            : 'text-danger border-danger/30 bg-danger/10';
    const icon  = isStrong ? '✦' : isOk ? '◈' : '⚠';
    const quality = isStrong ? 'Strong' : isOk ? 'Adequate' : 'Weak';

    return (
        <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold tracking-wide ${color}`}>
                <span>{icon}</span>
                <span>RAG Evaluation Score · {quality} · {pct}%</span>
            </span>
            <span className="text-[10px] text-muted-2">
                Precision&nbsp;<span className="text-muted">{Math.round(ragas.context_precision * 100)}%</span>
                &nbsp;·&nbsp;
                Faithfulness&nbsp;<span className="text-muted">{Math.round(ragas.faithfulness * 100)}%</span>
            </span>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── research panel */
function ResearchPanel({ steps }: { steps: AgentStep[] }) {
    const [collapsed, setCollapsed] = useState(false);
    const isRunning = steps.some(s => s.status === 'running');

    if (steps.length === 0) return null;

    return (
        <div className="mb-3 rounded-2xl border border-subtle bg-surface-2/80 backdrop-blur-sm overflow-hidden text-sm shadow-card">
            <button
                onClick={() => setCollapsed(c => !c)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
            >
                {isRunning ? (
                    <svg className="animate-spin w-3.5 h-3.5 text-accent-light flex-shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                ) : (
                    <span className="text-accent-light text-xs flex-shrink-0">✦</span>
                )}
                <span className="text-muted font-medium text-xs flex-1">
                    {isRunning ? 'Deep researching…' : `Research complete · ${steps.length} step${steps.length !== 1 ? 's' : ''}`}
                </span>
                <span className="text-muted-2 text-xs">{collapsed ? '▸' : '▾'}</span>
            </button>

            {!collapsed && (
                <div className="px-4 pb-4 space-y-3 border-t border-subtle/40">
                    {steps.map(step => (
                        <div key={step.id} className="flex items-start gap-3 pt-3">
                            <div className="mt-0.5 flex-shrink-0 w-5 flex justify-center">
                                <StepIcon type={step.type} status={step.status} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-primary/90 text-xs font-medium">{step.label}</p>
                                {step.detail && (
                                    <p className="text-muted text-[11px] mt-0.5 leading-relaxed">{step.detail}</p>
                                )}
                                {step.type === 'rag_search' && step.status === 'done' && step.ragas && (
                                    <RagEvalBadge ragas={step.ragas} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── cursor */
function BlinkingCursor() {
    return <span className="inline-block w-0.5 h-4 bg-accent-light ml-0.5 align-middle animate-pulse" />;
}

/* ─────────────────────────────────────────────────────────── markdown */
const MarkdownComponents = {
    code({ className, children }: any) {
        const language = className?.replace('language-', '') || 'text'
        return (
            <SyntaxHighlighter style={oneDark} language={language} PreTag="div">
                {String(children).trim()}
            </SyntaxHighlighter>
        )
    },
    p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
    strong: ({ children }: any) => <strong className="font-semibold text-white">{children}</strong>,
    h1: ({ children }: any) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-base font-bold text-white mb-2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-sm font-bold text-white mb-1">{children}</h3>,
}

/* ─────────────────────────────────────────────────────────── main */
export default function ChatApp({ onMenuOpen }: { onMenuOpen?: () => void }) {
    const { subjectId } = useParams<{ subjectId: string }>();
    const [searchParams] = useSearchParams();
    const chapterId = searchParams.get('chapterId');
    const subjectName  = searchParams.get('subjectName') ?? 'Subject';
    const chapterName  = searchParams.get('chapterName') ?? null;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'ready' | 'thinking'>('ready');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatIdRef = useRef<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /* init chat session */
    useEffect(() => {
        setMessages([]);
        chatIdRef.current = null;

        const initChat = async () => {
            try {
                if (!subjectId) return;

                const params = new URLSearchParams();
                if (subjectId) params.append('subjectId', subjectId);
                if (chapterId && chapterId !== 'null') params.append('chapterId', chapterId);

                const { data: existingData } = await api.get(`/chats/get-all?${params.toString()}`);

                if (existingData?.data?.length > 0) {
                    const currentChatId = existingData.data[0]._id;
                    chatIdRef.current = currentChatId;
                    const { data: messagesData } = await api.get(`/chats/${currentChatId}/messages`);
                    if (messagesData?.data?.length > 0) {
                        const loaded: Message[] = messagesData.data.map((msg: any) => ({
                            id: msg._id,
                            role: msg.role as 'user' | 'assistant',
                            parts: [{ type: 'text', text: msg.content }],
                            steps: [],
                        }));
                        setMessages(loaded);
                    }
                } else {
                    const { data } = await api.post('/chats/create', {
                        subjectId,
                        chapterId: chapterId && chapterId !== 'null' ? chapterId : null,
                    });
                    chatIdRef.current = data.data._id;
                }
            } catch (err) {
                console.error('Failed to initialize chat session:', err);
            }
        };
        initChat();
    }, [subjectId, chapterId]);

    /* auto scroll */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: status === 'thinking' ? 'auto' : 'smooth' });
    }, [messages, status]);

    /* auto-grow textarea */
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [input]);

    const saveMessageToDB = async (role: 'user' | 'assistant', content: string) => {
        if (!chatIdRef.current) return;
        try {
            await api.post(`/chats/${chatIdRef.current}/message`, { role, content });
        } catch (err) {
            console.error(`Failed to save ${role} message:`, err);
        }
    };

    const updateSteps = (msgId: string, updater: (prev: AgentStep[]) => AgentStep[]) => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, steps: updater(m.steps ?? []) } : m));
    };

    const updateText = (msgId: string, text: string) => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, parts: [{ type: 'text', text }] } : m));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || status !== 'ready') return;

        const text = input.trim();
        setInput('');

        const userMsg: Message = { id: Date.now().toString(), role: 'user', parts: [{ type: 'text', text }] };
        const aiMsgId = (Date.now() + 1).toString();
        const aiMsg: Message = { id: aiMsgId, role: 'assistant', parts: [{ type: 'text', text: '' }], steps: [] };

        setMessages(prev => [...prev, userMsg, aiMsg]);
        setStatus('thinking');
        saveMessageToDB('user', text);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const AI_URL = import.meta.env.VITE_AI_URL;
            const res = await fetch(`${AI_URL}/chat`, {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    query: text,
                    subject: subjectId,
                    chapter: chapterId && chapterId !== 'null' ? chapterId : null,
                    messages: messages.map(m => ({ role: m.role, content: m.parts[0].text })),
                }),
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(`Server error ${res.status}: ${err}`);
            }

            const reader = res.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let streamedText = '';
            const stepMap = new Map<string, string>();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data:')) continue;
                    const raw = line.slice(5).trim();
                    if (!raw) continue;

                    let event: any;
                    try { event = JSON.parse(raw); } catch { continue; }

                    switch (event.type) {

                        case 'tool_call': {
                            const tool = event.tool as AgentStep['type'];
                            const label =
                                tool === 'rag_search' ? `Searching your notes for "${event.query}"` :
                                    tool === 'web_search' ? `Web searching for "${event.query}"` :
                                        `Running ${tool}…`;
                            const stepId = `${tool}-${Date.now()}`;
                            stepMap.set(tool, stepId);
                            updateSteps(aiMsgId, prev => [
                                ...prev,
                                { id: stepId, type: tool, status: 'running', label },
                            ]);
                            break;
                        }

                        case 'tool_result': {
                            const tool = event.tool as string;
                            const stepId = stepMap.get(tool);
                            if (!stepId) break;
                            let detail = '';
                            if (tool === 'rag_search') {
                                detail = event.has_context
                                    ? `Found ${event.hits} relevant chunk${event.hits !== 1 ? 's' : ''} in your documents`
                                    : 'No matching content found in your documents';
                            } else if (tool === 'web_search') {
                                detail = `Retrieved ${event.results} web result${event.results !== 1 ? 's' : ''}`;
                            }
                            updateSteps(aiMsgId, prev =>
                                prev.map(s => {
                                    if (s.id !== stepId) return s;
                                    const updated: AgentStep = { ...s, status: 'done', detail };
                                    if (tool === 'rag_search' && typeof event.ragas_score === 'number') {
                                        updated.ragas = {
                                            score: event.ragas_score,
                                            context_precision: event.ragas_context_precision ?? 0,
                                            faithfulness: event.ragas_faithfulness ?? 0,
                                            verdict: event.ragas_verdict ?? '',
                                        };
                                    }
                                    return updated;
                                })
                            );
                            break;
                        }

                        case 'token': {
                            streamedText += event.content;
                            updateText(aiMsgId, streamedText);
                            break;
                        }

                        case 'done': {
                            const finalText = event.full_text || streamedText;
                            updateText(aiMsgId, finalText);
                            saveMessageToDB('assistant', finalText);
                            updateSteps(aiMsgId, prev =>
                                prev.map(s => s.status === 'running' ? { ...s, status: 'done', detail: s.detail || 'Completed' } : s)
                            );
                            window.dispatchEvent(new Event('tokens-updated'));
                            break;
                        }

                        case 'error': {
                            updateText(aiMsgId, `⚠ Error: ${event.detail}`);
                            updateSteps(aiMsgId, prev =>
                                prev.map(s => s.status === 'running' ? { ...s, status: 'error' } : s)
                            );
                            break;
                        }
                    }
                }
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Chat error:', err);
                updateText(aiMsgId, 'Sorry, there was an error connecting to the server.');
                updateSteps(aiMsgId, prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error' } : s));
            }
        } finally {
            setStatus('ready');
            abortRef.current = null;
        }
    };

    /* handle Enter to submit, Shift+Enter for newline */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const isStreaming = status === 'thinking';

    return (
        <div className="min-h-screen bg-base flex flex-col font-sans text-primary" style={{ backgroundImage: 'radial-gradient(at 60% 0%, rgba(124,58,237,0.08) 0px, transparent 55%)' }}>

            {/* ── Header */}
            <header className="border-b border-subtle/60 bg-surface/80 backdrop-blur-xl px-4 sm:px-6 py-0 sticky top-0 z-20 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                <div className="max-w-3xl mx-auto flex items-center h-14 gap-2">
                    {/* Mobile hamburger */}
                    <button
                        onClick={onMenuOpen}
                        className="md:hidden flex-shrink-0 p-2 rounded-lg text-muted hover:text-primary hover:bg-base transition-colors"
                        aria-label="Open menu"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Left — logo (hidden on mobile to save space) */}
                    <div className="hidden sm:flex items-center gap-2.5 w-36">
                        <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center shadow-glow-sm">
                            <span className="text-accent-light text-xs">✦</span>
                        </div>
                        <span className="text-white font-semibold text-sm tracking-tight">StudyBot</span>
                    </div>

                    {/* Centre — subject / chapter breadcrumb */}
                    <div className="flex-1 flex flex-col items-center justify-center leading-tight min-w-0">
                        <span className="text-white font-semibold text-sm tracking-tight truncate max-w-full">{subjectName}</span>
                        {chapterName && chapterName !== 'null' && (
                            <span className="text-muted text-[11px] mt-0.5 truncate max-w-full">Ch: {chapterName}</span>
                        )}
                    </div>

                    {/* Right — status pill */}
                    <div className="flex-shrink-0 flex justify-end">
                        {isStreaming && (
                            <div className="flex items-center gap-1.5 text-[11px] text-accent-light bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
                                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                <span className="hidden xs:inline">Thinking…</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Messages */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted gap-4 py-24">
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl shadow-glow-md">✦</div>
                        <div className="text-center space-y-1">
                            <p className="text-white font-medium text-sm">Ask anything about your notes</p>
                            <p className="text-muted text-xs">{subjectName}{chapterName && chapterName !== 'null' ? ` · ${chapterName}` : ''}</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto w-full space-y-6">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} animate-fade-up`}
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <span className="text-[11px] font-medium text-muted-2 mb-1.5 px-1">
                                    {message.role === 'user' ? 'You' : 'StudyBot'}
                                </span>

                                {message.role === 'assistant' && message.steps && message.steps.length > 0 && (
                                    <div className="w-full">
                                        <ResearchPanel steps={message.steps} />
                                    </div>
                                )}

                                <div
                                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                        message.role === 'user'
                                            ? 'bg-accent text-white rounded-br-sm max-w-[80%] shadow-glow-sm'
                                            : 'bg-surface-2 border border-subtle/60 text-primary rounded-bl-sm w-full max-w-full shadow-card'
                                    }`}
                                >
                                    {message.role === 'user' ? (
                                        <span>{message.parts[0].text}</span>
                                    ) : (
                                        <>
                                            {message.parts[0].text ? (
                                                <ReactMarkdown components={MarkdownComponents}>
                                                    {message.parts[0].text}
                                                </ReactMarkdown>
                                            ) : (
                                                status === 'thinking' && index === messages.length - 1 && (
                                                    <span className="text-muted text-xs flex items-center gap-1.5">
                                                        <svg className="animate-spin w-3 h-3 text-accent-light" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                        </svg>
                                                        Thinking…
                                                    </span>
                                                )
                                            )}
                                            {status === 'thinking' && index === messages.length - 1 && message.parts[0].text && (
                                                <BlinkingCursor />
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* ── Input */}
            <footer className="border-t border-subtle/60 bg-surface/80 backdrop-blur-xl p-4">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={status !== 'ready'}
                                placeholder="Ask me anything about your notes…"
                                className="w-full resize-none rounded-2xl bg-surface-2 border border-subtle hover:border-subtle-2 focus:border-accent/60 px-4 py-3 text-sm text-primary focus:outline-none transition-colors placeholder:text-muted-2 leading-relaxed overflow-hidden"
                                style={{ minHeight: '48px', maxHeight: '160px' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status !== 'ready' || !input.trim()}
                            className="flex-shrink-0 w-11 h-11 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-30 text-white transition-all flex items-center justify-center shadow-glow-sm hover:shadow-glow-md disabled:shadow-none"
                        >
                            {isStreaming ? (
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            )}
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-muted-2 mt-2">Press Enter to send · Shift+Enter for newline</p>
                </div>
            </footer>
        </div>
    );
}
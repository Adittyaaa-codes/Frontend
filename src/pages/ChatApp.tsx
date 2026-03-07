import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

type Message = {
    id: string;
    role: 'user' | 'assistant';
    parts: { type: 'text'; text: string }[];
};

export default function ChatApp() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'ready' | 'thinking'>('ready');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ 
            behavior: status === 'thinking' ? 'auto' : 'smooth' 
        });
    }, [messages, status]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || status !== 'ready') return;

        const text = input.trim();
        setInput('');

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            parts: [{ type: 'text', text }],
        };

        const aiMsgId = (Date.now() + 1).toString();
        const aiMsg: Message = {
            id: aiMsgId,
            role: 'assistant',
            parts: [{ type: 'text', text: '' }],
        };

        // Add user message immediately, and an empty AI message placeholder
        setMessages(prev => [...prev, userMsg, aiMsg]);
        setStatus('thinking');

        try {
            const response = await fetch('http://localhost:8000/chat/qa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: text,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.parts[0].text,
                    })),
                }),
            });

            if (!response.body) throw new Error('No stream available');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiText = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiText += chunk;

                // Update the AI message in real-time
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === aiMsgId
                            ? { ...msg, parts: [{ type: 'text', text: aiText }] }
                            : msg
                    )
                );
            }
        } catch (error) {
            console.error('Error fetching chat response:', error);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === aiMsgId
                        ? { ...msg, parts: [{ type: 'text', text: 'Sorry, there was an error connecting to the server.' }] }
                        : msg
                )
            );
        } finally {
            setStatus('ready');
        }
    };

    return (
    <div className="min-h-screen bg-base flex flex-col font-sans text-primary">
        {/* Header */}
        <header className="border-b border-subtle bg-surface px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">StudyBot Chat</h1>
            <div className="text-sm text-muted">
                {status === 'ready' ? 'Ready' : 'Thinking...'}
            </div>
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted">
                    <p className="text-sm">No messages yet. Start a conversation!</p>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto w-full space-y-6">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex flex-col max-w-[80%] ${
                                message.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                            }`}
                        >
                            <span className="text-xs font-medium text-muted mb-1.5 px-1">
                                {message.role === 'user' ? 'You' : 'StudyBot'}
                            </span>
                            <div
                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                    message.role === 'user'
                                        ? 'bg-accent text-white rounded-br-sm'
                                        : 'bg-surface border border-subtle text-primary rounded-bl-sm'
                                }`}
                            >
                                {message.parts.map((part, partIndex) =>
                                    part.type === 'text' ? (
                                        message.role === 'user' ? (
                                            <span key={partIndex}>{part.text}</span>
                                        ) : (
                                            <ReactMarkdown
                                                key={partIndex}
                                                components={{
                                                    code({ className, children }) {
                                                        const language = className?.replace('language-', '') || 'text'
                                                        return (
                                                            <SyntaxHighlighter style={oneDark} language={language} PreTag="div">
                                                                {String(children).trim()}
                                                            </SyntaxHighlighter>
                                                        )
                                                    },
                                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                                    h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
                                                    h2: ({ children }) => <h2 className="text-base font-bold text-white mb-2">{children}</h2>,
                                                    h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-1">{children}</h3>,
                                                }}
                                            >
                                                {part.text}
                                            </ReactMarkdown>
                                        )
                                    ) : null
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </main>

        {/* Input Area */}
        <footer className="border-t border-subtle bg-surface p-4">
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={status !== 'ready'}
                        placeholder="Ask me anything about your notes..."
                        className="flex-1 rounded-xl bg-base border border-subtle px-4 py-3 text-sm text-primary focus:border-accent outline-none transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={status !== 'ready' || !input.trim()}
                        className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium transition-colors"
                    >
                        Send
                    </button>
                </form>
            </div>
        </footer>
    </div>
)
}
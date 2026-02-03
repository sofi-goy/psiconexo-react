"use client";
import { Bold, Italic, List, Quote, Heading1, Heading2 } from 'lucide-react';

type Props = {
    onFormat: (format: string) => void;
};

export function NoteToolbar({ onFormat }: Props) {
    const tools = [
        { id: 'bold', icon: <Bold size={18} />, title: 'Negrita' },
        { id: 'italic', icon: <Italic size={18} />, title: 'Cursiva' },
        { id: 'divider1', type: 'divider' },
        { id: 'bullet', icon: <List size={18} />, title: 'Lista' },
        { id: 'quote', icon: <Quote size={18} />, title: 'Cita' },
        { id: 'divider2', type: 'divider' },
        { id: 'h1', icon: <Heading1 size={18} />, title: 'Título' },
        { id: 'h2', icon: <Heading2 size={18} />, title: 'Subtítulo' },
    ];

    return (
        <div className="editor-toolbar">
            {tools.map(tool =>
                tool.type === 'divider' ? (
                    <div key={tool.id} className="toolbar-divider" />
                ) : (
                    <button
                        key={tool.id}
                        className="toolbar-btn"
                        title={tool.title}
                        onClick={() => onFormat(tool.id)}
                    >
                        {tool.icon}
                    </button>
                )
            )}
        </div>
    );
}

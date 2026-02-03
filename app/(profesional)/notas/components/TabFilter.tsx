"use client";
import { FileEdit, CheckCircle, List } from 'lucide-react';

export type TabType = 'drafts' | 'signed' | 'all';

type Props = {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    counts: {
        drafts: number;
        signed: number;
        all: number;
    };
};

export function TabFilter({ activeTab, onTabChange, counts }: Props) {
    const tabs: { id: TabType; label: string; icon: React.ReactNode; count: number }[] = [
        { id: 'drafts', label: 'Borradores', icon: <FileEdit size={16} />, count: counts.drafts },
        { id: 'signed', label: 'Firmadas', icon: <CheckCircle size={16} />, count: counts.signed },
        { id: 'all', label: 'Todas', icon: <List size={16} />, count: counts.all },
    ];

    return (
        <div className="tabs-container">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.icon}
                    {tab.label}
                    <span className="tab-count">{tab.count}</span>
                </button>
            ))}
        </div>
    );
}

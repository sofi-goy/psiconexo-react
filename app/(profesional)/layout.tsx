"use client";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ProfesionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-bg)' }}>
            <Sidebar />
            {children}
        </div>
    );
}

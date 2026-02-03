"use client";
import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

type Props = {
    message: string;
    isVisible: boolean;
    onHide: () => void;
    duration?: number;
};

export function Toast({ message, isVisible, onHide, duration = 3000 }: Props) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onHide();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onHide]);

    if (!isVisible) return null;

    return (
        <div className="toast">
            <CheckCircle size={18} />
            <span>{message}</span>
        </div>
    );
}

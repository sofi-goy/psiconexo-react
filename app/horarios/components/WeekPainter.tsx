"use client";
import { useState, useCallback, useRef, useEffect } from 'react';
import { Calendar, Trash2 } from 'lucide-react';

type TimeBlock = {
    day_of_week: number;
    start_time: string;
    end_time: string;
};

type Props = {
    blocks: TimeBlock[];
    onChange: (blocks: TimeBlock[]) => void;
};

const DAYS = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
    { value: 7, label: 'Dom' },
];

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

export function WeekPainter({ blocks, onChange }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState<'add' | 'remove' | null>(null);
    const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null);
    const [dragEnd, setDragEnd] = useState<{ day: number; hour: number } | null>(null);

    // Check if a cell is part of an existing block
    const isSlotOccupied = useCallback((day: number, hour: number): boolean => {
        return blocks.some(block => {
            if (block.day_of_week !== day) return false;
            const [startH] = block.start_time.split(':').map(Number);
            const [endH] = block.end_time.split(':').map(Number);
            return hour >= startH && hour < endH;
        });
    }, [blocks]);

    // Check if a cell is in current drag selection
    const isInDragSelection = useCallback((day: number, hour: number): boolean => {
        if (!dragStart || !dragEnd) return false;
        if (dragStart.day !== dragEnd.day || day !== dragStart.day) return false;
        const minHour = Math.min(dragStart.hour, dragEnd.hour);
        const maxHour = Math.max(dragStart.hour, dragEnd.hour);
        return hour >= minHour && hour <= maxHour;
    }, [dragStart, dragEnd]);

    const handleMouseDown = (day: number, hour: number) => {
        const occupied = isSlotOccupied(day, hour);
        setIsDragging(true);
        setDragMode(occupied ? 'remove' : 'add');
        setDragStart({ day, hour });
        setDragEnd({ day, hour });
    };

    const handleMouseEnter = (day: number, hour: number) => {
        if (!isDragging || !dragStart) return;
        // Only allow vertical drag within same day
        if (day === dragStart.day) {
            setDragEnd({ day, hour });
        }
    };

    const handleMouseUp = () => {
        if (isDragging && dragStart && dragEnd && dragStart.day === dragEnd.day && dragMode) {
            const minHour = Math.min(dragStart.hour, dragEnd.hour);
            const maxHour = Math.max(dragStart.hour, dragEnd.hour);
            const day = dragStart.day;

            if (dragMode === 'add') {
                // Add new block
                const newBlock: TimeBlock = {
                    day_of_week: day,
                    start_time: `${minHour.toString().padStart(2, '0')}:00`,
                    end_time: `${(maxHour + 1).toString().padStart(2, '0')}:00`,
                };

                // Merge overlapping blocks for same day
                const dayBlocks = blocks.filter(b => b.day_of_week === day);
                const otherBlocks = blocks.filter(b => b.day_of_week !== day);

                let mergedBlocks = [...dayBlocks, newBlock];
                mergedBlocks.sort((a, b) => a.start_time.localeCompare(b.start_time));
                const finalDayBlocks: TimeBlock[] = [];

                for (const block of mergedBlocks) {
                    if (finalDayBlocks.length === 0) {
                        finalDayBlocks.push({ ...block });
                    } else {
                        const last = finalDayBlocks[finalDayBlocks.length - 1];
                        const [lastEndH] = last.end_time.split(':').map(Number);
                        const [blockStartH] = block.start_time.split(':').map(Number);

                        if (blockStartH <= lastEndH) {
                            const [blockEndH] = block.end_time.split(':').map(Number);
                            last.end_time = `${Math.max(lastEndH, blockEndH).toString().padStart(2, '0')}:00`;
                        } else {
                            finalDayBlocks.push({ ...block });
                        }
                    }
                }

                onChange([...otherBlocks, ...finalDayBlocks]);
            } else {
                // Remove selection from existing blocks
                const newBlocks: TimeBlock[] = [];

                for (const block of blocks) {
                    if (block.day_of_week !== day) {
                        newBlocks.push(block);
                        continue;
                    }

                    const [blockStartH] = block.start_time.split(':').map(Number);
                    const [blockEndH] = block.end_time.split(':').map(Number);

                    // Check if selection overlaps with this block
                    if (maxHour < blockStartH || minHour >= blockEndH) {
                        // No overlap
                        newBlocks.push(block);
                    } else {
                        // There's overlap - need to split/trim
                        // Part before selection
                        if (blockStartH < minHour) {
                            newBlocks.push({
                                day_of_week: day,
                                start_time: block.start_time,
                                end_time: `${minHour.toString().padStart(2, '0')}:00`,
                            });
                        }
                        // Part after selection
                        if (blockEndH > maxHour + 1) {
                            newBlocks.push({
                                day_of_week: day,
                                start_time: `${(maxHour + 1).toString().padStart(2, '0')}:00`,
                                end_time: block.end_time,
                            });
                        }
                    }
                }

                onChange(newBlocks);
            }
        }

        setIsDragging(false);
        setDragMode(null);
        setDragStart(null);
        setDragEnd(null);
    };

    // Add global mouse up listener
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                handleMouseUp();
            }
        };
        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging, dragStart, dragEnd, dragMode, blocks]);

    const clearAll = () => {
        onChange([]);
    };

    return (
        <div className="agenda-card">
            <div className="agenda-card-header">
                <Calendar size={20} />
                <h3>Estructura Semanal</h3>
                {blocks.length > 0 && (
                    <button
                        className="btn-clear-all"
                        onClick={clearAll}
                        title="Limpiar todo"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            <p className="painter-hint">
                Arrastra para pintar o borrar bloques de disponibilidad
            </p>

            <div
                className="week-grid"
                onMouseLeave={() => {
                    if (isDragging) {
                        handleMouseUp();
                    }
                }}
            >
                {/* Header: Day labels */}
                <div className="week-grid-header">
                    <div className="time-column-header"></div>
                    {DAYS.map(day => (
                        <div key={day.value} className="day-header">
                            {day.label}
                        </div>
                    ))}
                </div>

                {/* Body: Hours grid */}
                <div className="week-grid-body">
                    {HOURS.map(hour => (
                        <div key={hour} className="hour-row">
                            <div className="time-label">
                                {hour.toString().padStart(2, '0')}:00
                            </div>
                            {DAYS.map(day => {
                                const occupied = isSlotOccupied(day.value, hour);
                                const inSelection = isInDragSelection(day.value, hour);
                                const isRemoving = inSelection && dragMode === 'remove';
                                const isAdding = inSelection && dragMode === 'add';

                                return (
                                    <div
                                        key={`${day.value}-${hour}`}
                                        className={`grid-cell ${occupied ? 'occupied' : ''} ${isAdding ? 'selecting' : ''} ${isRemoving ? 'removing' : ''}`}
                                        onMouseDown={() => handleMouseDown(day.value, hour)}
                                        onMouseEnter={() => handleMouseEnter(day.value, hour)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary of blocks */}
            {blocks.length > 0 && (
                <div className="blocks-summary">
                    {DAYS.map(day => {
                        const dayBlocks = blocks.filter(b => b.day_of_week === day.value);
                        if (dayBlocks.length === 0) return null;
                        return (
                            <div key={day.value} className="day-summary">
                                <span className="day-name">{day.label}</span>
                                {dayBlocks.map((block, i) => (
                                    <span key={i} className="block-pill">
                                        {block.start_time} - {block.end_time}
                                    </span>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

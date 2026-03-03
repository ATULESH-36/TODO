import { useState } from 'react';
import {
    Plus,
    CheckCircle2,
    Circle,
    Calendar,
    ChevronRight,
    ListChecks,
} from 'lucide-react';

const TAG_COLORS = {
    urgent: { bg: 'bg-tag-red', text: 'text-tag-text-red' },
    design: { bg: 'bg-tag-purple', text: 'text-tag-text-purple' },
    bug: { bg: 'bg-tag-orange', text: 'text-tag-text-orange' },
    meeting: { bg: 'bg-tag-blue', text: 'text-tag-text-blue' },
    shopping: { bg: 'bg-tag-green', text: 'text-tag-text-green' },
    reading: { bg: 'bg-tag-purple', text: 'text-tag-text-purple' },
    travel: { bg: 'bg-tag-blue', text: 'text-tag-text-blue' },
    personal: { bg: 'bg-tag-green', text: 'text-tag-text-green' },
    'self-improvement': { bg: 'bg-tag-orange', text: 'text-tag-text-orange' },
};

const DEFAULT_TAG = { bg: 'bg-tag-blue', text: 'text-tag-text-blue' };

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = d - today;
    const dayMs = 86400000;
    if (diff === 0) return 'Today';
    if (diff === dayMs) return 'Tomorrow';
    if (diff === -dayMs) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TaskList({
    tasks,
    selectedTaskId,
    onSelectTask,
    onToggleComplete,
    onCreateTask,
    activeListName,
    taskCount,
}) {
    const [newTitle, setNewTitle] = useState('');

    const handleAdd = () => {
        if (newTitle.trim()) {
            onCreateTask(newTitle.trim());
            setNewTitle('');
        }
    };

    return (
        <div className="flex-1 min-w-[360px] h-screen flex flex-col bg-surface border-r border-border">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-text-primary">{activeListName}</h1>
                        <span className="text-xs font-semibold px-2 py-1 bg-accent-light text-accent rounded-full">
                            {taskCount}
                        </span>
                    </div>
                </div>

                {/* Add task */}
                <div className="flex items-center gap-3 p-3 bg-panel rounded-xl border border-border-light hover:border-accent/30 transition-smooth group">
                    <Plus className="w-5 h-5 text-text-tertiary group-hover:text-accent transition-smooth" />
                    <input
                        type="text"
                        placeholder="Add a new task..."
                        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    {newTitle.trim() && (
                        <button
                            onClick={handleAdd}
                            className="px-3 py-1 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-smooth cursor-pointer"
                        >
                            Add
                        </button>
                    )}
                </div>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
                        <ListChecks className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm font-medium">No tasks yet</p>
                        <p className="text-xs mt-1">Add your first task above</p>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {tasks.map((task) => {
                            const isSelected = task.id === selectedTaskId;
                            const subtaskDone = (task.subtasks || []).filter((s) => s.completed).length;
                            const subtaskTotal = (task.subtasks || []).length;
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => onSelectTask(task.id)}
                                    className={`group flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-smooth ${isSelected
                                        ? 'bg-accent-light/50 border-accent/20 shadow-sm'
                                        : 'bg-white border-border-light hover:border-border hover:shadow-sm'
                                        }`}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleComplete(task.id, !task.completed);
                                        }}
                                        className="mt-0.5 flex-shrink-0 cursor-pointer"
                                    >
                                        {task.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-success" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-border hover:text-accent transition-smooth" />
                                        )}
                                    </button>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm font-medium leading-snug ${task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                                                }`}
                                        >
                                            {task.title}
                                        </p>

                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            {task.due_date && (
                                                <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(task.due_date)}
                                                </span>
                                            )}
                                            {subtaskTotal > 0 && (
                                                <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
                                                    <ListChecks className="w-3 h-3" />
                                                    {subtaskDone}/{subtaskTotal}
                                                </span>
                                            )}
                                            {(task.tags || []).slice(0, 2).map((tag) => {
                                                const c = TAG_COLORS[tag] || DEFAULT_TAG;
                                                return (
                                                    <span
                                                        key={tag}
                                                        className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${c.bg} ${c.text}`}
                                                    >
                                                        {tag}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <ChevronRight
                                        className={`w-4 h-4 mt-1 flex-shrink-0 transition-smooth ${isSelected ? 'text-accent' : 'text-border-light group-hover:text-text-tertiary'
                                            }`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

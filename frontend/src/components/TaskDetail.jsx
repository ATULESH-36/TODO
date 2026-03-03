import { useState, useEffect } from 'react';
import {
    X,
    Trash2,
    Save,
    Plus,
    CheckSquare,
    Square,
    Calendar,
    List,
    Tag,
    AlignLeft,
    Type,
} from 'lucide-react';

export default function TaskDetail({ task, lists, onSave, onDelete, onClose }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        due_date: '',
        list_id: '',
        tags: [],
        subtasks: [],
    });
    const [newTag, setNewTag] = useState('');
    const [newSubtask, setNewSubtask] = useState('');

    useEffect(() => {
        if (task) {
            setForm({
                title: task.title || '',
                description: task.description || '',
                due_date: task.due_date || '',
                list_id: task.list_id || '',
                tags: [...(task.tags || [])],
                subtasks: (task.subtasks || []).map((s) => ({ ...s })),
            });
        }
    }, [task]);

    if (!task) {
        return (
            <div className="w-[340px] h-screen bg-panel border-l border-border flex items-center justify-center shrink-0">
                <div className="text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-border-light mx-auto mb-4 flex items-center justify-center">
                        <AlignLeft className="w-7 h-7 text-text-tertiary opacity-40" />
                    </div>
                    <p className="text-sm font-medium text-text-tertiary">Select a task to view details</p>
                    <p className="text-xs text-text-tertiary mt-1 opacity-60">
                        Click on any task from the list
                    </p>
                </div>
            </div>
        );
    }

    const handleSave = () => {
        onSave(task.id, {
            ...form,
            completed: task.completed,
        });
    };

    const addTag = () => {
        const t = newTag.trim().toLowerCase();
        if (t && !form.tags.includes(t)) {
            setForm({ ...form, tags: [...form.tags, t] });
            setNewTag('');
        }
    };

    const removeTag = (tag) => {
        setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setForm({
                ...form,
                subtasks: [...form.subtasks, { title: newSubtask.trim(), completed: false }],
            });
            setNewSubtask('');
        }
    };

    const toggleSubtask = (idx) => {
        const updated = form.subtasks.map((s, i) =>
            i === idx ? { ...s, completed: !s.completed } : s,
        );
        setForm({ ...form, subtasks: updated });
    };

    const removeSubtask = (idx) => {
        setForm({ ...form, subtasks: form.subtasks.filter((_, i) => i !== idx) });
    };

    return (
        <div className="w-[340px] h-screen bg-panel border-l border-border flex flex-col shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
                <h2 className="text-sm font-semibold text-text-primary">Task Details</h2>
                <button
                    onClick={onClose}
                    className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-white transition-smooth cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Title */}
                <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                        <Type className="w-3.5 h-3.5" />
                        Title
                    </label>
                    <input
                        type="text"
                        className="w-full text-sm font-medium text-text-primary bg-white border border-border-light rounded-lg px-3 py-2.5 outline-none focus:border-accent transition-smooth"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                        <AlignLeft className="w-3.5 h-3.5" />
                        Description
                    </label>
                    <textarea
                        rows={3}
                        className="w-full text-sm text-text-secondary bg-white border border-border-light rounded-lg px-3 py-2.5 outline-none focus:border-accent transition-smooth resize-none"
                        placeholder="Add a description..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                {/* List */}
                <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                        <List className="w-3.5 h-3.5" />
                        List
                    </label>
                    <select
                        className="w-full text-sm text-text-primary bg-white border border-border-light rounded-lg px-3 py-2.5 outline-none focus:border-accent transition-smooth cursor-pointer"
                        value={form.list_id}
                        onChange={(e) => setForm({ ...form, list_id: e.target.value ? Number(e.target.value) : '' })}
                    >
                        <option value="">No list</option>
                        {lists.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.icon} {l.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Due date */}
                <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Due Date
                    </label>
                    <input
                        type="date"
                        className="w-full text-sm text-text-primary bg-white border border-border-light rounded-lg px-3 py-2.5 outline-none focus:border-accent transition-smooth cursor-pointer"
                        value={form.due_date}
                        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                        <Tag className="w-3.5 h-3.5" />
                        Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {form.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-accent-light text-accent rounded-md"
                            >
                                {tag}
                                <button onClick={() => removeTag(tag)} className="hover:text-danger transition-smooth cursor-pointer">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add tag..."
                            className="flex-1 text-sm bg-white border border-border-light rounded-lg px-3 py-2 outline-none focus:border-accent transition-smooth"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTag()}
                        />
                        <button
                            onClick={addTag}
                            className="p-2 text-text-tertiary hover:text-accent hover:bg-white rounded-lg transition-smooth cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Subtasks */}
                <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                        <CheckSquare className="w-3.5 h-3.5" />
                        Subtasks
                        {form.subtasks.length > 0 && (
                            <span className="text-[10px] ml-1 px-1.5 py-0.5 bg-border-light rounded-md font-semibold">
                                {form.subtasks.filter((s) => s.completed).length}/{form.subtasks.length}
                            </span>
                        )}
                    </label>
                    <div className="space-y-1 mb-2">
                        {form.subtasks.map((sub, idx) => (
                            <div
                                key={idx}
                                className="group flex items-center gap-2 px-2.5 py-2 bg-white rounded-lg border border-border-light hover:border-border transition-smooth"
                            >
                                <button onClick={() => toggleSubtask(idx)} className="flex-shrink-0 cursor-pointer">
                                    {sub.completed ? (
                                        <CheckSquare className="w-4 h-4 text-success" />
                                    ) : (
                                        <Square className="w-4 h-4 text-border hover:text-accent transition-smooth" />
                                    )}
                                </button>
                                <span
                                    className={`flex-1 text-sm ${sub.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                                        }`}
                                >
                                    {sub.title}
                                </span>
                                <button
                                    onClick={() => removeSubtask(idx)}
                                    className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger transition-smooth cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add subtask..."
                            className="flex-1 text-sm bg-white border border-border-light rounded-lg px-3 py-2 outline-none focus:border-accent transition-smooth"
                            value={newSubtask}
                            onChange={(e) => setNewSubtask(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                        />
                        <button
                            onClick={addSubtask}
                            className="p-2 text-text-tertiary hover:text-accent hover:bg-white rounded-lg transition-smooth cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-border-light flex gap-2">
                <button
                    onClick={() => onDelete(task.id)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-danger bg-danger-light rounded-lg hover:bg-danger hover:text-white transition-smooth cursor-pointer"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-smooth cursor-pointer shadow-sm"
                >
                    <Save className="w-4 h-4" />
                    Save Changes
                </button>
            </div>
        </div>
    );
}

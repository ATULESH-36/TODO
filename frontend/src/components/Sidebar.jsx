import { useState } from 'react';
import {
    Search,
    Sun,
    Calendar,
    CalendarDays,
    StickyNote,
    ChevronDown,
    ChevronRight,
    Plus,
    Tag,
    Settings,
    LogOut,
    Layout,
    Home,
    Briefcase,
    Hash,
    X,
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'today', label: 'Today', icon: Sun },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'sticky', label: 'Sticky Wall', icon: StickyNote },
];

const LIST_ICONS = {
    '🏠': Home,
    '💼': Briefcase,
    '📁': Hash,
};

export default function Sidebar({
    lists,
    activeList,
    onSelectList,
    onSearch,
    searchQuery,
    onCreateList,
    onDeleteList,
}) {
    const [listsOpen, setListsOpen] = useState(true);
    const [tagsOpen, setTagsOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [showNewList, setShowNewList] = useState(false);

    const handleAddList = () => {
        if (newListName.trim()) {
            onCreateList({ name: newListName.trim() });
            setNewListName('');
            setShowNewList(false);
        }
    };

    return (
        <aside className="w-[260px] h-screen bg-sidebar border-r border-border flex flex-col overflow-hidden shrink-0">
            {/* Logo */}
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                        <Layout className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-text-primary">TaskFlow</span>
                </div>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-border-light hover:border-border transition-smooth">
                    <Search className="w-4 h-4 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => onSearch('')} className="hover:text-text-primary transition-smooth">
                            <X className="w-3.5 h-3.5 text-text-tertiary" />
                        </button>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="px-3 pb-2 flex-shrink-0">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeList === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelectList(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth mb-0.5 cursor-pointer ${isActive
                                    ? 'bg-accent-light text-accent'
                                    : 'text-text-secondary hover:bg-white hover:text-text-primary'
                                }`}
                        >
                            <Icon className="w-[18px] h-[18px]" />
                            {item.label}
                            {item.id === 'today' && (
                                <span className={`ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-accent text-white' : 'bg-border-light text-text-tertiary'
                                    }`}>
                                    •
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="h-px bg-border-light mx-4 my-1" />

            {/* Lists */}
            <div className="px-3 pt-2 flex-1 overflow-y-auto">
                <button
                    onClick={() => setListsOpen(!listsOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-smooth"
                >
                    <span>Lists</span>
                    {listsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {listsOpen && (
                    <div className="space-y-0.5">
                        <button
                            onClick={() => onSelectList(null)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth cursor-pointer ${activeList === null
                                    ? 'bg-accent-light text-accent'
                                    : 'text-text-secondary hover:bg-white hover:text-text-primary'
                                }`}
                        >
                            <Hash className="w-[18px] h-[18px]" />
                            All Tasks
                        </button>

                        {lists.map((list) => {
                            const Icon = LIST_ICONS[list.icon] || Hash;
                            const isActive = activeList === list.id;
                            return (
                                <div key={list.id} className="group flex items-center">
                                    <button
                                        onClick={() => onSelectList(list.id)}
                                        className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth cursor-pointer ${isActive
                                                ? 'bg-accent-light text-accent'
                                                : 'text-text-secondary hover:bg-white hover:text-text-primary'
                                            }`}
                                    >
                                        <Icon className="w-[18px] h-[18px]" />
                                        {list.name}
                                    </button>
                                    {list.id > 2 && (
                                        <button
                                            onClick={() => onDeleteList(list.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 mr-1 text-text-tertiary hover:text-danger transition-smooth cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                        {showNewList ? (
                            <div className="flex items-center gap-2 px-3 py-1.5">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="List name"
                                    className="flex-1 text-sm bg-white border border-border rounded-md px-2 py-1.5 outline-none focus:border-accent transition-smooth"
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddList();
                                        if (e.key === 'Escape') setShowNewList(false);
                                    }}
                                />
                                <button
                                    onClick={handleAddList}
                                    className="p-1 text-accent hover:text-accent-hover transition-smooth cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowNewList(true)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-tertiary hover:text-accent transition-smooth cursor-pointer rounded-lg hover:bg-white"
                            >
                                <Plus className="w-[18px] h-[18px]" />
                                Add New List
                            </button>
                        )}
                    </div>
                )}

                {/* Tags */}
                <button
                    onClick={() => setTagsOpen(!tagsOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 mt-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-smooth"
                >
                    <span>Tags</span>
                    {tagsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {tagsOpen && (
                    <div className="px-3 py-2 space-y-1">
                        {['urgent', 'design', 'bug', 'meeting', 'personal'].map((tag) => (
                            <div key={tag} className="flex items-center gap-2 py-1">
                                <Tag className="w-3.5 h-3.5 text-text-tertiary" />
                                <span className="text-sm text-text-secondary">{tag}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom */}
            <div className="border-t border-border-light p-3 space-y-0.5">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white hover:text-text-primary transition-smooth cursor-pointer">
                    <Settings className="w-[18px] h-[18px]" />
                    Settings
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white hover:text-text-primary transition-smooth cursor-pointer">
                    <LogOut className="w-[18px] h-[18px]" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

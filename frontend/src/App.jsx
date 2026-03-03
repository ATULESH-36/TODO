import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import { fetchTasks, fetchLists, createTask, updateTask, deleteTask, createList, deleteList } from './api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [activeList, setActiveList] = useState(null); // null = all, number = list id, string = nav id
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Data fetching ──────────────────────────────────────────
  const loadLists = useCallback(async () => {
    try {
      const data = await fetchLists();
      setLists(data);
    } catch (err) {
      console.error('Failed to load lists:', err);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const listId = typeof activeList === 'number' ? activeList : null;
      const data = await fetchTasks(listId);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, [activeList]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ── Filtered tasks ─────────────────────────────────────────
  const filteredTasks = tasks.filter((task) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        (task.description || '').toLowerCase().includes(q) ||
        (task.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // ── Active list name ───────────────────────────────────────
  const getActiveListName = () => {
    if (activeList === null) return 'All Tasks';
    if (activeList === 'today') return 'Today';
    if (activeList === 'upcoming') return 'Upcoming';
    if (activeList === 'calendar') return 'Calendar';
    if (activeList === 'sticky') return 'Sticky Wall';
    const list = lists.find((l) => l.id === activeList);
    return list ? list.name : 'Tasks';
  };

  // ── Handlers ───────────────────────────────────────────────
  const handleCreateTask = async (title) => {
    try {
      const listId = typeof activeList === 'number' ? activeList : null;
      const newTask = await createTask({
        title,
        due_date: new Date().toISOString().split('T')[0],
        list_id: listId,
      });
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      await updateTask(taskId, { completed });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed } : t)),
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleSaveTask = async (taskId, data) => {
    try {
      const updated = await updateTask(taskId, data);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selectedTaskId === taskId) setSelectedTaskId(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleCreateList = async (data) => {
    try {
      const newList = await createList(data);
      setLists((prev) => [...prev, newList]);
    } catch (err) {
      console.error('Failed to create list:', err);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await deleteList(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
      if (activeList === listId) setActiveList(null);
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface">
      <Sidebar
        lists={lists}
        activeList={activeList}
        onSelectList={setActiveList}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onCreateList={handleCreateList}
        onDeleteList={handleDeleteList}
      />
      <TaskList
        tasks={filteredTasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={setSelectedTaskId}
        onToggleComplete={handleToggleComplete}
        onCreateTask={handleCreateTask}
        activeListName={getActiveListName()}
        taskCount={filteredTasks.length}
      />
      <TaskDetail
        task={selectedTask}
        lists={lists}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}

export default App;

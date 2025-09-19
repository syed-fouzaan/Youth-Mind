"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, ListTodo, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('todo-tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.warn('Could not retrieve tasks from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('todo-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.warn('Could not save tasks to localStorage:', error);
    }
  }, [tasks]);

  const handleAddTask = () => {
    if (newTask.trim() === '') {
        toast({
            variant: 'destructive',
            title: 'Empty Task',
            description: 'Please enter a task before adding.',
        });
      return;
    }
    const task: Task = {
      id: Date.now(),
      text: newTask,
      completed: false,
    };
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const handleToggleTask = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
             <ListTodo className="h-8 w-8 text-primary" />
             <CardTitle className="font-headline text-3xl">My To-Do List</CardTitle>
          </div>
          <CardDescription>Stay organized and keep track of your goals. You've got this!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-lg items-center space-x-2">
            <Input 
              type="text" 
              placeholder="e.g., Go for a 15-minute walk"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button onClick={handleAddTask}>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          {totalTasks > 0 && <CardDescription>
            {completedTasks} of {totalTasks} tasks completed.
          </CardDescription>}
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <ul className="space-y-4">
              {tasks.map(task => (
                <li key={task.id} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                  <Checkbox 
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id)}
                    aria-label={`Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
                  />
                  <label 
                    htmlFor={`task-${task.id}`}
                    className={`flex-1 text-sm ${task.completed ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {task.text}
                  </label>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteTask(task.id)}
                    aria-label={`Delete task "${task.text}"`}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tasks yet. Add one to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

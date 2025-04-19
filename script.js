// Main app initialization function that will be called by Firebase auth
window.initializeApp = (userId) => {
  // Get Firebase services from the window object
  const { 
    auth, db, collection, addDoc, updateDoc, deleteDoc, doc,
    query, where, orderBy, getDocs, writeBatch
  } = window.firebaseServices;

  let tasks = [];

  // DOM Elements
  const taskInput = document.querySelector('.task-input');
  const addButton = document.querySelector('.add-button');
  const taskList = document.querySelector('.task-list');
  const tasksCount = document.querySelector('.tasks-count');
  const clearCompletedBtn = document.querySelector('.clear-completed');
  const emptyState = document.querySelector('.empty-state');

  // Load tasks from Firestore
  const loadTasks = async () => {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderTasks();
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  // Add new task to Firestore
  const addTask = async () => {
    const text = taskInput.value.trim();
    if (!text) return;

    try {
      // Add subtle animation to input on add
      taskInput.style.transform = 'scale(1.02)';
      setTimeout(() => {
        taskInput.style.transform = 'scale(1)';
      }, 200);

      const newTask = {
        text,
        completed: false,
        timestamp: Date.now(),
        userId
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      tasks.unshift({ id: docRef.id, ...newTask });

      taskInput.value = '';
      renderTasks();
      
      // Focus back on input for quick sequential task adding
      taskInput.focus();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Toggle task completion in Firestore
  const toggleTask = async (index) => {
    const task = tasks[index];
    
    try {
      task.completed = !task.completed;
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: task.completed
      });
      
      renderTasks();
    } catch (error) {
      console.error("Error toggling task:", error);
      task.completed = !task.completed;
    }
  };

  // Delete task from Firestore
  const removeTask = async (index, taskElement) => {
    const task = tasks[index];
    taskElement.classList.add('slide-out');

    setTimeout(async () => {
      try {
        await deleteDoc(doc(db, 'tasks', task.id));
        tasks.splice(index, 1);
        renderTasks();
      } catch (error) {
        console.error("Error removing task:", error);
        taskElement.classList.remove('slide-out');
      }
    }, 300);
  };

  // Clear all completed tasks
  const clearCompleted = async () => {
    const completed = tasks.filter(t => t.completed);
    if (completed.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      
      completed.forEach(task => {
        const docRef = doc(db, 'tasks', task.id);
        batch.delete(docRef);
      });

      // Add subtle animation to clear button
      clearCompletedBtn.style.transform = 'scale(1.1)';
      setTimeout(() => {
        clearCompletedBtn.style.transform = 'scale(1)';
      }, 200);

      await batch.commit();
      tasks = tasks.filter(t => !t.completed);
      renderTasks();
    } catch (error) {
      console.error("Error clearing completed tasks:", error);
    }
  };

  // Render all tasks to UI
  const renderTasks = () => {
    taskList.innerHTML = '';
    
    const remaining = tasks.filter(task => !task.completed).length;
    tasksCount.textContent = `${remaining} task${remaining !== 1 ? 's' : ''}`;
    
    if (tasks.length === 0) {
      emptyState.style.display = 'flex';
    } else {
      emptyState.style.display = 'none';
      
      tasks.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        if (task.completed) taskItem.classList.add('completed');
        
        // Staggered animation
        taskItem.style.animationDelay = `${index * 0.05}s`;

        taskItem.innerHTML = `
          <div class="task-content">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
          </div>
          <button class="delete-button">✕</button>
        `;

        taskList.appendChild(taskItem);

        // Add ripple effect on click
        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => {
          if (!task.completed) {
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            checkbox.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
          }
          toggleTask(index);
        });
        
        taskItem.querySelector('.delete-button').addEventListener('click', () => removeTask(index, taskItem));
      });
    }
  };

  // User Events
  addButton.addEventListener('click', addTask);
  
  taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      addTask();
    }
  });
  
  // Add subtle animation to input on focus
  taskInput.addEventListener('focus', () => {
    taskInput.style.boxShadow = '0 0 0 2px rgba(189, 124, 254, 0.3)';
  });
  
  taskInput.addEventListener('blur', () => {
    taskInput.style.boxShadow = 'none';
  });
  
  clearCompletedBtn.addEventListener('click', clearCompleted);

  // Start everything
  loadTasks();
};
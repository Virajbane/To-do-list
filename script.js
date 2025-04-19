document.addEventListener('DOMContentLoaded', () => {
    // 🔥 Initialize Firebase references
    const auth = firebase.auth();
    const db = firebase.firestore();
  
    let userId = null;
    let tasks = [];
  
    // 🌐 DOM Elements
    const taskInput = document.querySelector('.task-input');
    const addButton = document.querySelector('.add-button');
    const taskList = document.querySelector('.task-list');
    const tasksCount = document.querySelector('.tasks-count');
    const clearCompletedBtn = document.querySelector('.clear-completed');
    const backgroundParticles = document.querySelector('.background-particles');
  
    // 🎆 Animated background particles
    const createParticles = () => {
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 80 + 20;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const animDuration = Math.random() * 20 + 10;
  
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.animation = `scaleIn ${animDuration}s infinite alternate ease-in-out`;
  
        backgroundParticles.appendChild(particle);
      }
    };
  
    // 🔐 Sign in anonymously with Firebase Auth
    auth.signInAnonymously()
      .then(userCredential => {
        userId = userCredential.user.uid;
        loadTasks(); // Load tasks after login
      })
      .catch(err => {
        alert("Authentication failed: " + err.message);
      });
  
    // 📥 Load tasks from Firestore
    const loadTasks = async () => {
      const snapshot = await db.collection('tasks')
        .where('userId', '==', userId)
        .orderBy('timestamp')
        .get();
  
      tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderTasks();
    };
  
    // ➕ Add new task to Firestore
    const addTask = async () => {
      const text = taskInput.value.trim();
      if (!text) return;
  
      const newTask = {
        text,
        completed: false,
        timestamp: Date.now(),
        userId // Store which user the task belongs to
      };
  
      const docRef = await db.collection('tasks').add(newTask); // ⬅️ Firestore add
      tasks.push({ id: docRef.id, ...newTask });
  
      taskInput.value = '';
      renderTasks();
    };
  
    // 🔁 Toggle task completion in Firestore
    const toggleTask = async (index) => {
      const task = tasks[index];
      task.completed = !task.completed;
  
      await db.collection('tasks').doc(task.id).update({
        completed: task.completed
      }); // ⬅️ Firestore update
  
      renderTasks();
    };
  
    // ❌ Delete task from Firestore
    const removeTask = async (index, taskElement) => {
      const task = tasks[index];
      taskElement.classList.add('slide-out');
  
      setTimeout(async () => {
        await db.collection('tasks').doc(task.id).delete(); // ⬅️ Firestore delete
        tasks.splice(index, 1);
        renderTasks();
      }, 300);
    };
  
    // 🧹 Clear all completed tasks
    const clearCompleted = async () => {
      const completed = tasks.filter(t => t.completed);
      const batch = db.batch(); // Use Firestore batch delete
  
      completed.forEach(task => {
        const docRef = db.collection('tasks').doc(task.id);
        batch.delete(docRef);
      });
  
      await batch.commit(); // ⬅️ Firestore batch commit
      tasks = tasks.filter(t => !t.completed);
      renderTasks();
    };
  
    // 🖼️ Render all tasks to UI
    const renderTasks = () => {
      taskList.innerHTML = '';
  
      if (tasks.length === 0) {
        taskList.innerHTML = `
          <div class="empty-state">
            <svg width="64" height="64" ...></svg>
            <p>No tasks yet! Add a task to get started.</p>
          </div>
        `;
      } else {
        tasks.forEach((task, index) => {
          const taskItem = document.createElement('li');
          taskItem.classList.add('task-item');
          if (task.completed) taskItem.classList.add('completed');
          taskItem.style.animationDelay = `${index * 0.05}s`;
  
          taskItem.innerHTML = `
            <div class="task-content">
              <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
              <span class="task-text">${task.text}</span>
            </div>
            <button class="delete-button">✕</button>
          `;
  
          taskList.appendChild(taskItem);
  
          taskItem.querySelector('.task-checkbox').addEventListener('change', () => toggleTask(index));
          taskItem.querySelector('.delete-button').addEventListener('click', () => removeTask(index, taskItem));
        });
      }
  
      updateTasksCount();
    };
  
    const updateTasksCount = () => {
      const remaining = tasks.filter(task => !task.completed).length;
      tasksCount.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
    };
  
    // 🎯 User Events
    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keydown', e => e.key === 'Enter' && addTask());
    clearCompletedBtn.addEventListener('click', clearCompleted);
  
    // ⏱ Start everything
    createParticles();
  });
  
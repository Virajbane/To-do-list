document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.querySelector('.task-input');
    const addButton = document.querySelector('.add-button');
    const taskList = document.querySelector('.task-list');
    const tasksCount = document.querySelector('.tasks-count');
    const clearCompletedBtn = document.querySelector('.clear-completed');
    const backgroundParticles = document.querySelector('.background-particles');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Generate background particles
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
    
    // Render tasks
    const renderTasks = () => {
      taskList.innerHTML = '';
      
      if (tasks.length === 0) {
        taskList.innerHTML = `
          <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <p>No tasks yet! Add a task to get started.</p>
          </div>
        `;
      } else {
        tasks.forEach((task, index) => {
          const taskItem = document.createElement('li');
          taskItem.classList.add('task-item');
          if (task.completed) {
            taskItem.classList.add('completed');
          }
          
          taskItem.style.animationDelay = `${index * 0.05}s`;
          
          taskItem.innerHTML = `
            <div class="task-content">
              <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
              <span class="task-text">${task.text}</span>
            </div>
            <button class="delete-button">✕</button>
          `;
          
          taskList.appendChild(taskItem);
          
          // Checkbox event listener
          const checkbox = taskItem.querySelector('.task-checkbox');
          checkbox.addEventListener('change', () => {
            toggleTask(index);
          });
          
          // Delete button event listener
          const deleteBtn = taskItem.querySelector('.delete-button');
          deleteBtn.addEventListener('click', () => {
            removeTask(index, taskItem);
          });
        });
      }
      
      updateTasksCount();
    };
    
    // Add new task
    const addTask = () => {
      const text = taskInput.value.trim();
      
      if (text === '') {
        taskInput.classList.add('shake');
        setTimeout(() => {
          taskInput.classList.remove('shake');
        }, 400);
        return;
      }
      
      const newTask = {
        text,
        completed: false,
        timestamp: Date.now()
      };
      
      tasks.push(newTask);
      saveTasks();
      taskInput.value = '';
      renderTasks();
      
      // Add task animation effect
      taskList.lastChild.style.animation = 'fadeIn 0.4s ease forwards';
    };
    
    // Toggle task completion
    const toggleTask = (index) => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    };
    
    // Remove task
    const removeTask = (index, taskElement) => {
      taskElement.classList.add('slide-out');
      
      setTimeout(() => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      }, 300);
    };
    
    // Clear completed tasks
    const clearCompleted = () => {
      const completedTasks = document.querySelectorAll('.task-item.completed');
      
      completedTasks.forEach(task => {
        task.classList.add('slide-out');
      });
      
      setTimeout(() => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
      }, 300);
    };
    
    // Update tasks count
    const updateTasksCount = () => {
      const remaining = tasks.filter(task => !task.completed).length;
      tasksCount.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
    };
    
    // Save tasks to localStorage
    const saveTasks = () => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    };
    
    // Event listeners
    addButton.addEventListener('click', addTask);
    
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addTask();
      }
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    // Initial renders
    createParticles();
    renderTasks();
  });
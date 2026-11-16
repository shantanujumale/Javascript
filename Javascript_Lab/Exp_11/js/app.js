/**
 * app.js - Main Application Entry Point
 * Orchestrates ES6 modules, manages application state, and coordinates
 * JavaScript timers (setInterval, setTimeout, clearInterval, clearTimeout).
 */

import {
  calculateTimeRemaining,
  CountdownTimer,
  playSyntheticAlert,
  createDelayedAction
} from './modules/timer.js';

import {
  DAYS_OF_WEEK,
  getDayName,
  getActiveAndNextClass,
  filterSchedule
} from './modules/scheduler.js';

import {
  loadSchedule,
  saveSchedule,
  loadCountdowns,
  saveCountdowns,
  loadTheme,
  saveTheme,
  loadAudioPref,
  saveAudioPref,
  resetAllStorage
} from './modules/storage.js';

import {
  updateDigitalClock,
  renderActiveLectureBanner,
  renderScheduleGrid,
  renderCountdownCards,
  showToast
} from './modules/ui.js';

// Application State
const AppState = {
  schedule: [],
  countdowns: [],
  timerInstances: new Map(), // id -> CountdownTimer
  selectedDay: 'Today',
  searchQuery: '',
  audioEnabled: true,
  lastClassId: null,
  searchDebounceTimer: null
};

// DOM Elements Cache
const DOM = {};

/**
 * Initialize the application
 */
function init() {
  cacheDOMElements();
  loadInitialState();
  initTheme();
  initClockAndScheduler();
  initCountdownTimers();
  bindEventListeners();

  // Welcome Toast demonstrating setTimeout auto-dismiss
  setTimeout(() => {
    showToast('Class Scheduler & Countdown Hub initialized successfully!', 'success', 3500);
  }, 600);
}

/**
 * Cache frequently accessed DOM nodes
 */
function cacheDOMElements() {
  DOM.clockDigits = document.getElementById('clockDigits');
  DOM.clockAmpm = document.getElementById('clockAmpm');
  DOM.clockDay = document.getElementById('clockDay');
  DOM.clockDate = document.getElementById('clockDate');
  DOM.activeBanner = document.getElementById('activeBannerContainer');
  DOM.scheduleGrid = document.getElementById('scheduleGrid');
  DOM.countdownsGrid = document.getElementById('countdownsGrid');
  DOM.dayFilterTabs = document.getElementById('dayFilterTabs');
  DOM.searchInput = document.getElementById('scheduleSearchInput');
  DOM.themeToggleBtn = document.getElementById('themeToggleBtn');
  DOM.soundToggleBtn = document.getElementById('soundToggleBtn');
  DOM.testSoundBtn = document.getElementById('testSoundBtn');
  DOM.resetDataBtn = document.getElementById('resetDataBtn');

  // Modals
  DOM.addClassModal = document.getElementById('addClassModal');
  DOM.openAddClassBtn = document.getElementById('openAddClassBtn');
  DOM.closeAddClassBtn = document.getElementById('closeAddClassBtn');
  DOM.addClassForm = document.getElementById('addClassForm');

  DOM.addCountdownModal = document.getElementById('addCountdownModal');
  DOM.openAddCountdownBtn = document.getElementById('openAddCountdownBtn');
  DOM.closeAddCountdownBtn = document.getElementById('closeAddCountdownBtn');
  DOM.addCountdownForm = document.getElementById('addCountdownForm');

  // Quick Countdown Presets
  DOM.quickPresets = document.querySelectorAll('[data-preset-mins]');
}

/**
 * Load persisted data from localStorage
 */
function loadInitialState() {
  AppState.schedule = loadSchedule();
  AppState.countdowns = loadCountdowns();
  AppState.audioEnabled = loadAudioPref();
  updateSoundButtonUI();
}

/**
 * Initialize theme (light/dark)
 */
function initTheme() {
  const currentTheme = loadTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeButtonUI(currentTheme);
}

/**
 * Master 1-Second Interval Ticker using setInterval()
 * Updates Digital Clock and checks Live Class / Lecture status
 */
function initClockAndScheduler() {
  const tickClockAndSchedule = () => {
    const now = new Date();

    // 1. Update live clock display
    updateDigitalClock(
      {
        clockEl: DOM.clockDigits,
        ampmEl: DOM.clockAmpm,
        dayEl: DOM.clockDay,
        dateEl: DOM.clockDate
      },
      now
    );

    // 2. Compute active and next lecture
    const activeInfo = getActiveAndNextClass(AppState.schedule, now);

    // Render active hero card
    renderActiveLectureBanner(DOM.activeBanner, activeInfo);

    // Check if class transitioned to announce audio alert
    const currentClassId = activeInfo.currentClass ? activeInfo.currentClass.id : null;
    if (currentClassId !== AppState.lastClassId) {
      if (AppState.lastClassId !== null) {
        // A class just started or ended!
        if (currentClassId) {
          if (AppState.audioEnabled) playSyntheticAlert('bell');
          showToast(`Now starting: ${activeInfo.currentClass.subject} (${activeInfo.currentClass.room})`, 'info', 5000);
        } else {
          if (AppState.audioEnabled) playSyntheticAlert('chime');
          showToast(`Class ended. You now have a break!`, 'info', 4000);
        }
      }
      AppState.lastClassId = currentClassId;
    }

    // 3. Refresh Schedule Grid to update progress and status tags
    refreshScheduleView(now);
  };

  // Run first tick immediately
  tickClockAndSchedule();

  // Core setInterval demonstration for live real-time scheduler
  setInterval(tickClockAndSchedule, 1000);
}

/**
 * Refresh timetable list based on selected filter day and search query
 */
function refreshScheduleView(now = new Date()) {
  const effectiveDay =
    AppState.selectedDay === 'Today' ? getDayName(now) : AppState.selectedDay;

  const filtered = filterSchedule(
    AppState.schedule,
    effectiveDay,
    AppState.searchQuery
  );

  renderScheduleGrid(
    DOM.scheduleGrid,
    filtered,
    handleDeleteClass,
    now
  );
}

/**
 * Initialize Countdown Timers using ES6 CountdownTimer classes
 */
function initCountdownTimers() {
  // Clear any existing instances
  AppState.timerInstances.forEach((timer) => timer.stop());
  AppState.timerInstances.clear();

  AppState.countdowns.forEach((item) => {
    createCountdownInstance(item);
  });

  renderCountdownsView();
}

/**
 * Create CountdownTimer instance
 */
function createCountdownInstance(item) {
  const timer = new CountdownTimer({
    id: item.id,
    title: item.title,
    targetDate: item.targetDate,
    category: item.category,
    onTick: () => {
      // Re-render countdown cards every tick
      renderCountdownsView();
    },
    onComplete: (data) => {
      if (AppState.audioEnabled) {
        playSyntheticAlert('chime');
      }
      showToast(`⏰ Countdown Completed: "${data.title}"!`, 'warning', 6000);
      saveCurrentCountdownsState();
      renderCountdownsView();
    }
  });

  if (item.isPaused) {
    timer.isPaused = true;
    timer.pausedRemainingMs = item.pausedRemainingMs || 0;
  } else {
    timer.start();
  }

  AppState.timerInstances.set(item.id, timer);
}

/**
 * Re-render countdown cards view
 */
function renderCountdownsView() {
  const dataList = AppState.countdowns.map((item) => {
    const instance = AppState.timerInstances.get(item.id);
    let remaining;
    if (instance) {
      if (instance.isPaused) {
        remaining = calculateTimeRemaining(Date.now() + instance.pausedRemainingMs);
      } else {
        remaining = calculateTimeRemaining(instance.targetDate);
      }
    } else {
      remaining = calculateTimeRemaining(item.targetDate);
    }

    return {
      data: item,
      remaining
    };
  });

  renderCountdownCards(DOM.countdownsGrid, dataList, {
    onTogglePause: handleTogglePauseCountdown,
    onReset: handleResetCountdown,
    onDelete: handleDeleteCountdown
  });
}

/**
 * Save current state of timers back to localStorage
 */
function saveCurrentCountdownsState() {
  const serialized = AppState.countdowns.map((item) => {
    const inst = AppState.timerInstances.get(item.id);
    if (inst) {
      return inst.toJSON();
    }
    return item;
  });
  saveCountdowns(serialized);
}

/**
 * Handlers for Countdown actions
 */
function handleTogglePauseCountdown(id) {
  const inst = AppState.timerInstances.get(id);
  const cdItem = AppState.countdowns.find((c) => c.id === id);
  if (!inst || !cdItem) return;

  if (inst.isPaused) {
    inst.start();
    cdItem.isPaused = false;
    showToast(`Resumed "${inst.title}"`, 'info', 2000);
  } else {
    inst.pause();
    cdItem.isPaused = true;
    cdItem.pausedRemainingMs = inst.pausedRemainingMs;
    showToast(`Paused "${inst.title}"`, 'info', 2000);
  }

  saveCurrentCountdownsState();
  renderCountdownsView();
}

function handleResetCountdown(id) {
  const inst = AppState.timerInstances.get(id);
  const cdItem = AppState.countdowns.find((c) => c.id === id);
  if (!inst || !cdItem) return;

  inst.reset();
  cdItem.isPaused = false;
  cdItem.isCompleted = false;
  inst.start();

  showToast(`Reset countdown for "${inst.title}"`, 'info', 2000);
  saveCurrentCountdownsState();
  renderCountdownsView();
}

function handleDeleteCountdown(id) {
  const inst = AppState.timerInstances.get(id);
  if (inst) {
    inst.stop();
    AppState.timerInstances.delete(id);
  }
  AppState.countdowns = AppState.countdowns.filter((c) => c.id !== id);
  saveCountdowns(AppState.countdowns);
  showToast('Countdown deleted.', 'info', 2000);
  renderCountdownsView();
}

function handleDeleteClass(id) {
  const item = AppState.schedule.find((c) => c.id === id);
  const name = item ? item.subject : 'Class';
  if (confirm(`Are you sure you want to remove "${name}" from the timetable?`)) {
    AppState.schedule = AppState.schedule.filter((c) => c.id !== id);
    saveSchedule(AppState.schedule);
    showToast(`Removed "${name}" from schedule.`, 'info', 2500);
    refreshScheduleView();
  }
}

/**
 * Demonstrates setTimeout and clearTimeout for Search Debouncing
 */
function handleSearchInput(e) {
  const val = e.target.value;

  // Clear previous pending timeout
  if (AppState.searchDebounceTimer) {
    clearTimeout(AppState.searchDebounceTimer);
  }

  // Delay filtering by 250ms using setTimeout()
  AppState.searchDebounceTimer = setTimeout(() => {
    AppState.searchQuery = val;
    refreshScheduleView();
  }, 250);
}

/**
 * Setup All Event Listeners
 */
function bindEventListeners() {
  // Day filter tabs
  if (DOM.dayFilterTabs) {
    DOM.dayFilterTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.day-tab');
      if (!tab) return;

      DOM.dayFilterTabs.querySelectorAll('.day-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      AppState.selectedDay = tab.getAttribute('data-day');
      refreshScheduleView();
    });
  }

  // Search input with debounce
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener('input', handleSearchInput);
  }

  // Theme toggle
  if (DOM.themeToggleBtn) {
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Audio mute/unmute
  if (DOM.soundToggleBtn) {
    DOM.soundToggleBtn.addEventListener('click', toggleAudio);
  }

  // Test sound
  if (DOM.testSoundBtn) {
    DOM.testSoundBtn.addEventListener('click', () => {
      playSyntheticAlert('chime');
      showToast('Played synthesized notification chime! 🎶', 'info', 2000);
    });
  }

  // Reset to factory sample data
  if (DOM.resetDataBtn) {
    DOM.resetDataBtn.addEventListener('click', () => {
      if (confirm('Reset schedule and countdowns back to sample default values?')) {
        const { schedule, countdowns } = resetAllStorage();
        AppState.schedule = schedule;
        AppState.countdowns = countdowns;
        initCountdownTimers();
        refreshScheduleView();
        showToast('Restored default college timetable and timers!', 'success', 3000);
      }
    });
  }

  // Add Class Modal
  if (DOM.openAddClassBtn) {
    DOM.openAddClassBtn.addEventListener('click', () => openModal(DOM.addClassModal));
  }
  if (DOM.closeAddClassBtn) {
    DOM.closeAddClassBtn.addEventListener('click', () => closeModal(DOM.addClassModal));
  }
  if (DOM.addClassForm) {
    DOM.addClassForm.addEventListener('submit', handleAddClassSubmit);
  }

  // Add Countdown Modal
  if (DOM.openAddCountdownBtn) {
    DOM.openAddCountdownBtn.addEventListener('click', () => {
      // Pre-fill datetime-local picker with current time + 1 hour
      const targetInput = document.getElementById('cdTargetDate');
      if (targetInput) {
        const future = new Date(Date.now() + 60 * 60 * 1000);
        // Format to YYYY-MM-DDTHH:mm
        const yyyy = future.getFullYear();
        const mm = String(future.getMonth() + 1).padStart(2, '0');
        const dd = String(future.getDate()).padStart(2, '0');
        const hh = String(future.getHours()).padStart(2, '0');
        const min = String(future.getMinutes()).padStart(2, '0');
        targetInput.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      }
      openModal(DOM.addCountdownModal);
    });
  }
  if (DOM.closeAddCountdownBtn) {
    DOM.closeAddCountdownBtn.addEventListener('click', () => closeModal(DOM.addCountdownModal));
  }
  if (DOM.addCountdownForm) {
    DOM.addCountdownForm.addEventListener('submit', handleAddCountdownSubmit);
  }

  // Quick Countdown Preset Buttons (+5m, +15m, +25m Pomodoro, +60m)
  DOM.quickPresets.forEach((btn) => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.getAttribute('data-preset-mins'), 10);
      const label = btn.getAttribute('data-preset-label') || `${minutes} Min Timer`;
      createQuickCountdown(label, minutes);
    });
  });

  // Close modals on clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === DOM.addClassModal) closeModal(DOM.addClassModal);
    if (e.target === DOM.addCountdownModal) closeModal(DOM.addCountdownModal);
  });
}

/**
 * Handle Add Class Form Submission
 */
function handleAddClassSubmit(e) {
  e.preventDefault();

  const subject = document.getElementById('classSubject').value.trim();
  const code = document.getElementById('classCode').value.trim();
  const day = document.getElementById('classDay').value;
  const startTime = document.getElementById('classStartTime').value;
  const endTime = document.getElementById('classEndTime').value;
  const faculty = document.getElementById('classFaculty').value.trim();
  const room = document.getElementById('classRoom').value.trim();
  const color = document.getElementById('classColor').value;

  if (startTime >= endTime) {
    showToast('Start time must be earlier than end time!', 'danger', 3500);
    return;
  }

  const newClass = {
    id: `cls-custom-${Date.now()}`,
    subject,
    code: code || 'COURSE',
    day,
    startTime,
    endTime,
    faculty: faculty || 'Department Faculty',
    room: room || 'Classroom',
    color: color || '#6366f1'
  };

  AppState.schedule.push(newClass);
  saveSchedule(AppState.schedule);

  DOM.addClassForm.reset();
  closeModal(DOM.addClassModal);

  showToast(`Added "${subject}" to ${day}'s timetable!`, 'success', 3500);
  refreshScheduleView();
}

/**
 * Handle Add Countdown Form Submission
 */
function handleAddCountdownSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('cdTitle').value.trim();
  const targetDateVal = document.getElementById('cdTargetDate').value;
  const category = document.getElementById('cdCategory').value;

  const targetDate = new Date(targetDateVal);
  if (isNaN(targetDate.getTime())) {
    showToast('Please select a valid target date and time.', 'danger', 3000);
    return;
  }

  if (targetDate.getTime() <= Date.now()) {
    showToast('Target date & time must be in the future!', 'danger', 3500);
    return;
  }

  const newCountdown = {
    id: `cd-${Date.now()}`,
    title,
    targetDate: targetDate.toISOString(),
    initialTargetDate: targetDate.toISOString(),
    category: category || 'Event',
    isPaused: false,
    pausedRemainingMs: 0,
    isCompleted: false
  };

  AppState.countdowns.push(newCountdown);
  saveCountdowns(AppState.countdowns);

  createCountdownInstance(newCountdown);
  renderCountdownsView();

  DOM.addCountdownForm.reset();
  closeModal(DOM.addCountdownModal);

  showToast(`Created countdown timer for "${title}"!`, 'success', 3500);
}

/**
 * Create a Quick Countdown (e.g. 25-minute Pomodoro or 15-minute Break)
 */
function createQuickCountdown(label, minutes) {
  const targetDate = new Date(Date.now() + minutes * 60 * 1000);

  const newCountdown = {
    id: `cd-quick-${Date.now()}`,
    title: label,
    targetDate: targetDate.toISOString(),
    initialTargetDate: targetDate.toISOString(),
    category: 'Timer',
    isPaused: false,
    pausedRemainingMs: 0,
    isCompleted: false
  };

  AppState.countdowns.unshift(newCountdown);
  saveCountdowns(AppState.countdowns);

  createCountdownInstance(newCountdown);
  renderCountdownsView();

  showToast(`Started ${minutes}-minute timer: "${label}"`, 'info', 3000);

  // Smoothly scroll to countdowns section
  const section = document.getElementById('countdownsSection');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Modal helpers
 */
function openModal(modal) {
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Theme Toggle
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  saveTheme(next);
  updateThemeButtonUI(next);
  showToast(`Switched to ${next} mode`, 'info', 1800);
}

function updateThemeButtonUI(theme) {
  if (!DOM.themeToggleBtn) return;
  DOM.themeToggleBtn.innerHTML = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  DOM.themeToggleBtn.title = `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`;
}

/**
 * Audio Notification Toggle
 */
function toggleAudio() {
  AppState.audioEnabled = !AppState.audioEnabled;
  saveAudioPref(AppState.audioEnabled);
  updateSoundButtonUI();

  if (AppState.audioEnabled) {
    playSyntheticAlert('beep');
    showToast('Audio notifications enabled', 'info', 2000);
  } else {
    showToast('Audio notifications muted', 'info', 2000);
  }
}

function updateSoundButtonUI() {
  if (!DOM.soundToggleBtn) return;
  DOM.soundToggleBtn.innerHTML = AppState.audioEnabled ? '🔔 Sound ON' : '🔕 Muted';
  DOM.soundToggleBtn.classList.toggle('btn-muted', !AppState.audioEnabled);
}

// Start app on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

const state = {
  currentScreen: "home",
  detailOrigin: "home",
  modes: {
    conversation: true,
    sensory: true,
    social: true,
    focus: true,
  },
  settings: {
    modeAlerts: true,
    batteryAlerts: true,
  },
  conversation: {
    intensity: 66,
    sensitivity: 61,
  },
  sensory: {
    intensity: 54,
    sensitivity: 58,
    restAlert: true,
  },
  social: {
    intensity: 57,
    sensitivity: 63,
    noise: true,
    crowd: true,
  },
  focus: {
    color: "mint",
    size: 16,
    brightness: 78,
    position: "between",
    sensitivity: 72,
    speed: 48,
  },
};

const screens = [...document.querySelectorAll(".screen")];
const navButtons = [...document.querySelectorAll("[data-nav]")];
const modeToggles = [...document.querySelectorAll("[data-mode-toggle]")];
const settingToggles = [...document.querySelectorAll("[data-setting-toggle]")];
const booleanToggles = [...document.querySelectorAll("[data-boolean-toggle]")];
const rangeInputs = [...document.querySelectorAll('input[type="range"][data-state-group]')];
const detailTriggers = [...document.querySelectorAll("[data-open-detail]")];
const backButtons = [...document.querySelectorAll("[data-back]")];
const panelToggles = [...document.querySelectorAll("[data-panel-toggle]")];
const hapticButtons = [...document.querySelectorAll("[data-haptic-test]")];
const actionButtons = [...document.querySelectorAll("[data-action]")];
const colorButtons = [...document.querySelectorAll("[data-focus-color]")];
const positionButtons = [...document.querySelectorAll("[data-focus-position]")];

const toast = document.getElementById("toast");
const focusPreview = document.getElementById("focusPreview");
const focusSummary = document.getElementById("focusSummary");
const miniPointPreview = document.querySelector("[data-point-mini-preview]");

let toastTimer = null;

function isBaseScreen(screenName) {
  return ["home", "modes", "records", "settings"].includes(screenName);
}

function navTargetFor(screenName) {
  if (isBaseScreen(screenName)) {
    return screenName;
  }

  return isBaseScreen(state.detailOrigin) ? state.detailOrigin : "modes";
}

function showScreen(screenName) {
  state.currentScreen = screenName;

  screens.forEach((screen) => {
    const active = screen.dataset.screen === screenName;
    screen.classList.toggle("is-active", active);

    if (active) {
      screen.scrollTop = 0;
    }
  });

  const navTarget = navTargetFor(screenName);
  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.nav === navTarget);
  });
}

function openDetail(mode) {
  state.detailOrigin = state.currentScreen;
  showScreen(`detail-${mode}`);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}

function syncMode(mode) {
  const enabled = state.modes[mode];

  document.querySelectorAll(`[data-mode-card="${mode}"]`).forEach((element) => {
    element.classList.toggle("is-off", !enabled);
  });

  document.querySelectorAll(`[data-mode-status="${mode}"]`).forEach((badge) => {
    badge.textContent = enabled ? "활성" : "대기";
  });

  document.querySelectorAll(`[data-mode-toggle="${mode}"]`).forEach((toggle) => {
    toggle.checked = enabled;
  });
}

function updateRangeFill(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value);
  const percent = ((value - min) / (max - min)) * 100;

  input.style.background = `linear-gradient(90deg, #56c8b2 0%, #56c8b2 ${percent}%, rgba(24, 39, 35, 0.08) ${percent}%, rgba(24, 39, 35, 0.08) 100%)`;
}

function formatValue(format, value) {
  if (format === "pixel") {
    return `${value}px`;
  }

  if (format === "percent") {
    return `${value}%`;
  }

  return `${value}`;
}

function updateOutput(input) {
  const output = document.getElementById(input.dataset.output);

  if (!output) {
    return;
  }

  output.textContent = formatValue(input.dataset.format, Number(input.value));
}

function syncSettings() {
  settingToggles.forEach((toggle) => {
    toggle.checked = state.settings[toggle.dataset.settingToggle];
  });
}

function syncBooleans() {
  booleanToggles.forEach((toggle) => {
    const group = toggle.dataset.stateGroup;
    const key = toggle.dataset.stateKey;
    toggle.checked = Boolean(state[group][key]);
  });
}

function initRanges() {
  rangeInputs.forEach((input) => {
    const group = input.dataset.stateGroup;
    const key = input.dataset.stateKey;
    input.value = state[group][key];
    updateRangeFill(input);
    updateOutput(input);
  });
}

function updateFocusPreview() {
  const colors = {
    red: { solid: "#ef6464", soft: "rgba(239, 100, 100, 0.42)", label: "빨강" },
    mint: { solid: "#56c8b2", soft: "rgba(86, 200, 178, 0.42)", label: "민트" },
    white: { solid: "#f5f7f7", soft: "rgba(245, 247, 247, 0.52)", label: "하양" },
    yellow: { solid: "#f0cf64", soft: "rgba(240, 207, 100, 0.42)", label: "노랑" },
    blue: { solid: "#6ca5f5", soft: "rgba(108, 165, 245, 0.42)", label: "파랑" },
  };

  const positions = {
    nose: { x: "50%", y: "50%", label: "코 주변" },
    between: { x: "50%", y: "39%", label: "눈 사이" },
    center: { x: "50%", y: "47%", label: "정면 중앙" },
  };

  const color = colors[state.focus.color];
  const position = positions[state.focus.position];
  const brightness = state.focus.brightness;
  const speed = state.focus.speed;
  const size = state.focus.size;
  const duration = Math.max(1.6, 6 - speed * 0.05);

  focusPreview.style.setProperty("--point-color", color.solid);
  focusPreview.style.setProperty("--point-soft", color.soft);
  focusPreview.style.setProperty("--point-size", `${size}px`);
  focusPreview.style.setProperty("--point-opacity", `${Math.max(0.35, brightness / 100)}`);
  focusPreview.style.setProperty("--point-glow", `${8 + Math.round(brightness / 6)}px`);
  focusPreview.style.setProperty("--point-x", position.x);
  focusPreview.style.setProperty("--point-y", position.y);
  focusPreview.style.setProperty("--point-speed", `${duration}s`);

  focusSummary.textContent = `${color.label} · ${position.label}`;

  colorButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.focusColor === state.focus.color);
  });

  positionButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.focusPosition === state.focus.position);
  });
}

function playHaptic(target) {
  const demo = document.querySelector(`[data-haptic-demo="${target}"]`);

  if (demo) {
    demo.classList.remove("is-playing");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        demo.classList.add("is-playing");
      });
    });

    window.setTimeout(() => {
      demo.classList.remove("is-playing");
    }, 2900);
  }

  if ("vibrate" in navigator) {
    navigator.vibrate([80, 40, 110]);
  }

  showToast("햅틱 테스트를 실행했어요.");
}

function playPointTest() {
  focusPreview.classList.remove("is-testing");
  miniPointPreview?.classList.remove("is-testing");

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      focusPreview.classList.add("is-testing");
    });
  });

  window.setTimeout(() => {
    focusPreview.classList.remove("is-testing");
  }, 2200);

  showToast("포인트 움직임을 테스트하고 있어요.");
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.nav);
  });
});

detailTriggers.forEach((trigger) => {
  const handleOpen = () => openDetail(trigger.dataset.openDetail);

  trigger.addEventListener("click", (event) => {
    if (event.target.closest(".switch")) {
      return;
    }

    handleOpen();
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  });
});

backButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(state.detailOrigin || "home");
  });
});

modeToggles.forEach((toggle) => {
  toggle.addEventListener("change", () => {
    const mode = toggle.dataset.modeToggle;
    state.modes[mode] = toggle.checked;
    syncMode(mode);

    const label = document.querySelector(`[data-mode-card="${mode}"] h3`)?.textContent || "모드";
    showToast(`${label}가 ${toggle.checked ? "활성화" : "대기"}되었어요.`);
  });
});

settingToggles.forEach((toggle) => {
  toggle.addEventListener("change", () => {
    const key = toggle.dataset.settingToggle;
    state.settings[key] = toggle.checked;
    syncSettings();
    showToast("알림 설정을 업데이트했어요.");
  });
});

booleanToggles.forEach((toggle) => {
  toggle.addEventListener("change", () => {
    const group = toggle.dataset.stateGroup;
    const key = toggle.dataset.stateKey;
    state[group][key] = toggle.checked;
    syncBooleans();
    showToast("세부 옵션을 반영했어요.");
  });
});

rangeInputs.forEach((input) => {
  input.addEventListener("input", () => {
    const group = input.dataset.stateGroup;
    const key = input.dataset.stateKey;
    state[group][key] = Number(input.value);
    updateRangeFill(input);
    updateOutput(input);

    if (group === "focus") {
      updateFocusPreview();
    }
  });
});

panelToggles.forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.querySelector(`[data-panel="${button.dataset.panelToggle}"]`);

    if (!panel) {
      return;
    }

    panel.classList.toggle("is-open");
  });
});

hapticButtons.forEach((button) => {
  button.addEventListener("click", () => {
    playHaptic(button.dataset.hapticTest);
  });
});

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "reconnect") {
      showToast("연결 상태를 다시 확인했어요.");
      return;
    }

    if (action === "point-test") {
      if (state.currentScreen !== "detail-focus") {
        state.detailOrigin = state.currentScreen;
        showScreen("detail-focus");
      }

      playPointTest();
    }
  });
});

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.focus.color = button.dataset.focusColor;
    updateFocusPreview();
  });
});

positionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.focus.position = button.dataset.focusPosition;
    updateFocusPreview();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.currentScreen.startsWith("detail-")) {
    showScreen(state.detailOrigin || "home");
  }
});

["conversation", "sensory", "social", "focus"].forEach(syncMode);
syncSettings();
syncBooleans();
initRanges();
updateFocusPreview();

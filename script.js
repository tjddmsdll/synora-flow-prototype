const screens = [...document.querySelectorAll(".screen")];
const navItems = [...document.querySelectorAll(".nav-item")];
const jumpButtons = [...document.querySelectorAll("[data-target-screen]")];
const modeToggles = [...document.querySelectorAll("[data-toggle]")];
const sliders = [...document.querySelectorAll("[data-slider]")];

const settingsSheet = document.getElementById("settingsSheet");
const openSettingsButton = document.getElementById("openSettings");
const closeSettingsButton = document.getElementById("closeSettings");
const closeSettingsBackdrop = document.getElementById("closeSettingsBackdrop");
const privacyShortcut = document.getElementById("privacyShortcut");
const phrasePreview = document.querySelector(".display-message");
const phraseList = document.querySelector(".phrase-list");
const phraseEditor = document.getElementById("phraseEditor");
const phraseEditorLabel = document.getElementById("phraseEditorLabel");
const phraseEditorTitle = document.getElementById("phraseEditorTitle");
const phraseEditorState = document.getElementById("phraseEditorState");
const phraseEditorHint = document.getElementById("phraseEditorHint");
const phraseInput = document.getElementById("phraseInput");
const editPhraseButton = document.getElementById("editPhraseButton");
const addPhraseButton = document.getElementById("addPhraseButton");
const cancelPhraseEditButton = document.getElementById("cancelPhraseEdit");
const savePhraseEditButton = document.getElementById("savePhraseEdit");
const hapticPreviewButtons = [...document.querySelectorAll("[data-preview-trigger]")];
const testHapticButton = document.getElementById("testHaptic");
const testFeedback = document.getElementById("testFeedback");
const strengthTestVisual = document.getElementById("strengthTestVisual");
const strengthTestTitle = document.getElementById("strengthTestTitle");

const strengthLabelMap = {
  1: "약하게",
  2: "보통",
  3: "강하게",
};

const strengthTargetMap = {
  master: "전체 진동 세기",
  conversation: "대화 흐름 모드 세기",
  sensory: "감각 안정 모드 세기",
  social: "사회 환경 적응 모드 세기",
};

const state = {
  activeScreen: "home",
  privacyEnabled: true,
  sliders: {
    master: 2,
    conversation: 2,
    sensory: 2,
    social: 2,
  },
  phraseEditorMode: null,
  selectedPhraseButton: document.querySelector(".phrase-card.selected"),
  activeStrengthTarget: "master",
};

function activateScreen(screenName) {
  if (screenName === state.activeScreen) {
    return;
  }

  state.activeScreen = screenName;

  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === screenName);
  });

  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.targetScreen === screenName);
  });
}

function openSettings() {
  settingsSheet.classList.add("open");
  settingsSheet.setAttribute("aria-hidden", "false");
}

function closeSettings() {
  settingsSheet.classList.remove("open");
  settingsSheet.setAttribute("aria-hidden", "true");
}

function selectPhrase(button) {
  const phraseButtons = [...document.querySelectorAll(".phrase-card")];
  phraseButtons.forEach((card) => card.classList.remove("selected"));
  button.classList.add("selected");
  state.selectedPhraseButton = button;
  phrasePreview.textContent = button.dataset.phrase;
}

function bindPhraseCard(button) {
  button.addEventListener("click", () => {
    selectPhrase(button);
  });
}

function openPhraseEditor(mode) {
  state.phraseEditorMode = mode;
  phraseEditor.hidden = false;

  if (mode === "edit") {
    phraseEditorLabel.textContent = "Phrase Edit";
    phraseEditorTitle.textContent = "선택한 문구 다듬기";
    phraseEditorState.textContent = "Edit";
    phraseEditorHint.textContent =
      "선택한 문구를 조금 더 나에게 맞는 표현으로 바꿔볼 수 있어요.";
    phraseInput.value = state.selectedPhraseButton?.dataset.phrase ?? "";
  } else {
    phraseEditorLabel.textContent = "Custom Phrase";
    phraseEditorTitle.textContent = "새 맞춤 문구 추가";
    phraseEditorState.textContent = "Add";
    phraseEditorHint.textContent =
      "내가 편안하게 꺼낼 수 있는 짧고 선명한 문구를 새로 추가해 보세요.";
    phraseInput.value = "";
  }

  phraseInput.focus();
}

function closePhraseEditor() {
  phraseEditor.hidden = true;
  state.phraseEditorMode = null;
  phraseInput.value = "";
}

function createPhraseCard(phraseText) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "phrase-card";
  button.dataset.phrase = phraseText;
  button.textContent = phraseText;
  bindPhraseCard(button);
  return button;
}

function runHapticPreview(previewKey) {
  const visual = document.querySelector(`[data-preview="${previewKey}"]`);
  if (!visual) {
    return;
  }

  visual.classList.remove("is-previewing");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      visual.classList.add("is-previewing");
    });
  });

  window.setTimeout(() => {
    visual.classList.remove("is-previewing");
  }, 2200);
}

function updateStrengthPreviewSummary() {
  const key = state.activeStrengthTarget;
  const level = state.sliders[key];
  const strengthLabel = strengthLabelMap[level];

  if (strengthTestVisual) {
    strengthTestVisual.classList.remove("strength-level-1", "strength-level-2", "strength-level-3");
    strengthTestVisual.classList.add(`strength-level-${level}`);
  }

  if (strengthTestTitle) {
    strengthTestTitle.textContent = `${strengthTargetMap[key]} · ${strengthLabel}`;
  }

  if (testFeedback) {
    testFeedback.textContent = `${strengthTargetMap[key]}가 ${strengthLabel} 단계로 선택되어 있어요.`;
  }
}

function updateSliderPresentation(slider) {
  const key = slider.dataset.slider;
  const level = Number(slider.value);
  const fillPercent = ((level - 1) / 2) * 100;
  const strengthLabel = strengthLabelMap[level];

  state.sliders[key] = level;

  slider.style.background = `linear-gradient(90deg, rgba(128, 207, 194, 0.95) 0%, rgba(128, 207, 194, 0.95) ${fillPercent}%, rgba(168, 225, 215, 0.22) ${fillPercent}%, rgba(168, 225, 215, 0.22) 100%)`;

  const valueEl = document.querySelector(`[data-slider-value="${key}"]`);
  if (valueEl) {
    valueEl.textContent = strengthLabel;
  }

  if (key === "master") {
    const hapticCard = document.querySelector(".status-card:nth-child(3) strong");
    if (hapticCard) {
      hapticCard.textContent = strengthLabel;
    }
  }

  updateStrengthPreviewSummary();
}

jumpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const screenName = button.dataset.targetScreen;
    if (screenName) {
      activateScreen(screenName);
    }
  });
});

modeToggles.forEach((toggle) => {
  toggle.addEventListener("change", () => {
    const key = toggle.dataset.toggle;

    if (key === "privacy") {
      state.privacyEnabled = toggle.checked;
      const privacyCard = [...document.querySelectorAll(".status-card")].find((card) =>
        card.textContent.includes("프라이버시")
      );

      if (privacyCard) {
        privacyCard.querySelector("strong").textContent = toggle.checked ? "보호됨" : "열림";
        privacyCard.querySelector("small").textContent = toggle.checked
          ? "로컬 우선 저장"
          : "표시 정보 확대";
      }

      return;
    }

    const modeCard = document.querySelector(`.mode-card[data-mode="${key}"]`);
    if (!modeCard) {
      return;
    }

    modeCard.classList.toggle("active", toggle.checked);

    if (toggle.checked) {
      document.querySelector(".main-mode-card h3").textContent =
        `현재 모드: ${modeCard.querySelector("h3").textContent}`;
      document.querySelector(".main-mode-card .feature-copy").textContent =
        modeCard.querySelector(".mode-topline p").textContent;
      document.querySelector(".status-card:nth-child(2) strong").textContent =
        modeCard.querySelector("h3").textContent.replace(" 모드", "");
    }
  });
});

sliders.forEach((slider) => {
  const key = slider.dataset.slider;

  ["focus", "click"].forEach((eventName) => {
    slider.addEventListener(eventName, () => {
      state.activeStrengthTarget = key;
      updateStrengthPreviewSummary();
    });
  });

  slider.addEventListener("input", () => {
    state.activeStrengthTarget = key;
    updateSliderPresentation(slider);
  });
});

sliders.forEach((slider) => {
  updateSliderPresentation(slider);
});

[...document.querySelectorAll(".phrase-card")].forEach(bindPhraseCard);

editPhraseButton.addEventListener("click", () => {
  openPhraseEditor("edit");
});

addPhraseButton.addEventListener("click", () => {
  openPhraseEditor("add");
});

cancelPhraseEditButton.addEventListener("click", () => {
  closePhraseEditor();
});

savePhraseEditButton.addEventListener("click", () => {
  const nextPhrase = phraseInput.value.trim();
  if (!nextPhrase) {
    phraseInput.focus();
    return;
  }

  if (state.phraseEditorMode === "edit" && state.selectedPhraseButton) {
    state.selectedPhraseButton.dataset.phrase = nextPhrase;
    state.selectedPhraseButton.textContent = nextPhrase;
    selectPhrase(state.selectedPhraseButton);
  }

  if (state.phraseEditorMode === "add") {
    const button = createPhraseCard(nextPhrase);
    phraseList.appendChild(button);
    selectPhrase(button);
  }

  closePhraseEditor();
});

hapticPreviewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    runHapticPreview(button.dataset.previewTrigger);
  });
});

if (testHapticButton && testFeedback) {
  testHapticButton.addEventListener("click", () => {
    testHapticButton.textContent = "테스트 중...";
    updateStrengthPreviewSummary();
    testFeedback.textContent = `${strengthTargetMap[state.activeStrengthTarget]}의 선택된 강도를 시각적으로 미리보고 있어요.`;
    testHapticButton.disabled = true;

    if (strengthTestVisual) {
      strengthTestVisual.classList.remove("is-testing");
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          strengthTestVisual.classList.add("is-testing");
        });
      });
    }

    window.setTimeout(() => {
      testHapticButton.textContent = "진동 테스트";
      if (strengthTestVisual) {
        strengthTestVisual.classList.remove("is-testing");
      }
      updateStrengthPreviewSummary();
      testHapticButton.disabled = false;
    }, 1700);
  });
}

[openSettingsButton, privacyShortcut].forEach((button) => {
  button.addEventListener("click", openSettings);
});

[closeSettingsButton, closeSettingsBackdrop].forEach((element) => {
  element.addEventListener("click", closeSettings);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSettings();
    closePhraseEditor();
  }
});

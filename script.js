/**
 * Google Start Page - JavaScript
 * Features:
 * - Real-time Weather for Seoul & Jeju (Open-Meteo API)
 * - Google Search Engine Integration (Text & Voice Search, I'm Feeling Lucky)
 * - Quotes of the Day (Korean curated quotes, copy & refresh)
 * - Live Clock & Korean Date Display
 * - Dark / Light Theme Toggle with LocalStorage persistence
 */

// ==========================================================================
// 1. Curated Quotes Database (명언 모음집)
// ==========================================================================
const QUOTES = [
  { text: "시작이 반이다.", author: "아리스토텔레스" },
  { text: "오늘 할 수 있는 일에 온 힘을 다하라. 그러면 내일은 한 걸음 더 나아갈 것이다.", author: "아이작 뉴턴" },
  { text: "실패를 두려워하지 마라. 실패는 성공으로 가는 길목에 놓인 이정표일 뿐이다.", author: "토머스 에디슨" },
  { text: "꿈을 이룰 수 있는 가장 좋은 방법은 깨어나는 것이다.", author: "폴 발레리" },
  { text: "위대한 일을 하는 유일한 방법은 당신이 하는 일을 사랑하는 것이다.", author: "스티브 잡스" },
  { text: "바람이 불지 않을 때 바람개비를 돌리는 방법은 앞으로 달려가는 것이다.", author: "데일 카네기" },
  { text: "천 리 길도 한 걸음부터.", author: "노자" },
  { text: "우리가 두려워해야 할 유일한 것은 두려움 그 자체다.", author: "프랭클린 D. 루스벨트" },
  { text: "어제와 똑같이 살면서 다른 미래를 기대하는 것은 정신병 초기증세다.", author: "알베르트 아인슈타인" },
  { text: "배움은 끝이 없으며, 배움을 멈추는 순간 늙기 시작한다.", author: "헨리 포드" },
  { text: "산은 올라가는 자에게만 정상을 허락한다.", author: "미상" },
  { text: "가장 어두운 밤도 언젠가는 끝나고 해는 떠오른다.", author: "빅토르 위고" },
  { text: "지혜로운 사람은 행동으로 말을 증명하고, 어리석은 사람은 말로 행동을 대신한다.", author: "공자" },
  { text: "행복은 이미 완성된 것이 아니라, 당신의 행동으로부터 비롯된다.", author: "달라이 라마" },
  { text: "기회는 준비된 자에게 찾아온다.", author: "루이 파스퇴르" },
  { text: "당신이 할 수 있다고 믿든 할 수 없다고 믿든, 믿는 대로 될 것이다.", author: "헨리 포드" },
  { text: "길을 아는 것과 그 길을 걷는 것은 분명히 다르다.", author: "영화 매트릭스 중" },
  { text: "모든 어려움의 한가운데에는 기회가 숨겨져 있다.", author: "알베르트 아인슈타인" },
  { text: "자신을 이기는 자가 가장 강한 사람이다.", author: "노자" },
  { text: "한 번의 실천이 천 마디의 말보다 낫다.", author: "마하트마 간디" },
  { text: "인생이란 자신을 찾는 것이 아니라, 자신을 창조하는 과정이다.", author: "조지 버나드 쇼" },
  { text: "지속적인 긍정적 태도는 당신의 모든 노력을 배가시킨다.", author: "콜린 파월" }
];

// ==========================================================================
// 2. Weather Code Mapping (WMO Code to Korean & Icon)
// ==========================================================================
function getWeatherDetails(code) {
  switch (code) {
    case 0:
      return { text: "맑음", icon: "☀️" };
    case 1:
      return { text: "대체로 맑음", icon: "🌤️" };
    case 2:
      return { text: "구름 조금", icon: "⛅" };
    case 3:
      return { text: "흐림", icon: "☁️" };
    case 45:
    case 48:
      return { text: "안개 주의", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { text: "약한 이슬비", icon: "🌦️" };
    case 61:
    case 63:
    case 65:
      return { text: "비", icon: "🌧️" };
    case 66:
    case 67:
      return { text: "진눈깨비", icon: "🌨️" };
    case 71:
    case 73:
    case 75:
    case 77:
      return { text: "눈", icon: "❄️" };
    case 80:
    case 81:
    case 82:
      return { text: "소나기", icon: "🌦️" };
    case 85:
    case 86:
      return { text: "눈 소나기", icon: "🌨️" };
    case 95:
    case 96:
    case 99:
      return { text: "천둥번개 / 뇌우", icon: "⛈️" };
    default:
      return { text: "구름 많음", icon: "🌤️" };
  }
}

// Weather Locations (위도, 경도)
const LOCATIONS = {
  seoul: {
    name: "서울",
    lat: 37.5665,
    lon: 126.9780,
    tempEl: document.getElementById("temp-seoul"),
    iconEl: document.getElementById("icon-seoul"),
    descEl: document.getElementById("desc-seoul"),
    apparentEl: document.getElementById("apparent-seoul"),
    humidityEl: document.getElementById("humidity-seoul"),
    windEl: document.getElementById("wind-seoul")
  },
  jeju: {
    name: "제주",
    lat: 33.4996,
    lon: 126.5312,
    tempEl: document.getElementById("temp-jeju"),
    iconEl: document.getElementById("icon-jeju"),
    descEl: document.getElementById("desc-jeju"),
    apparentEl: document.getElementById("apparent-jeju"),
    humidityEl: document.getElementById("humidity-jeju"),
    windEl: document.getElementById("wind-jeju")
  }
};

/**
 * Open-Meteo API에서 날씨 정보 비동기 호출
 */
async function fetchWeatherData(locKey) {
  const loc = LOCATIONS[locKey];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia%2FTokyo`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const current = data.current;

    const weatherInfo = getWeatherDetails(current.weather_code);

    // DOM 업데이트
    loc.tempEl.textContent = Math.round(current.temperature_2m);
    loc.iconEl.textContent = weatherInfo.icon;
    loc.descEl.textContent = weatherInfo.text;
    loc.apparentEl.textContent = `${Math.round(current.apparent_temperature)}°`;
    loc.humidityEl.textContent = `${current.relative_humidity_2m}%`;
    loc.windEl.textContent = `${Math.round(current.wind_speed_10m)}km/h`;
  } catch (err) {
    console.error(`[Weather Error] ${loc.name} 날씨 로드 실패:`, err);
    loc.descEl.textContent = "날씨 정보 연결 불가";
    loc.tempEl.textContent = "--";
  }
}

/**
 * 서울과 제주 날씨를 모두 갱신
 */
function refreshAllWeather() {
  const refreshBtn = document.getElementById("refresh-weather");
  if (refreshBtn) refreshBtn.classList.add("spinning");

  Promise.all([fetchWeatherData("seoul"), fetchWeatherData("jeju")])
    .then(() => {
      showToast("날씨 정보가 갱신되었습니다.");
    })
    .catch(() => {
      showToast("날씨 정보를 가져오는 중 문제가 발생했습니다.");
    })
    .finally(() => {
      if (refreshBtn) {
        setTimeout(() => refreshBtn.classList.remove("spinning"), 500);
      }
    });
}

// ==========================================================================
// 3. Clock & Date Display (실시간 디지털 시계 및 날짜)
// ==========================================================================
function updateClock() {
  const now = new Date();

  // 시간 표시 (HH:MM:SS)
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timeEl = document.getElementById("current-time");
  if (timeEl) timeEl.textContent = `${hours}:${minutes}:${seconds}`;

  // 날짜 표시 (YYYY년 M월 D일 요일)
  const daysOfWeek = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const dayName = daysOfWeek[now.getDay()];

  const dateEl = document.getElementById("current-date");
  if (dateEl) dateEl.textContent = `${year}년 ${month}월 ${date}일 (${dayName})`;
}

// ==========================================================================
// 4. Quotes Generator (오늘의 명언)
// ==========================================================================
let currentQuote = null;

function displayRandomQuote() {
  const quoteTextEl = document.getElementById("quote-text");
  const quoteAuthorEl = document.getElementById("quote-author");
  const newQuoteBtn = document.getElementById("new-quote-btn");

  if (!quoteTextEl || !quoteAuthorEl) return;

  if (newQuoteBtn) newQuoteBtn.classList.add("spinning");

  // 페이드 아웃 애니메이션
  quoteTextEl.style.opacity = "0";
  quoteAuthorEl.style.opacity = "0";

  setTimeout(() => {
    // 이전 명언과 다른 새 명언 선택
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * QUOTES.length);
    } while (QUOTES.length > 1 && QUOTES[nextIndex] === currentQuote);

    currentQuote = QUOTES[nextIndex];
    quoteTextEl.textContent = `"${currentQuote.text}"`;
    quoteAuthorEl.textContent = `— ${currentQuote.author}`;

    // 페이드 인
    quoteTextEl.style.opacity = "1";
    quoteAuthorEl.style.opacity = "1";

    if (newQuoteBtn) {
      setTimeout(() => newQuoteBtn.classList.remove("spinning"), 400);
    }
  }, 250);
}

function copyCurrentQuote() {
  if (!currentQuote) return;
  const textToCopy = `"${currentQuote.text}" — ${currentQuote.author}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => showToast("명언이 클립보드에 복사되었습니다!"))
      .catch(() => fallbackCopy(textToCopy));
  } else {
    fallbackCopy(textToCopy);
  }
}

function fallbackCopy(text) {
  const tempInput = document.createElement("textarea");
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  try {
    document.execCommand("copy");
    showToast("명언이 클립보드에 복사되었습니다!");
  } catch (e) {
    showToast("복사에 실패했습니다.");
  }
  document.body.removeChild(tempInput);
}

// ==========================================================================
// 5. Search Engine & Controls (구글 검색창 로직)
// ==========================================================================
function setupSearch() {
  const searchForm = document.getElementById("google-search-form");
  const searchInput = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-search-btn");
  const voiceBtn = document.getElementById("voice-search-btn");
  const luckyBtn = document.getElementById("lucky-btn");

  // 검색창 입력 상태에 따른 Clear(X) 버튼 토글
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim().length > 0) {
      clearBtn.classList.remove("hidden");
    } else {
      clearBtn.classList.add("hidden");
    }
  });

  // Clear 버튼 클릭 시 입력 지우고 포커스
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.add("hidden");
    searchInput.focus();
  });

  // 폼 제출 이벤트
  searchForm.addEventListener("submit", (e) => {
    const query = searchInput.value.trim();
    if (!query) {
      e.preventDefault();
      searchInput.focus();
      return;
    }
    // URL 형식인 경우 바로 이동 편의 제공
    if (/^(http|https):\/\/[^ "]+$/.test(query)) {
      e.preventDefault();
      window.location.href = query;
    }
  });

  // I'm Feeling Lucky 버튼 이벤트
  if (luckyBtn) {
    luckyBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        // 구글 운 좋은 예감 검색 이동
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}&btnI=1`;
      } else {
        // 검색어가 없을 시 Google Doodles 페이지로 이동
        window.location.href = "https://doodles.google/";
      }
    });
  }

  // 음성 검색 (Web Speech API)
  if (voiceBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.interimResults = false;

      voiceBtn.addEventListener("click", () => {
        showToast("음성을 듣고 있습니다... 말씀해주세요.");
        voiceBtn.style.color = "var(--google-red)";
        recognition.start();
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        clearBtn.classList.remove("hidden");
        voiceBtn.style.color = "";
        showToast(`인식됨: "${transcript}"`);
        // 검색창 포커스
        searchInput.focus();
      };

      recognition.onerror = (event) => {
        voiceBtn.style.color = "";
        showToast("음성 인식에 실패했습니다. 다시 시도해주세요.");
      };

      recognition.onend = () => {
        voiceBtn.style.color = "";
      };
    } else {
      voiceBtn.addEventListener("click", () => {
        showToast("이 브라우저는 음성 인식을 지원하지 않습니다.");
      });
    }
  }
}

// ==========================================================================
// 6. Theme Toggle (다크 / 라이트 모드)
// ==========================================================================
function setupTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = themeToggle ? themeToggle.querySelector(".theme-icon") : null;

  // 저장된 테마 또는 시스템 기본 설정 확인
  const savedTheme = localStorage.getItem("google_start_theme");
  const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem("google_start_theme", nextTheme);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeIcon) {
      themeIcon.textContent = theme === "dark" ? "light_mode" : "dark_mode";
      themeToggle.setAttribute("title", theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환");
    }
  }
}

// ==========================================================================
// 7. Toast Notification Utility (토스트 메시지)
// ==========================================================================
let toastTimeout = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// ==========================================================================
// 8. Initialization (초기 실행)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 테마 초기화
  setupTheme();

  // 시계 시작
  updateClock();
  setInterval(updateClock, 1000);

  // 검색창 초기화
  setupSearch();

  // 날씨 가져오기 (초기 로드 및 새로고침 버튼 바인딩)
  refreshAllWeather();
  const refreshWeatherBtn = document.getElementById("refresh-weather");
  if (refreshWeatherBtn) {
    refreshWeatherBtn.addEventListener("click", refreshAllWeather);
  }
  // 15분마다 날씨 자동 갱신
  setInterval(refreshAllWeather, 15 * 60 * 1000);

  // 명언 초기화
  displayRandomQuote();
  const newQuoteBtn = document.getElementById("new-quote-btn");
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener("click", displayRandomQuote);
  }
  const copyQuoteBtn = document.getElementById("copy-quote-btn");
  if (copyQuoteBtn) {
    copyQuoteBtn.addEventListener("click", copyCurrentQuote);
  }
});

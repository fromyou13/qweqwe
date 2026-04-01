function updateCount() {
  const text = document.getElementById("textInput").value;

  // 공백 포함 글자수
  document.getElementById("withSpace").textContent = text.length.toLocaleString();

  // 공백 제외 글자수
  const noSpace = text.replace(/\s/g, "");
  document.getElementById("withoutSpace").textContent = noSpace.length.toLocaleString();
}

function copyText() {
  const text = document.getElementById("textInput").value;
  if (!text) {
    showToast("복사할 글이 없습니다");
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast("복사 완료!");
    })
    .catch(() => {
      showToast("복사 실패");
    });
}

function clearText() {
  const textInput = document.getElementById("textInput");
  if (!textInput.value) {
    showToast("지울 글이 없습니다");
    return;
  }
  // 모달 표시
  document.getElementById("modalOverlay").classList.add("show");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("show");
}

function confirmClear() {
  document.getElementById("textInput").value = "";
  updateCount();
  closeModal();
  showToast("글 초기화 완료!");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// 이벤트 리스너 등록
document.getElementById("textInput").addEventListener("input", updateCount);

// 모달 배경 클릭 시 닫기
document.getElementById("modalOverlay").addEventListener("click", function (e) {
  if (e.target === this) {
    closeModal();
  }
});

// 초기 실행
updateCount();

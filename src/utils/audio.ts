export function playSound(type: "correct" | "wrong" | "pack" | "win") {
  let url = "";
  
  switch (type) {
    case "correct":
      // صوت إجابة صحيحة (نجاح)
      url = "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3";
      break;
    case "wrong":
      // صوت إجابة خاطئة (خطأ)
      url = "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3";
      break;
    case "pack":
      // صوت فتح باك (سحر / تشويق)
      url = "https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3";
      break;
    case "win":
      // صوت فوز (جمهور بيهتف)
      url = "https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3";
      break;
  }

  const audio = new Audio(url);
  audio.volume = 0.5; // تقدر تتحكم في الصوت من هنا
  audio.play().catch((e) => console.log("Audio play failed:", e));
}
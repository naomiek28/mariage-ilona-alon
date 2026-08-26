/* =========================================
   GOOGLE SHEETS
   ========================================= */

const googleScriptUrl =
  "https://script.google.com/macros/s/AKfycbxylv2YUyPssrzcc2WemS0XBZmtP3du4qBtdVrAQEsfMiL6b8NMiiKK2JP81KxG7jxeoQ/exec";

/* =========================================
   ÉLÉMENTS
   ========================================= */

const pageLoader =
  document.getElementById("pageLoader");

const openEnvelope =
  document.getElementById("openEnvelope");

const weddingMusic =
  document.getElementById("weddingMusic");

const musicToggle =
  document.getElementById("musicToggle");

const calendarLink =
  document.getElementById("calendarLink");

const appleCalendarLink =
  document.getElementById("appleCalendarLink");

const rsvpForm =
  document.getElementById("rsvpForm");

/* =========================================
   INFORMATIONS
   ========================================= */

const weddingDate =
  new Date("2026-10-27T18:30:00+02:00");

/*
  1 minute 14 secondes = 74 secondes.
*/

const musicEndTime = 74;

let invitationOpened = false;

let musicReachedEnd = false;

/* =========================================
   OUTILS
   ========================================= */

function preloadImage(source) {
  return new Promise((resolve) => {
    const image =
      new Image();

    image.onload =
      resolve;

    image.onerror =
      resolve;

    image.src =
      source;
  });
}

/* =========================================
   POLICES
   ========================================= */

function preloadFonts() {
  if (!document.fonts) {
    return Promise.resolve();
  }

  return Promise.allSettled([
    document.fonts.load(
      '400 40px "Allura"'
    ),

    document.fonts.load(
      '400 30px "Great Vibes"'
    ),

    document.fonts.load(
      '400 20px "Cormorant Garamond"'
    ),

    document.fonts.load(
      '500 17px "Frank Ruhl Libre"'
    ),

    document.fonts.load(
      '300 20px "Heebo"'
    ),

    document.fonts.load(
      '500 13px "Montserrat"'
    )
  ]);
}

/* =========================================
   PRÉCHARGEMENT AUDIO
   ========================================= */

function preloadAudio() {
  return new Promise((resolve) => {
    if (!weddingMusic) {
      resolve();

      return;
    }

    if (
      weddingMusic.readyState >= 2
    ) {
      resolve();

      return;
    }

    let finished =
      false;

    function finish() {
      if (finished) {
        return;
      }

      finished =
        true;

      weddingMusic.removeEventListener(
        "loadeddata",
        finish
      );

      weddingMusic.removeEventListener(
        "canplaythrough",
        finish
      );

      weddingMusic.removeEventListener(
        "error",
        finish
      );

      resolve();
    }

    weddingMusic.addEventListener(
      "loadeddata",
      finish,
      { once: true }
    );

    weddingMusic.addEventListener(
      "canplaythrough",
      finish,
      { once: true }
    );

    weddingMusic.addEventListener(
      "error",
      finish,
      { once: true }
    );

    setTimeout(
      finish,
      3500
    );

    try {
      weddingMusic.load();
    } catch (error) {
      finish();
    }
  });
}

/* =========================================
   LOADER
   ========================================= */

function initializePageLoader() {
  Promise.allSettled([
    preloadImage(
      "images/background-envelope.jpeg"
    ),

    preloadImage(
      "images/background-invitation.jpeg"
    ),

    preloadImage(
      "images/enveloppe.png"
    ),

    preloadImage(
      "images/logo.png"
    ),

    preloadFonts(),

    preloadAudio()
  ]).catch(() => {});

  /*
    Logo :
    4 secondes de remplissage
    + environ 1 seconde complet.
  */

  setTimeout(() => {
    document.body.classList.add(
      "loader-finished"
    );

    document.body.classList.remove(
      "is-loading"
    );

    setTimeout(() => {
      if (pageLoader) {
        pageLoader.remove();
      }
    }, 800);
  }, 5000);
}

/* =========================================
   MUSIQUE
   ========================================= */

/*
  Remet la chanson au début.
*/

function resetMusicToStart() {
  if (!weddingMusic) {
    return;
  }

  try {
    weddingMusic.currentTime =
      0;

    musicReachedEnd =
      false;
  } catch (error) {
    /* rien */
  }
}

/*
  Lance la chanson depuis 0:00
  lors de l'ouverture de l'enveloppe.
*/

function playMusicFromStart() {
  if (!weddingMusic) {
    return;
  }

  musicReachedEnd =
    false;

  /*
    On revient au tout début.
  */

  try {
    weddingMusic.currentTime =
      0;
  } catch (error) {
    /* rien */
  }

  const playPromise =
    weddingMusic.play();

  if (
    playPromise &&
    typeof playPromise.then ===
      "function"
  ) {
    playPromise
      .then(() => {
        updateMusicButton();
      })
      .catch(() => {
        updateMusicButton();
      });
  }
}

/*
  Bouton musique.
*/

function toggleMusic() {
  if (!weddingMusic) {
    return;
  }

  if (weddingMusic.paused) {
    /*
      Si elle s'est arrêtée automatiquement
      à 1:14, un nouveau clic recommence
      depuis le début.
    */

    if (
      musicReachedEnd ||
      weddingMusic.currentTime >=
        musicEndTime
    ) {
      resetMusicToStart();
    }

    const playPromise =
      weddingMusic.play();

    if (
      playPromise &&
      typeof playPromise.then ===
        "function"
    ) {
      playPromise
        .then(
          updateMusicButton
        )
        .catch(
          updateMusicButton
        );
    }
  } else {
    /*
      Pause manuelle.

      Ici on NE remet PAS la musique
      à zéro afin qu'un clic suivant
      reprenne au même endroit.
    */

    weddingMusic.pause();

    updateMusicButton();
  }
}

/*
  Icône du bouton.
*/

function updateMusicButton() {
  if (
    !musicToggle ||
    !weddingMusic
  ) {
    return;
  }

  musicToggle.textContent =
    weddingMusic.paused
      ? "♪"
      : "Ⅱ";

  musicToggle.setAttribute(
    "aria-label",
    weddingMusic.paused
      ? "Lancer la musique"
      : "Mettre la musique en pause"
  );
}

/*
  Arrêt automatique à exactement
  1:14 = 74 secondes.
*/

function checkMusicEnd() {
  if (!weddingMusic) {
    return;
  }

  if (
    weddingMusic.currentTime >=
    musicEndTime
  ) {
    weddingMusic.pause();

    /*
      On garde 74 comme position
      pour savoir que la chanson
      a atteint sa limite.
    */

    try {
      weddingMusic.currentTime =
        musicEndTime;
    } catch (error) {
      /* rien */
    }

    musicReachedEnd =
      true;

    updateMusicButton();
  }
}

/* =========================================
   OUVERTURE INVITATION
   ========================================= */

function openInvitation() {
  if (invitationOpened) {
    return;
  }

  invitationOpened =
    true;

  /*
    La musique démarre immédiatement
    à 0:00 grâce au clic utilisateur.
  */

  playMusicFromStart();

  document.body.classList.add(
    "invitation-open"
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  setTimeout(() => {
    revealVisibleElements();
  }, 150);
}

/* =========================================
   CALENDRIER
   ========================================= */

function createCalendarLinks() {
  const startDate =
    "20261027T154500Z";

  const endDate =
    "20261027T213000Z";

  const title =
    encodeURIComponent(
      "Mariage Ilona & Alon"
    );

  const details =
    encodeURIComponent(
      "Kabalat Panim à 17h45. " +
      "Houppa à 18h30 précises."
    );

  const location =
    encodeURIComponent(
      "Sakoya Event Hall, " +
      "Maale HaHamisha, Israël"
    );

  const googleCalendarUrl =
    "https://calendar.google.com/" +
    "calendar/render" +
    "?action=TEMPLATE" +
    `&text=${title}` +
    `&dates=${startDate}/${endDate}` +
    `&details=${details}` +
    `&location=${location}`;

  if (calendarLink) {
    calendarLink.href =
      googleCalendarUrl;
  }

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mariage Ilona et Alon//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:mariage-ilona-alon-20261027",
    "DTSTAMP:20260825T000000Z",
    "DTSTART:20261027T154500Z",
    "DTEND:20261027T213000Z",
    "SUMMARY:Mariage Ilona & Alon",
    "DESCRIPTION:Kabalat Panim à 17h45. Houppa à 18h30 précises.",
    "LOCATION:Sakoya Event Hall, Maale HaHamisha, Israël",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  if (appleCalendarLink) {
    const calendarFile =
      new Blob(
        [icsContent],
        {
          type:
            "text/calendar;charset=utf-8"
        }
      );

    appleCalendarLink.href =
      URL.createObjectURL(
        calendarFile
      );

    appleCalendarLink.download =
      "mariage-ilona-et-alon.ics";
  }
}

/* =========================================
   COMPTE À REBOURS
   ========================================= */

function setCountdownValue(
  id,
  value
) {
  const element =
    document.getElementById(id);

  if (!element) {
    return;
  }

  element.textContent =
    String(value).padStart(
      2,
      "0"
    );
}

function updateCountdown() {
  const now =
    new Date();

  const distance =
    weddingDate.getTime() -
    now.getTime();

  const safeDistance =
    Math.max(
      distance,
      0
    );

  const days =
    Math.floor(
      safeDistance /
      (1000 * 60 * 60 * 24)
    );

  const hours =
    Math.floor(
      (
        safeDistance /
        (1000 * 60 * 60)
      ) % 24
    );

  const minutes =
    Math.floor(
      (
        safeDistance /
        (1000 * 60)
      ) % 60
    );

  const seconds =
    Math.floor(
      (
        safeDistance /
        1000
      ) % 60
    );

  /*
    Compte à rebours de l'invitation.
  */

  setCountdownValue(
    "days",
    days
  );

  setCountdownValue(
    "hours",
    hours
  );

  setCountdownValue(
    "minutes",
    minutes
  );

  setCountdownValue(
    "seconds",
    seconds
  );

  /*
    Même compte à rebours
    dans le loader.
  */

  setCountdownValue(
    "loaderDays",
    days
  );

  setCountdownValue(
    "loaderHours",
    hours
  );

  setCountdownValue(
    "loaderMinutes",
    minutes
  );

  setCountdownValue(
    "loaderSeconds",
    seconds
  );
}

/* =========================================
   ANIMATIONS AU SCROLL
   ========================================= */

function setupScrollReveal() {
  const elements =
    document.querySelectorAll(
      ".reveal-on-scroll"
    );

  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {
    elements.forEach(
      (element) => {
        element.classList.add(
          "is-visible"
        );
      }
    );

    return;
  }

  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach(
          (entry) => {
            if (
              entry.isIntersecting
            ) {
              entry.target
                .classList.add(
                  "is-visible"
                );

              observer.unobserve(
                entry.target
              );
            }
          }
        );
      },
      {
        threshold: 0.16,

        rootMargin:
          "0px 0px -40px 0px"
      }
    );

  elements.forEach(
    (element) => {
      observer.observe(
        element
      );
    }
  );
}

function revealVisibleElements() {
  const elements =
    document.querySelectorAll(
      ".reveal-on-scroll"
    );

  elements.forEach(
    (element) => {
      const rectangle =
        element
          .getBoundingClientRect();

      if (
        rectangle.top <
          window.innerHeight &&
        rectangle.bottom > 0
      ) {
        element.classList.add(
          "is-visible"
        );
      }
    }
  );
}

/* =========================================
   RSVP
   ========================================= */

async function handleRsvpSubmit(
  event
) {
  event.preventDefault();

  const guestSideElement =
    document.getElementById(
      "guestSide"
    );

  const guestNameElement =
    document.getElementById(
      "guestName"
    );

  const guestCountElement =
    document.getElementById(
      "guestCount"
    );

  const guestMessageElement =
    document.getElementById(
      "guestMessage"
    );

  const attendanceElement =
    document.querySelector(
      'input[name="attendance"]:checked'
    );

  if (
    !guestSideElement ||
    !guestNameElement ||
    !guestCountElement
  ) {
    alert(
      "Une partie du formulaire est manquante."
    );

    return;
  }

  const guestSide =
    guestSideElement.value;

  const guestName =
    guestNameElement
      .value
      .trim();

  const guestCount =
    guestCountElement.value;

  const guestMessage =
    guestMessageElement
      ? guestMessageElement
          .value
          .trim()
      : "";

  const attendance =
    attendanceElement
      ? attendanceElement.value
      : "yes";

  if (!guestSide) {
    alert(
      "Merci de choisir Côté Ilona ou Côté Alon."
    );

    return;
  }

  if (!guestName) {
    alert(
      "Merci d’indiquer votre nom complet."
    );

    return;
  }

  const attendanceText =
    attendance === "yes"
      ? "Oui, je viens"
      : "Non, je ne pourrai pas";

  const data = {
    side:
      guestSide,

    name:
      guestName,

    attendance:
      attendanceText,

    guestCount:
      guestCount,

    message:
      guestMessage
  };

  const submitButton =
    rsvpForm.querySelector(
      'button[type="submit"]'
    );

  if (submitButton) {
    submitButton.disabled =
      true;

    submitButton.textContent =
      "Envoi...";
  }

  try {
    await fetch(
      googleScriptUrl,
      {
        method:
          "POST",

        mode:
          "no-cors",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(data)
      }
    );

    alert(
      "Merci, votre réponse a bien été envoyée."
    );

    rsvpForm.reset();
  } catch (error) {
    alert(
      "Une erreur est survenue. Merci de réessayer."
    );
  } finally {
    if (submitButton) {
      submitButton.disabled =
        false;

      submitButton.textContent =
        "Envoyer";
    }
  }
}

/* =========================================
   ÉVÉNEMENTS
   ========================================= */

if (openEnvelope) {
  openEnvelope.addEventListener(
    "click",
    openInvitation
  );
}

if (musicToggle) {
  musicToggle.addEventListener(
    "click",
    toggleMusic
  );
}

if (weddingMusic) {
  weddingMusic.loop =
    false;

  weddingMusic.addEventListener(
    "play",
    updateMusicButton
  );

  weddingMusic.addEventListener(
    "pause",
    updateMusicButton
  );

  /*
    Vérification permanente pendant
    la lecture.

    Dès qu'on atteint 74 secondes,
    la musique est arrêtée.
  */

  weddingMusic.addEventListener(
    "timeupdate",
    checkMusicEnd
  );

  /*
    Si jamais le MP3 se termine
    naturellement avant.
  */

  weddingMusic.addEventListener(
    "ended",
    () => {
      musicReachedEnd =
        true;

      updateMusicButton();
    }
  );
}

if (rsvpForm) {
  rsvpForm.addEventListener(
    "submit",
    handleRsvpSubmit
  );
}

/* =========================================
   DÉMARRAGE
   ========================================= */

initializePageLoader();

createCalendarLinks();

/*
  Important :
  on calcule immédiatement le compte
  à rebours pour éviter de voir 00
  pendant la première seconde.
*/

updateCountdown();

setInterval(
  updateCountdown,
  1000
);

setupScrollReveal();

updateMusicButton();

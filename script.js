/* =========================================
   GOOGLE SHEETS
   ========================================= */

const googleScriptUrl =
  "https://script.google.com/macros/s/AKfycbxylv2YUyPssrzcc2WemS0XBZmtP3du4qBtdVrAQEsfMiL6b8NMiiKK2JP81KxG7jxeoQ/exec";

/* =========================================
   ÉLÉMENTS DE LA PAGE
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

const musicStartTime = 37;

let invitationOpened = false;

/* =========================================
   OUTILS
   ========================================= */

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function preloadImage(source) {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = resolve;
    image.onerror = resolve;

    image.src = source;
  });
}

/* =========================================
   PRÉCHARGEMENT DES POLICES
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
   PRÉCHARGEMENT DE LA MUSIQUE
   ========================================= */

function preloadAudio() {
  return new Promise((resolve) => {
    if (!weddingMusic) {
      resolve();
      return;
    }

    if (weddingMusic.readyState >= 2) {
      resolve();
      return;
    }

    let finished = false;

    function finish() {
      if (finished) {
        return;
      }

      finished = true;

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

    setTimeout(finish, 3500);

    try {
      weddingMusic.load();
    } catch (error) {
      finish();
    }
  });
}

/* =========================================
   ÉCRAN DE CHARGEMENT
   ========================================= */

function initializePageLoader() {
  /*
    Les fichiers se chargent sans pouvoir
    bloquer l’ouverture de la page.
  */

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
    4 secondes de remplissage du logo
    puis 1 seconde avec le logo complet.
  */

  setTimeout(() => {
    document.body.classList.add(
      "loader-finished"
    );

    document.body.classList.remove(
      "is-loading"
    );

    setTimeout(() => {
      const loader =
        document.getElementById(
          "pageLoader"
        );

      if (loader) {
        loader.remove();
      }
    }, 800);
  }, 5000);
}

/* =========================================
   MUSIQUE
   ========================================= */

function placeMusicAt37Seconds() {
  if (!weddingMusic) {
    return;
  }

  try {
    if (
      !Number.isFinite(
        weddingMusic.duration
      ) ||
      weddingMusic.duration >
        musicStartTime
    ) {
      weddingMusic.currentTime =
        musicStartTime;
    }
  } catch (error) {
    /*
      Le positionnement sera effectué
      après le chargement des informations.
    */
  }
}

function playMusic() {
  if (!weddingMusic) {
    return;
  }

  /*
    Si les informations sont déjà chargées,
    on place la musique à 37 secondes.
  */

  if (weddingMusic.readyState >= 1) {
    placeMusicAt37Seconds();
  } else {
    /*
      Sinon, on prépare le positionnement.
      On ne retarde pas l’appel à play(),
      pour que le téléphone autorise le son.
    */

    weddingMusic.addEventListener(
      "loadedmetadata",
      placeMusicAt37Seconds,
      { once: true }
    );
  }

  /*
    Cet appel est effectué directement
    pendant le clic sur l’enveloppe.
  */

  const playPromise =
    weddingMusic.play();

  if (
    playPromise &&
    typeof playPromise.then === "function"
  ) {
    playPromise
      .then(updateMusicButton)
      .catch(updateMusicButton);
  }
}

function toggleMusic() {
  if (!weddingMusic) {
    return;
  }

  if (weddingMusic.paused) {
    const playPromise =
      weddingMusic.play();

    if (
      playPromise &&
      typeof playPromise.then === "function"
    ) {
      playPromise
        .then(updateMusicButton)
        .catch(updateMusicButton);
    }
  } else {
    weddingMusic.pause();
    updateMusicButton();
  }
}

function updateMusicButton() {
  if (!musicToggle || !weddingMusic) {
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
      : "Arrêter la musique"
  );
}

/* =========================================
   OUVERTURE DE L’INVITATION
   ========================================= */

function openInvitation() {
  if (invitationOpened) {
    return;
  }

  invitationOpened = true;

  /*
    La musique est lancée directement
    depuis le clic sur l’enveloppe.
  */

  playMusic();

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
   CALENDRIERS
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

function setCountdownValue(id, value) {
  const element =
    document.getElementById(id);

  if (!element) {
    return;
  }

  element.textContent =
    String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();

  const distance =
    weddingDate.getTime() -
    now.getTime();

  const safeDistance =
    Math.max(distance, 0);

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
}

/* =========================================
   ANIMATIONS AU DÉFILEMENT
   ========================================= */

function setupScrollReveal() {
  const elements =
    document.querySelectorAll(
      ".reveal-on-scroll"
    );

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => {
      element.classList.add(
        "is-visible"
      );
    });

    return;
  }

  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin:
          "0px 0px -40px 0px"
      }
    );

  elements.forEach((element) => {
    observer.observe(element);
  });
}

function revealVisibleElements() {
  const elements =
    document.querySelectorAll(
      ".reveal-on-scroll"
    );

  elements.forEach((element) => {
    const rectangle =
      element.getBoundingClientRect();

    if (
      rectangle.top <
        window.innerHeight &&
      rectangle.bottom > 0
    ) {
      element.classList.add(
        "is-visible"
      );
    }
  });
}

/* =========================================
   FORMULAIRE RSVP
   ========================================= */

async function handleRsvpSubmit(event) {
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
    guestNameElement.value.trim();

  const guestCount =
    guestCountElement.value;

  const guestMessage =
    guestMessageElement
      ? guestMessageElement.value.trim()
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
    side: guestSide,
    name: guestName,
    attendance: attendanceText,
    guestCount: guestCount,
    message: guestMessage
  };

  const submitButton =
    rsvpForm.querySelector(
      'button[type="submit"]'
    );

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent =
      "Envoi...";
  }

  try {
    await fetch(
      googleScriptUrl,
      {
        method: "POST",
        mode: "no-cors",

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
      submitButton.disabled = false;
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
  weddingMusic.loop = false;

  weddingMusic.addEventListener(
    "play",
    updateMusicButton
  );

  weddingMusic.addEventListener(
    "pause",
    updateMusicButton
  );

  /*
    La chanson recommence à 37 secondes
    lorsqu’elle arrive à la fin.
  */

  weddingMusic.addEventListener(
    "ended",
    () => {
      placeMusicAt37Seconds();

      const replayPromise =
        weddingMusic.play();

      if (
        replayPromise &&
        typeof replayPromise.then === "function"
      ) {
        replayPromise
          .then(updateMusicButton)
          .catch(updateMusicButton);
      }
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

updateCountdown();

setInterval(
  updateCountdown,
  1000
);

setupScrollReveal();

updateMusicButton();
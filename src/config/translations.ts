export const translations = {
  pl: {
    sidebar: {
      newChat: "Nowa rozmowa",
      searchChats: "Szukaj rozmów",
      today: "Dziś",
      rename: "Zmień nazwę",
      delete: "Usuń",
      exportPdf: "Eksportuj jako PDF",
      settings: "Ustawienia",
      login: "Zaloguj się",
      logout: "Wyloguj się",
      guest: "Użytkownik",
      currentChat: "Bieżąca rozmowa",
      userMenu: "Menu użytkownika",
      deleteDialogTitle: "Usunąć rozmowę?",
      deleteDialogMessage: "Spowoduje to trwałe usunięcie rozmowy.",
      cancel: "Anuluj",
    },
    header: {
      title: "Asystent tworzenia przetargów",
      moreOptions: "Więcej opcji",
    },
    chat: {
      placeholder: "Wiadomość do Asystenta...",
      serverError: "❌ Błąd serwera!",
      requestCancelled: "⏹️ Żądanie anulowane.",
      formGenerated: "📄 Wygenerowano formularz",
      chatNotFoundTitle: "Nie można załadować rozmowy",
      chatNotFoundMessage: "Ta rozmowa już nie istnieje lub została usunięta.",
    },
    settings: {
      title: "Ustawienia",
      general: "Ogólne",
      account: "Konto",
      notifications: "Powiadomienia",
      accountFields: {
      },
      shortcuts: "Skróty",
      theme: "Motyw",
      close: "Zamknij",
      cancel: "Anuluj",
      confirm: "Potwierdź",
    },
  },
} as const;

export type Language = keyof typeof translations;

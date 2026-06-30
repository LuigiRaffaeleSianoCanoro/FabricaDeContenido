/**
 * Shared Clerk appearance for login/sign-up. Keeps the form inside the glass card
 * on all viewports (Tailwind v4 + Clerk require width constraints on nested elements).
 */
export const fabricaClerkAppearance = {
  variables: {
    colorPrimary: "#f97316",
    colorBackground: "transparent",
    colorText: "#f5f3f0",
    colorTextSecondary: "rgba(245,243,240,0.6)",
    colorInputText: "#f5f3f0",
    colorInputBackground: "rgba(255,255,255,0.06)",
    colorNeutral: "#ffffff",
    borderRadius: "0.85rem",
  },
  elements: {
    rootBox: "w-full min-w-0 max-w-full",
    cardBox: "w-full min-w-0 max-w-full border-0 bg-transparent shadow-none",
    card: "w-full min-w-0 max-w-full gap-5 border-0 bg-transparent p-0 shadow-none",
    main: "w-full min-w-0 max-w-full gap-4",
    scrollBox: "w-full min-w-0 max-w-full overflow-x-hidden",
    form: "w-full min-w-0 max-w-full gap-4",
    formFieldRow: "w-full min-w-0 max-w-full flex-wrap gap-3",
    formField: "w-full min-w-0",
    formFieldLabel: "text-white/80",
    formFieldInput:
      "box-border w-full min-w-0 max-w-full rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/40",
    formFieldInputGroup: "w-full min-w-0 max-w-full",
    phoneInputBox: "w-full min-w-0 max-w-full",
    socialButtons: "w-full min-w-0",
    socialButtonsBlockButton:
      "box-border w-full min-w-0 max-w-full rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10",
    socialButtonsBlockButtonText: "text-white/90",
    dividerLine: "bg-white/10",
    dividerText: "text-white/40",
    formButtonPrimary:
      "box-border w-full min-w-0 max-w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    footer: "w-full min-w-0 bg-transparent shadow-none",
    // Custom Spanish links live below the card — hide Clerk's duplicate footer CTA.
    footerAction: "hidden",
    footerActionText: "text-white/60",
    footerActionLink: "text-primary font-medium hover:text-primary/80",
    identityPreviewText: "text-white/80",
    formResendCodeLink: "text-primary",
    otpCodeFieldInputs: "w-full min-w-0 justify-center gap-2",
    otpCodeFieldInput:
      "box-border min-w-0 border-white/15 bg-white/5 text-white",
  },
} as const;

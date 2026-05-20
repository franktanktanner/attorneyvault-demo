import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Lock, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { useToast } from "../../hooks/useToast";

const EASE_VAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const FROM_NAME = "C. Jeffrey Stanley";
const FROM_EMAIL = "jeff@badboysbailbonds.com";

type Stage = "compose" | "sending" | "encrypting" | "success";

interface EmailComposeModalProps {
  open: boolean;
  onClose: () => void;
  attorneyName: string;
  attorneyEmail: string;
  initialSubject: string;
  initialBody: string;
}

export function EmailComposeModal({
  open,
  onClose,
  attorneyName,
  attorneyEmail,
  initialSubject,
  initialBody,
}: EmailComposeModalProps) {
  const [to, setTo] = useState(`${attorneyName} · ${attorneyEmail}`);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [stage, setStage] = useState<Stage>("compose");
  const [confirmClose, setConfirmClose] = useState(false);

  const initialRef = useRef({
    to: `${attorneyName} · ${attorneyEmail}`,
    subject: initialSubject,
    body: initialBody,
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Reset state every time the modal opens for a fresh draft
  useEffect(() => {
    if (open) {
      const nextTo = `${attorneyName} · ${attorneyEmail}`;
      setTo(nextTo);
      setSubject(initialSubject);
      setBody(initialBody);
      setStage("compose");
      setConfirmClose(false);
      initialRef.current = {
        to: nextTo,
        subject: initialSubject,
        body: initialBody,
      };
    }
  }, [open, attorneyName, attorneyEmail, initialSubject, initialBody]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Autofocus the textarea on open
  useEffect(() => {
    if (open && stage === "compose") {
      const id = window.setTimeout(() => {
        textareaRef.current?.focus();
        const ta = textareaRef.current;
        if (ta) ta.setSelectionRange(ta.value.length, ta.value.length);
      }, 280);
      return () => window.clearTimeout(id);
    }
  }, [open, stage]);

  // Grow the textarea to fit content
  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.max(ta.scrollHeight, 300)}px`;
  }, [body, open, stage]);

  const isDirty =
    to !== initialRef.current.to ||
    subject !== initialRef.current.subject ||
    body !== initialRef.current.body;

  const requestClose = useCallback(() => {
    if (stage === "sending" || stage === "encrypting") return;
    if (stage === "success") {
      onClose();
      return;
    }
    if (isDirty && !confirmClose) {
      setConfirmClose(true);
      return;
    }
    onClose();
  }, [stage, isDirty, confirmClose, onClose]);

  // ESC key + focus trap
  useEffect(() => {
    if (!open) return;
    const handler = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, requestClose]);

  // 3-stage send sequence
  const handleSend = useCallback(() => {
    if (stage !== "compose") return;
    setConfirmClose(false);
    setStage("sending");
    window.setTimeout(() => setStage("encrypting"), 800);
    window.setTimeout(() => setStage("success"), 1600);
  }, [stage]);

  // Auto-close 4s after success
  useEffect(() => {
    if (stage !== "success") return;
    const id = window.setTimeout(() => {
      toast("Sent · check Vault Mode audit for the entry", "success");
      onClose();
    }, 4000);
    return () => window.clearTimeout(id);
  }, [stage, toast, onClose]);

  const handleBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) requestClose();
  };

  const handleTextareaKeydown = (
    event: ReactKeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSend();
    }
  };

  const sendingLabel =
    stage === "sending"
      ? "SENDING..."
      : stage === "encrypting"
      ? "ENCRYPTING..."
      : "SEND";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="email-compose-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_VAULT }}
          onMouseDown={handleBackdrop}
          className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-10 bg-[rgba(20,18,14,0.6)] backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-compose-heading"
        >
          <motion.div
            ref={modalRef}
            key="email-compose-card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: EASE_VAULT }}
            className={cn(
              "relative w-full max-w-[640px] max-h-[90vh] flex flex-col bg-vault-paper border border-vault-hairline rounded-[4px] shadow-seal overflow-hidden",
              stage === "encrypting" && "vault-gold-pulse"
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {stage === "success" ? (
                <SuccessCard
                  key="success"
                  attorneyName={attorneyName}
                  onDone={onClose}
                />
              ) : (
                <motion.div
                  key="compose"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_VAULT }}
                  className="flex flex-col min-h-0"
                >
                  <Header
                    onClose={requestClose}
                    locked={stage === "sending" || stage === "encrypting"}
                  />

                  <div className="flex-1 overflow-y-auto px-7 pb-2">
                    <FieldRow
                      label="FROM"
                      value={`${FROM_NAME} · ${FROM_EMAIL}`}
                      readOnly
                    />
                    <FieldRow
                      label="TO"
                      value={to}
                      onChange={setTo}
                      disabled={stage !== "compose"}
                    />
                    <FieldRow
                      label="SUBJECT"
                      value={subject}
                      onChange={setSubject}
                      disabled={stage !== "compose"}
                    />

                    <div className="pt-5 pb-6">
                      <p className="label-eyebrow mb-2">BODY</p>
                      <textarea
                        ref={textareaRef}
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        onKeyDown={handleTextareaKeydown}
                        disabled={stage !== "compose"}
                        spellCheck
                        className="w-full resize-none bg-transparent border-0 p-0 font-sans text-[15px] leading-relaxed text-vault-ink placeholder:text-vault-graphite-light focus:outline-none focus:ring-0 disabled:opacity-70"
                        style={{ minHeight: 300 }}
                      />
                    </div>
                  </div>

                  <Footer
                    stage={stage}
                    sendingLabel={sendingLabel}
                    onCancel={requestClose}
                    onSend={handleSend}
                    confirmClose={confirmClose}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <style>{`
            @keyframes vault-gold-pulse {
              0%, 100% { box-shadow: 0 0 0 1px #E8E6E0, 0 8px 32px -12px rgba(10,10,10,0.08); }
              50% { box-shadow: 0 0 0 1px #A89074, 0 0 28px -4px rgba(168,144,116,0.55), 0 8px 32px -12px rgba(10,10,10,0.08); }
            }
            .vault-gold-pulse {
              animation: vault-gold-pulse 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
            }
          `}</style>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Header({ onClose, locked }: { onClose: () => void; locked: boolean }) {
  return (
    <div className="sticky top-0 z-10 bg-vault-paper px-7 pt-6 pb-5 border-b border-vault-hairline">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider-alt font-semibold text-vault-oxblood">
            COMPOSE · OUTBOUND
          </p>
          <h2
            id="email-compose-heading"
            className="mt-2 font-display font-light text-3xl text-vault-ink tracking-tighter-alt leading-none"
          >
            New Message
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close compose"
          onClick={onClose}
          disabled={locked}
          className="h-8 w-8 -mt-1 -mr-1 flex items-center justify-center text-vault-graphite hover:text-vault-ink hover:bg-vault-paper-deep rounded-[2px] transition-colors duration-300 ease-vault disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X strokeWidth={1.5} size={16} />
        </button>
      </div>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  value: string;
  onChange?: (next: string) => void;
  readOnly?: boolean;
  disabled?: boolean;
}

function FieldRow({ label, value, onChange, readOnly, disabled }: FieldRowProps) {
  return (
    <div className="grid grid-cols-[68px_1fr] items-baseline gap-4 py-3 border-b border-vault-hairline">
      <p className="label-eyebrow pt-0.5">{label}</p>
      {readOnly || !onChange ? (
        <p className="font-sans text-sm text-vault-ink truncate">{value}</p>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full bg-transparent border-0 p-0 font-sans text-sm text-vault-ink placeholder:text-vault-graphite-light focus:outline-none focus:ring-0 disabled:opacity-70"
        />
      )}
    </div>
  );
}

interface FooterProps {
  stage: Stage;
  sendingLabel: string;
  onCancel: () => void;
  onSend: () => void;
  confirmClose: boolean;
}

function Footer({
  stage,
  sendingLabel,
  onCancel,
  onSend,
  confirmClose,
}: FooterProps) {
  const isSending = stage === "sending" || stage === "encrypting";
  return (
    <div className="sticky bottom-0 z-10 bg-vault-paper px-7 py-4 border-t border-vault-hairline">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-wider-alt text-vault-graphite-light">
          DRAFT · AI-ASSISTED · VAULT-LOGGED
        </p>
        <div className="flex items-center gap-4">
          {confirmClose ? (
            <p className="font-mono text-[10px] uppercase tracking-wider-alt text-vault-oxblood">
              Click cancel again to discard
            </p>
          ) : null}
          <button
            type="button"
            onClick={onCancel}
            disabled={isSending}
            className="font-sans text-[11px] uppercase tracking-wider-alt font-medium text-vault-graphite hover:text-vault-ink transition-colors duration-300 ease-vault disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={isSending}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-wider-alt rounded-[2px] transition-all duration-500 ease-vault",
              "bg-vault-ink text-vault-paper hover:bg-vault-forest disabled:cursor-not-allowed disabled:opacity-90"
            )}
          >
            {isSending ? (
              <Loader2 strokeWidth={1.6} size={13} className="animate-spin" />
            ) : null}
            <span>{sendingLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessCard({
  attorneyName,
  onDone,
}: {
  attorneyName: string;
  onDone: () => void;
}) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE_VAULT }}
      className="px-10 py-14 flex flex-col items-center text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE_VAULT, delay: 0.05 }}
        className="h-16 w-16 rounded-full bg-vault-forest/10 border border-vault-forest/30 flex items-center justify-center"
      >
        <Check strokeWidth={1.8} size={28} className="text-vault-forest" />
      </motion.div>

      <p className="mt-6 font-mono text-[10px] uppercase tracking-wider-alt font-semibold text-vault-forest">
        OUTBOUND · ENCRYPTED · AUDITED
      </p>
      <h3 className="mt-3 font-display font-light text-3xl text-vault-ink tracking-tighter-alt leading-tight">
        Sent · Logged to Vault
      </h3>
      <p className="mt-4 max-w-md text-sm text-vault-graphite leading-relaxed">
        Email delivered to {attorneyName}. Entry written to audit trail.
        Concierge desk notified for follow-up tracking.
      </p>

      <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider-alt text-vault-graphite-light">
        <Lock strokeWidth={1.5} size={11} />
        <span>End-to-end · vault audit ID assigned</span>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="mt-9 inline-flex items-center px-7 py-3 font-sans text-[11px] font-semibold uppercase tracking-wider-alt rounded-[2px] bg-vault-ink text-vault-paper hover:bg-vault-forest transition-colors duration-500 ease-vault"
      >
        Done
      </button>
    </motion.div>
  );
}

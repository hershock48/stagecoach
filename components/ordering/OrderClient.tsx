"use client";

// The guest side of online ordering.
//
// One client component on purpose: the cart, the menu and the checkout are one
// conversation, and splitting them across a server boundary would mean lifting
// this state somewhere worse. The menu data itself arrives as a prop from the
// server page, so the only fetches here are live state and the order itself.
//
// The order fee is disclosed twice before any card could ever be involved:
// in the banner above the menu and as a labeled line in the cart. That is the
// whole compliance posture (surprise fees are the sin, small fees are not),
// and it is also the pitch, so it is written in the bar's voice, not buried.

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OrderableSection } from "@/lib/ordering/menu";

type LiveState = {
  open: boolean;
  reason: string;
  unavailable: string[];
  quoteMinutes: number;
  feeCents: number;
  feeLabel: string;
  feeExplainer: string;
  taxRate: number;
  demo: boolean;
};

type CartLine = {
  key: string;
  itemId: string;
  name: string;
  unitCents: number;
  qty: number;
  options: string[];
  ageRestricted: boolean;
};

type Confirmation = {
  id: string;
  number: number;
  quotedMinutes: number;
  totalCents: number;
  emailedTo: string;
  payAtPickup: boolean;
  status: "new" | "accepted" | "done" | "refunded";
};

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function OrderClient({ sections }: { sections: OrderableSection[] }) {
  const [live, setLive] = useState<LiveState | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const refreshLive = useCallback(async () => {
    try {
      const r = await fetch("/api/ordering/state", { cache: "no-store" });
      if (r.ok) setLive(await r.json());
    } catch {
      /* keep the last known state; the order POST is the arbiter anyway */
    }
  }, []);

  useEffect(() => {
    let alive = true;
    // Deferred, not inline: see the note in KitchenClient. Same rule, same fix.
    const tick = () => {
      if (alive) refreshLive();
    };
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 30000);
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(t);
    };
  }, [refreshLive]);

  // Confirmation polling: the "Accepted" flip is the product moment, worth a
  // 5 second poll for the few minutes anyone watches this screen.
  useEffect(() => {
    if (!confirmation || confirmation.status === "done" || confirmation.status === "refunded") return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/ordering/order?id=${confirmation.id}`, { cache: "no-store" });
        if (r.ok) {
          const data = await r.json();
          setConfirmation((c) => (c ? { ...c, status: data.status } : c));
        }
      } catch {
        /* transient; next tick retries */
      }
    }, 5000);
    return () => clearInterval(t);
  }, [confirmation]);

  const unavailable = useMemo(() => new Set(live?.unavailable ?? []), [live]);

  function addToCart(line: Omit<CartLine, "key" | "qty">) {
    const key = `${line.itemId}|${[...line.options].sort().join(",")}`;
    setCart((c) => {
      const existing = c.find((l) => l.key === key);
      if (existing) {
        return c.map((l) => (l.key === key ? { ...l, qty: Math.min(12, l.qty + 1) } : l));
      }
      return [...c, { ...line, key, qty: 1 }];
    });
    setOpenItem(null);
  }

  function setQty(key: string, qty: number) {
    setCart((c) =>
      qty <= 0 ? c.filter((l) => l.key !== key) : c.map((l) => (l.key === key ? { ...l, qty } : l))
    );
  }

  const subtotal = cart.reduce((s, l) => s + l.unitCents * l.qty, 0);
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const hasAlcohol = cart.some((l) => l.ageRestricted);

  if (confirmation) {
    return <Confirmed confirmation={confirmation} />;
  }

  return (
    <div className="pb-28">
      {/* Functional status only. This banner briefly carried a paragraph about
          the fee and the no-delivery-apps model, and Kevin killed it: "it reads
          more client facing." Guests get what a Toast or Menufy page would give
          them, a pickup time and nothing to read. The fee is disclosed the way
          guests expect fees: a line of small print below the menu and a labeled
          line in the cart, both before anything is placed. The story of where
          the fee goes is for the owner pitch, not the menu.

          The pickup quote wears the site's own status chip, the same classes
          LiveStatus renders in the header (Kevin's call: like the open-now
          sign). Same pulsing dot, so a number that moves with the kitchen's
          busy dial looks like a number that moves. Closed and paused keep the
          quiet bordered note, because their copy runs a sentence long and a
          pill chip is built for six words. */}
      <div className="mb-10">
        {!live ? (
          <span className="status-chip status-chip-idle" aria-hidden="true" />
        ) : !live.open ? (
          <div className="rounded-sm border border-cream-dim bg-cream px-5 py-4 text-sm leading-relaxed text-red">
            {live.reason}
          </div>
        ) : (
          <span className="status-chip status-open" role="status">
            <span className="status-dot" aria-hidden="true" />
            <b>Taking orders</b>
            <span className="status-sep">·</span>
            <span className="status-detail">ready in about {live.quoteMinutes} minutes</span>
          </span>
        )}
      </div>

      {sections.map((section) => (
        <section key={section.name} aria-label={section.name} className="mb-12">
          <h2 className="display mb-1 text-2xl uppercase text-ink">{section.name}</h2>
          {section.ageRestricted && (
            <p className="mb-4 text-xs text-muted">
              21 and over. A valid ID gets checked at pickup, same as at the bar.
            </p>
          )}
          <ul className="mt-4 divide-y divide-cream-dim border-y border-cream-dim">
            {section.items.map((item) => {
              const soldOut = unavailable.has(item.id);
              const isOpen = openItem === item.id;
              return (
                <li key={item.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex min-w-0 gap-4 ${soldOut ? "opacity-45" : ""}`}>
                      {/* Photo only when a real one exists; no placeholder
                          boxes. Photos are the club's own Toast uploads via toast-menu.json. */}
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={72}
                          height={72}
                          className="mt-1 h-18 w-18 flex-none rounded-sm object-cover"
                        />
                      )}
                      <div>
                      <p className="text-base text-ink">
                        {item.name}
                        {soldOut && (
                          <span className="display ml-3 text-[11px] uppercase tracking-widest text-red">
                            Sold out tonight
                          </span>
                        )}
                      </p>
                      {item.desc && (
                        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">{item.desc}</p>
                      )}
                      </div>
                    </div>
                    <div className="flex flex-none items-center gap-4">
                      <span className="text-sm text-muted tabular-nums">{money(item.priceCents)}</span>
                      <button
                        type="button"
                        disabled={soldOut || !live?.open}
                        onClick={() =>
                          item.options.length > 0
                            ? setOpenItem(isOpen ? null : item.id)
                            : addToCart({
                                itemId: item.id,
                                name: item.name,
                                unitCents: item.priceCents,
                                options: [],
                                ageRestricted: item.ageRestricted,
                              })
                        }
                        className="display rounded-sm border border-red px-4 py-2 text-xs uppercase tracking-widest text-red transition-colors hover:bg-red hover:text-cream-light disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-red"
                        aria-expanded={item.options.length > 0 ? isOpen : undefined}
                      >
                        {item.options.length > 0 ? "Choose" : "Add"}
                      </button>
                    </div>
                  </div>
                  {isOpen && !soldOut && (
                    <OptionPicker
                      item={item}
                      onAdd={(options, unitCents) =>
                        addToCart({
                          itemId: item.id,
                          name: item.name,
                          unitCents,
                          options,
                          ageRestricted: item.ageRestricted,
                        })
                      }
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {/* Cart bar: always reachable, never in the way. */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-dim bg-cream-light/95 px-5 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {cartCount} item{cartCount === 1 ? "" : "s"} · <span className="text-ink tabular-nums">{money(subtotal)}</span>
            </p>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="display rounded-sm bg-red px-6 py-3 text-sm uppercase tracking-widest text-cream-light transition-colors hover:bg-red-light"
            >
              Review order
            </button>
          </div>
        </div>
      )}

      {cartOpen && live && (
        <Checkout
          live={live}
          cart={cart}
          subtotal={subtotal}
          hasAlcohol={hasAlcohol}
          setQty={setQty}
          placing={placing}
          error={error}
          onClose={() => setCartOpen(false)}
          onPlace={async (form) => {
            setPlacing(true);
            setError("");
            try {
              const r = await fetch("/api/ordering/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  guestName: form.name,
                  guestPhone: form.phone,
                  guestEmail: form.email,
                  note: form.note,
                  tipCents: form.tipCents,
                  ageAcknowledged: form.ageAcknowledged,
                  payAtPickup: form.payAtPickup,
                  lines: cart.map((l) => ({ itemId: l.itemId, qty: l.qty, options: l.options })),
                }),
              });
              const data = await r.json();
              if (!r.ok) {
                setError(data.error ?? "Something went wrong. The phone still works.");
                refreshLive(); // an 86 or a pause mid-checkout shows up right away
              } else {
                setConfirmation({
                  id: data.id,
                  number: data.number,
                  quotedMinutes: data.quotedMinutes,
                  totalCents: data.totals.totalCents,
                  emailedTo: form.email,
                  payAtPickup: form.payAtPickup,
                  status: "new",
                });
                setCart([]);
                setCartOpen(false);
              }
            } catch {
              setError("Could not reach the kitchen. Check your connection and try again, or call the bar.");
            } finally {
              setPlacing(false);
            }
          }}
        />
      )}
    </div>
  );
}

/* ------------------------- option picker ------------------------- */

function OptionPicker({
  item,
  onAdd,
}: {
  item: OrderableSection["items"][number];
  onAdd: (options: string[], unitCents: number) => void;
}) {
  const [picked, setPicked] = useState<Record<string, string[]>>({});

  const chosen = Object.values(picked).flat();
  const optionCents = item.options
    .flatMap((g) => g.choices)
    .filter((c) => chosen.includes(c.name))
    .reduce((s, c) => s + c.priceCents, 0);
  const ready = item.options.every(
    (g) => !g.required || (picked[g.name]?.length ?? 0) >= 1
  );

  return (
    <div className="mt-4 rounded-sm border border-cream-dim bg-cream p-4">
      {item.options.map((group) => (
        <fieldset key={group.name} className="mb-4 last:mb-0">
          <legend className="display mb-2 text-xs uppercase tracking-widest text-red">
            {group.name}
            {!group.required && <span className="ml-2 normal-case tracking-normal text-muted">optional</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.choices.map((choice) => {
              const on = picked[group.name]?.includes(choice.name) ?? false;
              return (
                <label
                  key={choice.name}
                  className={`cursor-pointer rounded-sm border px-3 py-2 text-sm transition-colors ${
                    on
                      ? "border-red bg-red text-cream-light"
                      : "border-cream-dim text-muted hover:border-red-light"
                  }`}
                >
                  <input
                    type={group.required && !group.multi ? "radio" : "checkbox"}
                    name={`${item.id}-${group.name}`}
                    checked={on}
                    onChange={() =>
                      setPicked((p) => {
                        const current = p[group.name] ?? [];
                        if (group.multi) {
                          // Toppings-style: toggle in and out of the set.
                          return {
                            ...p,
                            [group.name]: on ? current.filter((n) => n !== choice.name) : [...current, choice.name],
                          };
                        }
                        return {
                          ...p,
                          [group.name]: group.required ? [choice.name] : on ? [] : [choice.name],
                        };
                      })
                    }
                    className="sr-only"
                  />
                  {choice.name}
                  {choice.priceCents > 0 && ` +${money(choice.priceCents)}`}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={!ready}
        onClick={() => onAdd(chosen, item.priceCents + optionCents)}
        className="display mt-2 rounded-sm bg-red px-5 py-2.5 text-xs uppercase tracking-widest text-cream-light transition-colors hover:bg-red-light disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add · {money(item.priceCents + optionCents)}
      </button>
    </div>
  );
}

/* ---------------------------- checkout ---------------------------- */

function Checkout({
  live,
  cart,
  subtotal,
  hasAlcohol,
  setQty,
  placing,
  error,
  onClose,
  onPlace,
}: {
  live: LiveState;
  cart: CartLine[];
  subtotal: number;
  hasAlcohol: boolean;
  setQty: (key: string, qty: number) => void;
  placing: boolean;
  error: string;
  onClose: () => void;
  onPlace: (form: { name: string; phone: string; email: string; note: string; tipCents: number; ageAcknowledged: boolean; payAtPickup: boolean }) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [tipPct, setTipPct] = useState<number | null>(null);
  const [ageOk, setAgeOk] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const tipCents = tipPct === null ? 0 : Math.round((subtotal * tipPct) / 100);
  const taxCents = Math.round((subtotal + live.feeCents) * live.taxRate);
  const total = subtotal + live.feeCents + tipCents + taxCents;
  const canPlace =
    cart.length > 0 && name.trim().length > 0 && phone.replace(/\D/g, "").length >= 10 && (!hasAlcohol || ageOk) && !placing && live.open;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center" role="dialog" aria-modal="true" aria-label="Your order">
      <div
        ref={panelRef}
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto border border-cream-dim bg-white p-5 sm:rounded-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-xl uppercase text-ink">Your order</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm px-3 py-1.5 text-sm text-muted hover:text-ink"
          >
            Back to menu
          </button>
        </div>

        <ul className="divide-y divide-cream-dim border-y border-cream-dim">
          {cart.map((line) => (
            <li key={line.key} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm text-ink">{line.name}</p>
                {line.options.length > 0 && (
                  <p className="text-xs text-muted">{line.options.join(", ")}</p>
                )}
              </div>
              <div className="flex flex-none items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty(line.key, line.qty - 1)}
                  aria-label={`Remove one ${line.name}`}
                  className="h-8 w-8 rounded-sm border border-cream-dim text-muted hover:border-red-light"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm text-ink tabular-nums">{line.qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(line.key, Math.min(12, line.qty + 1))}
                  aria-label={`Add one ${line.name}`}
                  className="h-8 w-8 rounded-sm border border-cream-dim text-muted hover:border-red-light"
                >
                  +
                </button>
                <span className="w-16 text-right text-sm text-muted tabular-nums">
                  {money(line.unitCents * line.qty)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Totals, with the fee named and explained where the money is. */}
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{money(subtotal)}</dd>
          </div>
          {/* Just the fee, labeled and priced, like every checkout a guest has
              ever seen. The where-it-goes story was here once and Kevin cut
              it: "nobody gives a shit." He is right about guests. The split is
              for owners, in the pitch. */}
          <div className="flex justify-between text-muted">
            <dt>Order fee</dt>
            <dd className="tabular-nums">{money(live.feeCents)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Tax</dt>
            <dd className="tabular-nums">{money(taxCents)}</dd>
          </div>
          <div className="flex items-center justify-between text-muted">
            <dt>Tip for the crew</dt>
            <dd className="flex gap-1.5">
              {[null, ...live ? [10, 15, 20] : []].map((pct) => (
                <button
                  key={pct === null ? "none" : pct}
                  type="button"
                  onClick={() => setTipPct(pct)}
                  className={`rounded-sm border px-2.5 py-1 text-xs transition-colors ${
                    tipPct === pct ? "border-red bg-red text-cream-light" : "border-cream-dim text-muted hover:border-red-light"
                  }`}
                >
                  {pct === null ? "None" : `${pct}%`}
                </button>
              ))}
            </dd>
          </div>
          {tipCents > 0 && (
            <div className="flex justify-between text-muted">
              <dt>Tip amount</dt>
              <dd className="tabular-nums">{money(tipCents)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-cream-dim pt-2 text-base text-ink">
            <dt>Total</dt>
            <dd className="tabular-nums">{money(total)}</dd>
          </div>
        </dl>

        <div className="mt-5 space-y-3">
          <label className="block text-sm text-muted">
            Name for the order
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="mt-1 w-full rounded-sm border border-cream-dim bg-cream px-3 py-2.5 text-ink outline-none focus:border-red-light"
            />
          </label>
          <label className="block text-sm text-muted">
            Phone, in case the kitchen has a question
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              autoComplete="tel"
              className="mt-1 w-full rounded-sm border border-cream-dim bg-cream px-3 py-2.5 text-ink outline-none focus:border-red-light"
            />
          </label>
          <label className="block text-sm text-muted">
            Email for your confirmation <span className="text-muted">(optional)</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-sm border border-cream-dim bg-cream px-3 py-2.5 text-ink outline-none focus:border-red-light"
            />
          </label>
          <label className="block text-sm text-muted">
            Anything the kitchen should know <span className="text-muted">(optional)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              className="mt-1 w-full rounded-sm border border-cream-dim bg-cream px-3 py-2.5 text-ink outline-none focus:border-red-light"
            />
          </label>
          {hasAlcohol && (
            <label className="flex items-start gap-3 rounded-sm border border-cream-dim bg-cream px-3 py-3 text-sm text-muted">
              <input
                type="checkbox"
                checked={ageOk}
                onChange={(e) => setAgeOk(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#902828]"
              />
              <span>
                This order has drinks in it. Whoever picks it up is 21 or over and will show a valid ID at the counter.
              </span>
            </label>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-sm border border-[#d9736b]/40 bg-[#d9736b]/10 px-3 py-2.5 text-sm text-[#d9736b]">
            {error}
          </p>
        )}

        {/* Prepay is the road; cash is the shoulder. One big button pays
            online (the Stripe path when it lands), and the counter option is
            a single quiet click below it -- present because Toast's page
            offers it today, unadvertised because prepay kills no-shows. */}
        <button
          type="button"
          disabled={!canPlace}
          onClick={() => onPlace({ name: name.trim(), phone, email: email.trim(), note, tipCents, ageAcknowledged: ageOk, payAtPickup: false })}
          className="display mt-5 w-full rounded-sm bg-red px-6 py-4 text-sm uppercase tracking-widest text-cream-light transition-colors hover:bg-red-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {placing ? "Sending to the kitchen" : `Pay ${money(total)} · place order`}
        </button>
        <button
          type="button"
          disabled={!canPlace}
          onClick={() => onPlace({ name: name.trim(), phone, email: email.trim(), note, tipCents, ageAcknowledged: ageOk, payAtPickup: true })}
          className="mt-3 w-full rounded-sm px-2 py-2 text-center text-sm text-muted underline decoration-cream-dim underline-offset-4 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          or pay cash or card at pickup
        </button>
        {live.demo && (
          <p className="mt-3 text-center text-xs text-muted">{`Demo checkout. No card is charged.`}</p>
        )}
      </div>
    </div>
  );
}

/* -------------------------- confirmation -------------------------- */

function Confirmed({ confirmation }: { confirmation: Confirmation }) {
  if (confirmation.status === "refunded") {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <p className="display text-xs uppercase tracking-[0.3em] text-red">Order #{confirmation.number}</p>
        <p className="display mt-4 text-4xl uppercase text-ink">Refunded</p>
        <p className="mt-6 text-base leading-relaxed text-muted">
          Your {money(confirmation.totalCents)} is on its way back. Card refunds usually show up in 5 to 10
          business days, depending on your bank.{confirmation.emailedTo ? " A confirmation is in your email." : ""}
        </p>
      </div>
    );
  }
  const accepted = confirmation.status !== "new";
  return (
    <div className="mx-auto max-w-lg py-10 text-center">
      <p className="display text-xs uppercase tracking-[0.3em] text-red">Order in</p>
      <p className="display mt-4 text-7xl text-ink tabular-nums">#{confirmation.number}</p>
      <p className="mt-6 text-base leading-relaxed text-muted">
        {accepted
          ? `The kitchen has it. See you in about ${confirmation.quotedMinutes} minutes.`
          : `Sent to the kitchen. Ready in about ${confirmation.quotedMinutes} minutes.`}
      </p>
      {confirmation.emailedTo && (
        <p className="mt-2 text-sm text-muted">Confirmation sent to {confirmation.emailedTo}.</p>
      )}
      <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-3 rounded-sm border border-cream-dim bg-cream px-4 py-3">
        <span
          className={`h-2.5 w-2.5 flex-none rounded-full ${accepted ? "bg-[#7dd18a]" : "bg-red-light"}`}
          aria-hidden
        />
        <p className="text-sm text-muted">
          {accepted ? "Accepted by the kitchen" : "Waiting for the kitchen to accept"}
        </p>
      </div>
      <p className="mt-8 text-sm text-muted">
        {confirmation.payAtPickup
          ? `Total ${money(confirmation.totalCents)} · cash or card at the counter`
          : `Total ${money(confirmation.totalCents)} · pay at pickup in this demo`}
      </p>
      <a
        href="/order"
        className="display mt-10 inline-block rounded-sm border border-red px-6 py-3 text-xs uppercase tracking-widest text-red transition-colors hover:bg-red hover:text-cream-light"
      >
        Start another order
      </a>
    </div>
  );
}

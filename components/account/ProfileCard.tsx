"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/(auth)/actions";

/**
 * Profile editor. Only the display name is editable here — `role` is set by an
 * admin and the database trigger `profiles_protect_role` silently reverts any
 * attempt to change your own, so offering the field would be a lie.
 */
export function ProfileCard({
  email,
  displayName,
  role,
  memberSince,
  updateAction,
}: {
  email: string | null;
  displayName: string | null;
  role: string;
  memberSince: string | null;
  updateAction: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(updateAction, {});

  return (
    <section className="acct__card" aria-labelledby="acct-profile">
      <h2 className="acct__card-title" id="acct-profile">
        Profile
      </h2>

      <dl className="acct__facts">
        <div>
          <dt>Email</dt>
          <dd>{email ?? "—"}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>
            <span className={`acct__role acct__role--${role}`}>{role}</span>
          </dd>
        </div>
        {memberSince && (
          <div>
            <dt>Member since</dt>
            <dd>
              <time dateTime={memberSince}>
                {new Date(memberSince).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </dd>
          </div>
        )}
      </dl>

      <form action={formAction} className="acct__form">
        <label className="acct__field">
          <span className="acct__label">Display name</span>
          <input
            type="text"
            name="display_name"
            className="acct__input"
            defaultValue={displayName ?? ""}
            placeholder="How you want to be credited"
            maxLength={80}
          />
        </label>
        <SaveButton />
      </form>

      <div aria-live="polite" className="acct__messages">
        {state.error && (
          <p className="acct__msg acct__msg--error" role="alert">
            {state.error}
          </p>
        )}
        {state.notice && <p className="acct__msg acct__msg--notice">{state.notice}</p>}
      </div>
    </section>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="acct__btn" disabled={pending}>
      {pending ? "Saving…" : "Save profile"}
    </button>
  );
}

"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Collection } from "@/lib/collections";
import type { ActionResult } from "@/app/account/actions";

type Action = (state: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * The user's collections: create, rename, delete, and remove saved components.
 *
 * Deletion asks for confirmation inline rather than through `window.confirm`,
 * which is unstyleable, easy to mis-click, and blocks the whole tab.
 */
export function CollectionsPanel({
  collections,
  createAction,
  renameAction,
  deleteAction,
  membershipAction,
}: {
  collections: Collection[];
  createAction: Action;
  renameAction: Action;
  deleteAction: Action;
  membershipAction: Action;
}) {
  const [createState, create] = useActionState<ActionResult, FormData>(createAction, {});

  const savedCount = collections.reduce((n, c) => n + c.items.length, 0);

  return (
    <section className="acct__card" aria-labelledby="acct-collections">
      <h2 className="acct__card-title" id="acct-collections">
        Collections
      </h2>
      <p className="acct__card-lede">
        {collections.length === 0
          ? "Group components into named sets you can come back to."
          : `${collections.length} collection${collections.length === 1 ? "" : "s"} · ${savedCount} saved component${savedCount === 1 ? "" : "s"}`}
      </p>

      <form action={create} className="acct__inline-form">
        <label className="acct__field acct__field--grow">
          <span className="acct__label">New collection</span>
          <input
            type="text"
            name="name"
            className="acct__input"
            placeholder="e.g. Checkout flow"
            maxLength={80}
            required
          />
        </label>
        <PendingButton label="Create" pendingLabel="Creating…" />
      </form>

      <div aria-live="polite" className="acct__messages">
        {createState.error && (
          <p className="acct__msg acct__msg--error" role="alert">
            {createState.error}
          </p>
        )}
        {createState.notice && (
          <p className="acct__msg acct__msg--notice">{createState.notice}</p>
        )}
      </div>

      {collections.length === 0 ? (
        <p className="acct__empty">
          Nothing saved yet. Open any component in the{" "}
          <Link href="/knowledge">Knowledge Hub</Link> and use{" "}
          <strong>Save to collection</strong>.
        </p>
      ) : (
        <ul className="acct__collections">
          {collections.map((collection) => (
            <CollectionRow
              key={collection.id}
              collection={collection}
              renameAction={renameAction}
              deleteAction={deleteAction}
              membershipAction={membershipAction}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function CollectionRow({
  collection,
  renameAction,
  deleteAction,
  membershipAction,
}: {
  collection: Collection;
  renameAction: Action;
  deleteAction: Action;
  membershipAction: Action;
}) {
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [renameState, rename] = useActionState<ActionResult, FormData>(renameAction, {});
  const [, remove] = useActionState<ActionResult, FormData>(deleteAction, {});
  const [, setMembership] = useActionState<ActionResult, FormData>(membershipAction, {});

  return (
    <li className="acct__collection">
      <div className="acct__collection-head">
        {renaming ? (
          <form
            action={(formData) => {
              rename(formData);
              setRenaming(false);
            }}
            className="acct__inline-form"
          >
            <input type="hidden" name="id" value={collection.id} />
            <label className="acct__field acct__field--grow">
              <span className="acct__label">Name</span>
              <input
                type="text"
                name="name"
                className="acct__input"
                defaultValue={collection.name}
                maxLength={80}
                required
                autoFocus
              />
            </label>
            <PendingButton label="Save" pendingLabel="Saving…" />
            <button
              type="button"
              className="acct__btn acct__btn--ghost"
              onClick={() => setRenaming(false)}
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <h3 className="acct__collection-name">{collection.name}</h3>
            <span className="acct__collection-count">
              {collection.items.length}
            </span>
            <div className="acct__collection-actions">
              <button
                type="button"
                className="acct__btn acct__btn--ghost"
                onClick={() => setRenaming(true)}
              >
                Rename
              </button>
              {confirming ? (
                <form action={remove} className="acct__confirm">
                  <input type="hidden" name="id" value={collection.id} />
                  <span className="acct__confirm-text">Delete this collection?</span>
                  <button type="submit" className="acct__btn acct__btn--danger">
                    Delete
                  </button>
                  <button
                    type="button"
                    className="acct__btn acct__btn--ghost"
                    onClick={() => setConfirming(false)}
                  >
                    Keep
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="acct__btn acct__btn--ghost"
                  onClick={() => setConfirming(true)}
                >
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {renameState.error && (
        <p className="acct__msg acct__msg--error" role="alert">
          {renameState.error}
        </p>
      )}

      {collection.items.length === 0 ? (
        <p className="acct__collection-empty">Empty.</p>
      ) : (
        <ul className="acct__items">
          {collection.items.map((item) => (
            <li key={item.component_id} className="acct__item">
              <Link href={`/knowledge/${item.slug}`} className="acct__item-link">
                {item.name}
              </Link>
              <form action={setMembership} className="acct__item-remove">
                <input type="hidden" name="collection_id" value={collection.id} />
                <input type="hidden" name="slug" value={item.slug} />
                <input type="hidden" name="member" value="0" />
                <button
                  type="submit"
                  className="acct__x"
                  aria-label={`Remove ${item.name} from ${collection.name}`}
                >
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function PendingButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="acct__btn" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}
